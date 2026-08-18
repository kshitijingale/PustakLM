// Shared user provisioning for both auth paths (email/password and OAuth).
import { and, eq, ilike } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { oauthAccounts, users } from "@/lib/schema";
import { ensureUserCollection } from "@/lib/qdrant";
import type { OAuthProvider } from "@/lib/oauth";

// Creates a user row plus their isolated Qdrant collection (same behaviour as
// the original /api/auth/register route, now shared with OAuth sign-up).
export async function createUser(email: string, passwordHash: string | null) {
  const qdrantCollection = `user_${uuidv4()}`;

  // Every user gets an isolated Qdrant collection created up-front, so their
  // workspaces' vectors never mix with any other user's data.
  await ensureUserCollection(qdrantCollection);

  const [user] = await db.insert(users).values({ email, passwordHash, qdrantCollection }).returning();
  return user;
}

// OAuth sign-in resolution order:
//   1. this provider account was linked before → sign in as that user
//   2. a user with the same verified email exists → link the provider to them
//   3. otherwise → create a brand-new user (with Qdrant collection)
export async function findOrCreateOAuthUser(
  provider: OAuthProvider,
  providerAccountId: string,
  email: string
) {
  const [linked] = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerAccountId, providerAccountId)));

  if (linked) {
    const [user] = await db.select().from(users).where(eq(users.id, linked.userId));
    if (user) return user;
  }

  // Case-insensitive match so "User@x.com" (password signup) and "user@x.com"
  // (OAuth) resolve to the same account instead of creating a duplicate.
  const [existing] = await db.select().from(users).where(ilike(users.email, email));
  if (existing) {
    await db.insert(oauthAccounts).values({ userId: existing.id, provider, providerAccountId });
    return existing;
  }

  const user = await createUser(email, null);
  await db.insert(oauthAccounts).values({ userId: user.id, provider, providerAccountId });
  return user;
}
