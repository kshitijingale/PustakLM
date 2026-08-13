import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  generateOAuthState,
  getProviderConfig,
  isOAuthProvider,
  oauthStateCookieOptions,
  resolveBaseUrl,
} from "@/lib/oauth";
import { rateLimit } from "@/lib/ratelimit";

// GET /api/auth/oauth/{google|github}
// Starts the OAuth flow: sets a CSRF state cookie and redirects to the
// provider's consent screen.
export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  if (!isOAuthProvider(params.provider)) {
    return NextResponse.json({ error: "Unknown OAuth provider" }, { status: 404 });
  }

  // These are browser navigations, so failures redirect back to /login with a
  // human-readable error instead of returning bare JSON.
  const loginError = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, req.nextUrl.origin));

  const ip = req.headers.get("x-forwarded-for") || "anon";
  const limited = rateLimit(`oauth:${params.provider}:${ip}`, 10, 60_000);
  if (!limited.ok) return loginError("oauth_rate_limited");

  if (!getProviderConfig(params.provider)) return loginError("oauth_not_configured");

  const state = generateOAuthState();
  const res = NextResponse.redirect(buildAuthorizeUrl(params.provider, state, resolveBaseUrl(req)));
  res.cookies.set(oauthStateCookieOptions().name, state, oauthStateCookieOptions());
  return res;
}
