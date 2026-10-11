import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { DEMO_USER_ID } from "@/db/constants";
import { messages, threads } from "@/db/schema";
import { getOwnedThread } from "@/lib/db/thread-access";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, id))
    .orderBy(asc(messages.createdAt));

  return Response.json(rows);
}

export async function POST(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  const body = (await req.json()) as {
    id: string;
    parent_id: string | null;
    format: string;
    content: Record<string, unknown>;
  };

  await db.insert(messages).values({
    id: body.id,
    threadId: id,
    parentId: body.parent_id,
    format: body.format,
    content: body.content,
  });

  await db
    .update(threads)
    .set({ updatedAt: new Date() })
    .where(and(eq(threads.id, id), eq(threads.userId, DEMO_USER_ID)));

  return new Response(null, { status: 204 });
}
