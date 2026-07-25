// Simple guardrails to protect the OpenAI/Qdrant-backed API routes from abuse.
// This is intentionally lightweight (in-memory, per-server-instance). For a
// real multi-instance deployment, swap this for Upstash Redis or similar -
// the function signature below would stay the same.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

// Basic checks before we let a request touch OpenAI / Qdrant.
export const MAX_QUERY_LENGTH = 2000;
export const MAX_TEXT_SOURCE_LENGTH = 200_000; // chars
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_FILE_TYPES = ["application/pdf", "text/vtt", "text/plain"];

export function isSafeUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    // block requests aimed at internal/private infra (basic SSRF guard)
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254"];
    if (blocked.includes(parsed.hostname)) return false;
    if (parsed.hostname.startsWith("10.") || parsed.hostname.startsWith("192.168.")) return false;
    return true;
  } catch {
    return false;
  }
}

export function sanitizeQuery(input: string) {
  return input.slice(0, MAX_QUERY_LENGTH).trim();
}
