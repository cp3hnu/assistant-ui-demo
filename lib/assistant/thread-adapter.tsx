"use client";

import {
  RuntimeAdapterProvider,
  useAui,
  type RemoteThreadListAdapter,
  type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { useMemo, type ReactNode } from "react";

type StoredMessageRow = {
  id: string;
  parentId: string | null;
  format: string;
  content: Record<string, unknown>;
};

type ThreadRow = {
  id: string;
  title: string | null;
  status: "regular" | "archived";
  updatedAt?: string | Date;
};

function useThreadListAdapters() {
  const aui = useAui();

  const history = useMemo<ThreadHistoryAdapter>(
    () => ({
      async load() {
        return { messages: [] };
      },
      async append() {},
      withFormat: (fmt) => ({
        async load() {
          const { remoteId } = aui.threadListItem.getState();
          if (!remoteId) return { messages: [] };

          const res = await fetch(`/api/threads/${remoteId}/messages`);
          if (!res.ok) return { messages: [] };

          const rows = (await res.json()) as StoredMessageRow[];
          return {
            messages: rows.map((row) =>
              fmt.decode({
                id: row.id,
                parent_id: row.parentId,
                format: row.format,
                content: row.content as Parameters<typeof fmt.decode>[0]["content"],
              }),
            ),
          };
        },
        async append(item) {
          const { remoteId } = await aui.threadListItem.initialize();
          await fetch(`/api/threads/${remoteId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: fmt.getId(item.message),
              parent_id: item.parentId,
              format: fmt.format,
              content: fmt.encode(item),
            }),
          });
        },
        async update(item, localMessageId) {
          const { remoteId } = await aui.threadListItem.initialize();
          await fetch(`/api/threads/${remoteId}/messages/${localMessageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              format: fmt.format,
              content: fmt.encode(item),
            }),
          });
        },
      }),
    }),
    [aui],
  );

  return useMemo(() => ({ history }), [history]);
}

function ThreadAdapterProvider({ children }: { children?: ReactNode }) {
  const adapters = useThreadListAdapters();
  return (
    <RuntimeAdapterProvider adapters={adapters}>
      {children}
    </RuntimeAdapterProvider>
  );
}

export const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    const rows = (await fetch("/api/threads").then((r) => r.json())) as ThreadRow[];
    return {
      threads: rows.map((t) => ({
        status: t.status,
        remoteId: t.id,
        title: t.title ?? undefined,
        lastMessageAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
      })),
    };
  },

  async initialize(_threadId) {
    const { id } = (await fetch("/api/threads", { method: "POST" }).then((r) =>
      r.json(),
    )) as { id: string };
    return { remoteId: id };
  },

  async rename(remoteId, title) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  },

  async archive(remoteId) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
  },

  async unarchive(remoteId) {
    await fetch(`/api/threads/${remoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "regular" }),
    });
  },

  async delete(remoteId) {
    await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
  },

  async fetch(remoteId) {
    const t = (await fetch(`/api/threads/${remoteId}`).then((r) =>
      r.json(),
    )) as ThreadRow;
    return {
      status: t.status,
      remoteId: t.id,
      title: t.title ?? undefined,
      lastMessageAt: t.updatedAt ? new Date(t.updatedAt) : undefined,
    };
  },

  async generateTitle(remoteId, messages) {
    return createAssistantStream(async (controller) => {
      const { title } = (await fetch(`/api/threads/${remoteId}/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      }).then((r) => r.json())) as { title: string };
      controller.appendText(title);
    });
  },

  unstable_useAdapters: useThreadListAdapters,
  unstable_Provider: ThreadAdapterProvider,
};
