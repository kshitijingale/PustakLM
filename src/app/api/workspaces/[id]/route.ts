import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  const [updated] = await db
    .update(workspaces)
    .set({ title: title?.slice(0, 120) })
    .where(and(eq(workspaces.id, params.id), eq(workspaces.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ workspace: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Sources + messages cascade-delete via FK constraints. Note: this does not
  // delete the corresponding vectors in Qdrant - in production, also call
  // deleteSourceChunks for every source in this workspace before deleting it.
  await db.delete(workspaces).where(and(eq(workspaces.id, params.id), eq(workspaces.userId, userId)));
  return NextResponse.json({ ok: true });
}
