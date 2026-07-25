import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file (see .env.example).");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
