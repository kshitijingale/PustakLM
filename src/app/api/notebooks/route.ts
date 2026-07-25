import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notebooks } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export async function GET() {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(notebooks).where(eq(notebooks.userId, userId));
  return NextResponse.json({ notebooks: rows });
}

export async function POST(req: NextRequest) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`create-notebook:${userId}`, 20, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { title } = await req.json();
  const [notebook] = await db
    .insert(notebooks)
    .values({ userId, title: title?.slice(0, 120) || "Untitled Notebook" })
    .returning();

  return NextResponse.json({ notebook });
}
