import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { DEMO_USER_ID } from "@/db/constants";
import { threads } from "@/db/schema";

export async function getOwnedThread(id: string) {
  const [thread] = await db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, DEMO_USER_ID)))
    .limit(1);

  return thread ?? null;
}
