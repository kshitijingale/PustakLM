import { NextRequest, NextResponse } from "next/server";

// Lightweight route guard: keeps unauthenticated users off the app pages.
// API routes do their own auth check (getSessionUserId) so they stay
// protected even if this middleware is bypassed.
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("learnforge_session");
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/workspace/:path*", "/login"],
};
