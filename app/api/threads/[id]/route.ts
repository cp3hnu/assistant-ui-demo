import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { DEMO_USER_ID } from "@/db/constants";
import { threads } from "@/db/schema";
import { getOwnedThread } from "@/lib/db/thread-access";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });
  return Response.json(thread);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  const patch = (await req.json()) as {
    title?: string;
    status?: "regular" | "archived";
  };

  await db
    .update(threads)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(threads.id, id), eq(threads.userId, DEMO_USER_ID)));

  return new Response(null, { status: 204 });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const thread = await getOwnedThread(id);
  if (!thread) return new Response(null, { status: 404 });

  await db
    .delete(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, DEMO_USER_ID)));

  return new Response(null, { status: 204 });
}
