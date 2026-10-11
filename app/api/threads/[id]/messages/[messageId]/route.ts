import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getOwnedThread } from "@/lib/db/thread-access";

type RouteContext = { params: Promise<{ id: string; messageId: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id, messageId } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  const body = (await req.json()) as {
    format: string;
    content: Record<string, unknown>;
  };

  const updated = await db
    .update(messages)
    .set({
      format: body.format,
      content: body.content,
    })
    .where(and(eq(messages.id, messageId), eq(messages.threadId, id)))
    .returning({ id: messages.id });

  if (updated.length === 0) return new Response(null, { status: 404 });

  return new Response(null, { status: 204 });
}
