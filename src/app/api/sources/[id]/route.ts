import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sources, users } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { deleteSourceChunks } from "@/lib/qdrant";
import { indexSource } from "@/lib/ingest";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteSourceChunks(user.qdrantCollection, params.id);
  await db.delete(sources).where(eq(sources.id, params.id));

  return NextResponse.json({ ok: true });
}

// Re-runs extraction + embedding for a source (e.g. after a fetch failure).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const [source] = await db.select().from(sources).where(eq(sources.id, params.id));
  if (!user || !source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteSourceChunks(user.qdrantCollection, source.id);

  indexSource({
    sourceId: source.id,
    workspaceId: source.workspaceId,
    userId,
    qdrantCollection: user.qdrantCollection,
    type: source.type,
    originRef: source.originRef || "",
    titleOverride: source.title,
  }).catch((err) => console.error(`Re-indexing failed for source ${source.id}:`, err));

  return NextResponse.json({ ok: true });
}
