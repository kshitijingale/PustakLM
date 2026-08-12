import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { signSession, sessionCookieOptions } from "@/lib/auth";
import { createUser } from "@/lib/users";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const limited = rateLimit(`register:${ip}`, 5, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const { email, password } = await req.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and an 8+ character password are required" }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  // Provisions the user's isolated Qdrant collection as part of sign-up.
  const user = await createUser(email, passwordHash);

  const token = signSession(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
}
