// Drizzle ORM schema. Run `npm run db:push` after setting DATABASE_URL to create these tables in Neon.
import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // every user gets their own Qdrant collection name, e.g. "user_<id>"
  qdrantCollection: text("qdrant_collection").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notebooks = pgTable("notebooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled Notebook"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// status: "uploading" | "indexing" | "ready" | "failed"
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  notebookId: uuid("notebook_id").notNull().references(() => notebooks.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // pdf | text | url | youtube | vtt
  title: text("title").notNull(),
  // original reference: file path, URL, or raw text pointer
  originRef: text("origin_ref"),
  status: text("status").notNull().default("uploading"),
  chunkCount: integer("chunk_count").default(0),
  errorMessage: text("error_message"),
  // extra per-type metadata, e.g. { pageCount }, { videoId }, { url }
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  notebookId: uuid("notebook_id").notNull().references(() => notebooks.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  // citations: [{ sourceId, sourceTitle, chunkText, chunkIndex, page?, timestamp? }]
  citations: jsonb("citations").$type<unknown[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
