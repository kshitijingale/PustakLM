import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { signSession, sessionCookieOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "anon";
  const limited = rateLimit(`login:${ip}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // OAuth-only accounts have no password — point them at the right button
  // instead of letting bcrypt.compare blow up on a null hash.
  if (!user.passwordHash) {
    return NextResponse.json({ error: "This account uses Google/GitHub sign-in" }, { status: 401 });
  }

  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signSession(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
}
