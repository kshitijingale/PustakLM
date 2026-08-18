import type { NextRequest } from "next/server";

// Hand-rolled OAuth 2.0 (authorization-code flow) for Google and GitHub.
// No extra dependencies: both providers expose standard OAuth endpoints, and
// the session stays our own JWT cookie (see src/lib/auth.ts) — these helpers
// only answer "who is this user?" so the callback can find-or-create a local
// account and sign them in.
//
// Required env vars (see .env.example):
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
//   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
//   NEXT_PUBLIC_APP_URL (used to build redirect/callback URLs)

export type OAuthProvider = "google" | "github";

export const OAUTH_STATE_COOKIE = "learnforge_oauth_state";

// The OAuth redirect_uri must live on the same host the user started the
// flow from — otherwise the provider bounces them to a different host and
// the state cookie (our CSRF guard) never round-trips. NEXT_PUBLIC_APP_URL
// wins when set (canonical host); otherwise we use the incoming request's
// origin, so localhost, Vercel prod, and preview deployments all just work.
export function resolveBaseUrl(req: NextRequest) {
  return (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/+$/, "");
}

export type OAuthProfile = {
  providerAccountId: string; // stable id at the provider (Google "sub", GitHub "id")
  email: string; // verified, lowercased
};

type ProviderConfig = {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  // resolves to null when the account has no verified email we can use
  fetchProfile: (accessToken: string) => Promise<OAuthProfile | null>;
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

export function callbackUrl(provider: OAuthProvider, baseUrl: string) {
  return `${baseUrl}/api/auth/oauth/${provider}/callback`;
}

// Returns null when the provider's env vars aren't set, so routes can fail
// gracefully (redirect to /login) instead of throwing at request time.
export function getProviderConfig(provider: OAuthProvider): ProviderConfig | null {
  const [idName, secretName] =
    provider === "google"
      ? ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
      : ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"];

  const clientId = process.env[idName];
  const clientSecret = process.env[secretName];
  if (!clientId || !clientSecret) return null;

  if (provider === "google") {
    return {
      clientId,
      clientSecret,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scope: "openid email profile",
      fetchProfile: fetchGoogleProfile,
    };
  }
  return {
    clientId,
    clientSecret,
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    fetchProfile: fetchGitHubProfile,
  };
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string, baseUrl: string) {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`OAuth provider "${provider}" is not configured`);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(provider, baseUrl),
    response_type: "code",
    scope: config.scope,
    state,
  });
  return `${config.authorizeUrl}?${params.toString()}`;
}


export async function exchangeCodeForToken(provider: OAuthProvider, code: string, baseUrl: string): Promise<string> {
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`OAuth provider "${provider}" is not configured`);

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: callbackUrl(provider, baseUrl),
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json().catch(() => ({}));
  // GitHub replies HTTP 200 with an `error` field on failure — check the token.
  if (!res.ok || typeof data.access_token !== "string") {
    throw new Error(data.error_description || data.error || `token exchange failed (${res.status})`);
  }
  return data.access_token;
}

// The state cookie is our CSRF protection for the redirect round-trip: the
// callback compares the query param against this httpOnly cookie.
export function generateOAuthState() {
  return crypto.randomUUID();
}

export function oauthStateCookieOptions() {
  return {
    name: OAUTH_STATE_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes — plenty of time to finish the consent screen
  };
}

async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile | null> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`google userinfo failed (${res.status})`);
  const data = await res.json();
  // Never link/create an account on an unverified email — that would let an
  // attacker hijack an existing account that shares the address.
  if (!data.sub || !data.email || data.email_verified !== true) return null;
  return { providerAccountId: String(data.sub), email: String(data.email).toLowerCase() };
}

async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile | null> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "learnforge", // GitHub rejects API calls without a UA header
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) throw new Error(`github /user failed (${userRes.status})`);
  const userData = await userRes.json();

  // `email` is only present when the user made it public; otherwise fall back
  // to /user/emails and take their primary *verified* address.
  let email: string | null = typeof userData.email === "string" ? userData.email : null;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
      email = (emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified))?.email ?? null;
    }
  }
  if (!userData.id || !email) return null;
  return { providerAccountId: String(userData.id), email: email.toLowerCase() };
}
