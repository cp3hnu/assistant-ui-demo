"use client";

import {
  AssistantRuntimeProvider,
  AuiConfig,
  Tools,
  useRemoteThreadListRuntime,
} from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Thread } from "@/components/assistant-ui/thread";
import toolkit from "@/tools";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { DevToolsModal } from "@assistant-ui/react-devtools";
import { threadListAdapter } from "@/lib/assistant/thread-adapter";

export const Assistant = () => {
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () =>
      useChatRuntime({
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        transport: new AssistantChatTransport({
          api: "/api/chat",
        }),
      }),
    adapter: threadListAdapter,
  });

  const config = AuiConfig({
    tools: Tools({
      toolkit: toolkit,
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} config={config}>
      <DevToolsModal />
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="text-sm font-medium">My Assistant</span>
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
};
