import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { DEMO_USER_ID } from "@/db/constants";
import { threads } from "@/db/schema";
import { getOwnedThread } from "@/lib/db/thread-access";

type RouteContext = { params: Promise<{ id: string }> };

type MessageLike = {
  role?: string;
  content?: unknown;
  parts?: unknown;
};

function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(
      (p): p is { type: string; text: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as { type?: string }).type === "text" &&
        typeof (p as { text?: string }).text === "string",
    )
    .map((p) => p.text)
    .join(" ")
    .trim();
}

/** assistant-ui ThreadMessage uses `content` as parts[]; AI SDK UIMessage uses `parts`. */
function previewFromMessages(messages: MessageLike[]): string {
  return messages
    .slice(0, 6)
    .map((m) => {
      if (typeof m.content === "string") {
        return `${m.role ?? "user"}: ${m.content}`;
      }
      const fromContent = textFromParts(m.content);
      if (fromContent) return `${m.role ?? "user"}: ${fromContent}`;
      const fromParts = textFromParts(m.parts);
      if (fromParts) return `${m.role ?? "user"}: ${fromParts}`;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return Response.json({ title: "New chat" });
  }

  const { messages } = (await req.json()) as { messages?: MessageLike[] };
  const preview = previewFromMessages(messages ?? []);

  const qwen = createOpenAICompatible({
    name: "qwen",
    apiKey,
    baseURL:
      process.env.DASHSCOPE_BASE_URL ??
      "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });

  let title = "New chat";
  try {
    const result = await generateText({
      model: qwen(process.env.QWEN_MODEL ?? "qwen-plus"),
      system:
        "Generate a short conversation title (max 6 words). Reply with the title only, no quotes. Prefer the user's language.",
      prompt: preview || "Untitled conversation",
    });
    title = result.text.trim().replace(/^["']|["']$/g, "").slice(0, 80) || title;
  } catch {
    // Fallback: use first user text snippet if the model call fails.
    const firstLine = preview.split("\n")[0]?.replace(/^[^:]+:\s*/, "") ?? "";
    title = firstLine.slice(0, 40) || title;
  }

  await db
    .update(threads)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(threads.id, id), eq(threads.userId, DEMO_USER_ID)));

  return Response.json({ title });
}
