import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL. Add it to .env.local (see .env.example) and start Docker Postgres.",
  );
}

const client = postgres(connectionString, { max: 10 });

export const db = drizzle(client, { schema });
