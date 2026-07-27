/**
 * Simple in-memory rate limiter.
 * For production, replace with an edge-compatible solution
 * (e.g. Upstash Redis via @upstash/ratelimit).
 *
 * This implementation is per-process (not shared across serverless instances),
 * but is sufficient for single-server and development use.
 */

type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

export type RateLimitConfig = {
  /** Unique key identifying this limit (e.g. "login:${ip}") */
  key: string;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
};

export type RateLimitResult =
  | { success: true; remaining: number }
  | { success: false; retryAfterSeconds: number };

export function rateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { success: false, retryAfterSeconds };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}

// Clean up expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }, 60_000);
}
