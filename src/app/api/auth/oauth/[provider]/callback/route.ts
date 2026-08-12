import { NextRequest, NextResponse } from "next/server";
import { signSession, sessionCookieOptions } from "@/lib/auth";
import {
  OAUTH_STATE_COOKIE,
  exchangeCodeForToken,
  getProviderConfig,
  isOAuthProvider,
  oauthStateCookieOptions,
} from "@/lib/oauth";
import { findOrCreateOAuthUser } from "@/lib/users";

// GET /api/auth/oauth/{google|github}/callback
// Completes the OAuth flow: verifies state, exchanges the code, resolves the
// local user, and signs them in with our normal JWT session cookie.
export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  if (!isOAuthProvider(params.provider)) {
    return NextResponse.json({ error: "Unknown OAuth provider" }, { status: 404 });
  }

  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}`, req.nextUrl.origin));
    // Always clear the state cookie on the way out.
    res.cookies.set(oauthStateCookieOptions().name, "", { ...oauthStateCookieOptions(), maxAge: 0 });
    return res;
  };

  const { searchParams } = req.nextUrl;

  // User clicked "Cancel" on the consent screen, or the provider rejected us.
  if (searchParams.get("error")) return fail("oauth_denied");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  // State mismatch = possible CSRF, or the 10-minute cookie expired mid-flow.
  if (!code || !state || !storedState || state !== storedState) {
    return fail("oauth_state");
  }

  try {
    const config = getProviderConfig(params.provider);
    if (!config) return fail("oauth_not_configured");

    const accessToken = await exchangeCodeForToken(params.provider, code);
    const profile = await config.fetchProfile(accessToken);
    if (!profile) return fail("oauth_no_email");

    const user = await findOrCreateOAuthUser(params.provider, profile.providerAccountId, profile.email);

    const token = signSession(user.id);
    const res = NextResponse.redirect(new URL("/", req.nextUrl.origin));
    res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
    res.cookies.set(oauthStateCookieOptions().name, "", { ...oauthStateCookieOptions(), maxAge: 0 });
    return res;
  } catch (err) {
    console.error(`[oauth:${params.provider}] callback failed:`, err);
    return fail("oauth_failed");
  }
}
