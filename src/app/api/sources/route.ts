import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sources, workspaces, users } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { indexSource } from "@/lib/ingest";
import {
  rateLimit,
  MAX_TEXT_SOURCE_LENGTH,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  isSafeUrl,
} from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  // ownership check keeps workspace isolation airtight
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)));
  if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = await db.select().from(sources).where(eq(sources.workspaceId, workspaceId));
  return NextResponse.json({ sources: rows });
}

// Accepts multipart/form-data for files (pdf, vtt) and JSON for text/url/youtube.
export async function POST(req: NextRequest) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`add-source:${userId}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many uploads, slow down." }, { status: 429 });

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") || "";
  let type: string, workspaceId: string, originRef = "", rawText = "", titleOverride = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    type = String(form.get("type"));
    workspaceId = String(form.get("workspaceId"));
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File missing" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE_BYTES)
      return NextResponse.json({ error: "File too large (20MB max)" }, { status: 400 });
    if (!ALLOWED_FILE_TYPES.includes(file.type))
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    titleOverride = file.name;
    rawText = type === "pdf" ? buffer.toString("base64") : buffer.toString("utf-8");
  } else {
    const body = await req.json();
    type = body.type;
    workspaceId = body.workspaceId;
    originRef = body.url || "";
    rawText = body.text || "";
    titleOverride = body.title || "";

    if (type === "text" && rawText.length > MAX_TEXT_SOURCE_LENGTH)
      return NextResponse.json({ error: "Text too long" }, { status: 400 });
    if ((type === "url" || type === "youtube") && !isSafeUrl(originRef))
      return NextResponse.json({ error: "Invalid or blocked URL" }, { status: 400 });
  }

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)));
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const [source] = await db
    .insert(sources)
    .values({
      workspaceId,
      type,
      title: titleOverride || `${type} source`,
      originRef,
      status: "uploading",
    })
    .returning();

  // Fire and forget: indexing runs async so the UI can immediately show the
  // "indexing" (yellow dot) status and poll until it flips to "ready" (green).
  indexSource({
    sourceId: source.id,
    workspaceId,
    userId,
    qdrantCollection: user.qdrantCollection,
    type,
    originRef,
    rawText,
    titleOverride,
  }).catch((err) => console.error(`Indexing failed for source ${source.id}:`, err));

  return NextResponse.json({ source });
}
