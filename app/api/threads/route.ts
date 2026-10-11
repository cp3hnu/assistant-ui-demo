import { desc, eq } from "drizzle-orm";
import { generateId } from "ai";
import { db } from "@/db";
import { DEMO_USER_ID } from "@/db/constants";
import { threads } from "@/db/schema";

export async function GET() {
  const rows = await db
    .select()
    .from(threads)
    .where(eq(threads.userId, DEMO_USER_ID))
    .orderBy(desc(threads.updatedAt));

  return Response.json(rows);
}

export async function POST() {
  const id = generateId();
  await db.insert(threads).values({ id, userId: DEMO_USER_ID });
  return Response.json({ id });
}
