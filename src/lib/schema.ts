// Drizzle ORM schema. Run `npm run db:push` after setting DATABASE_URL to create these tables in Neon.
import { pgTable, text, timestamp, uuid, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  // nullable: OAuth-only accounts (Google/GitHub) have no password
  passwordHash: text("password_hash"),
  // every user gets their own Qdrant collection name, e.g. "user_<id>"
  qdrantCollection: text("qdrant_collection").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Links a user to their identity at an OAuth provider. One row per
// (provider, providerAccountId) — a single user can have both Google and
// GitHub linked, and one provider account maps to exactly one user.
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // "google" | "github"
    providerAccountId: text("provider_account_id").notNull(), // Google "sub" / GitHub "id"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    providerAccount: uniqueIndex("oauth_accounts_provider_account_idx").on(t.provider, t.providerAccountId),
  })
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled Workspace"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// status: "uploading" | "indexing" | "ready" | "failed"
export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
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
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  // citations: [{ sourceId, sourceTitle, chunkText, chunkIndex, page?, timestamp? }]
  citations: jsonb("citations").$type<unknown[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
