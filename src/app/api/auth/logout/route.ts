import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Overwrite the cookie with an already-expired one to clear it.
  res.cookies.set(sessionCookieOptions().name, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}