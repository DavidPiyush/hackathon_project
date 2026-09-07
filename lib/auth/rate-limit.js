import "server-only";

/**
 * Login throttling.
 *
 * A fixed-window counter per key, held in memory. Like the user store this is
 * per-instance, so it is a speed bump rather than a guarantee — a real
 * deployment puts this in Redis or at the edge. It is still worth having:
 * without any limit, the login form is an unmetered password oracle.
 *
 * Keys are hashed identifiers (email, or email plus IP), never raw passwords.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

const store = (globalThis.__threatdetectAttempts ??= new Map());

/** Drop windows that have already expired, so the Map cannot grow forever. */
function prune(now) {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

/**
 * Whether `key` may attempt again, and how long until the window resets.
 * Does not record the attempt — call `recordFailure` for that.
 */
export function checkLimit(key) {
  const now = Date.now();

  prune(now);

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - entry.count);

  return {
    allowed: remaining > 0,
    remaining,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/** Record a failed attempt and return the updated limit state. */
export function recordFailure(key) {
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });

    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;

  return checkLimit(key);
}

/** Clear the counter after a successful login. */
export function clearAttempts(key) {
  store.delete(key);
}

/** Test seam. */
export function __resetLimits() {
  store.clear();
}

export const LIMITS = { WINDOW_MS, MAX_ATTEMPTS };
