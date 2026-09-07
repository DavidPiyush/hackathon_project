import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Stateless sessions.
 *
 * The session is a signed JWT in an httpOnly cookie. There is no session table
 * to consult, which keeps this dependency-light, at the cost of not being able
 * to revoke a single session server-side before it expires — the usual
 * trade-off, and acceptable for a seven-day window.
 *
 * The payload carries only what later requests need: the user id, their role,
 * and a display name for the shell UI. No email, no PII, nothing sensitive —
 * a JWT is signed, not encrypted, so anyone holding the cookie can read it.
 */

export const SESSION_COOKIE = "threatdetect_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Refresh the cookie only once a day of the window has elapsed. Rewriting it
 * on every request would issue a Set-Cookie header on every navigation.
 */
const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Signing key.
 *
 * A real deployment must set SESSION_SECRET (`openssl rand -base64 32`).
 * Without it, development gets a fixed fallback so the app runs out of the
 * box, and production refuses to start rather than signing sessions with a
 * value that is public in this repository.
 */
function secretKey() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production. Generate one with: openssl rand -base64 32",
    );
  }

  if (secret) {
    console.warn(
      "[auth] SESSION_SECRET is shorter than 32 characters; using it anyway in development.",
    );

    return new TextEncoder().encode(secret.padEnd(32, "0"));
  }

  return new TextEncoder().encode(
    "threatdetect-development-only-session-secret",
  );
}

/** Sign a session payload. */
export async function encryptSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("threatdetect")
    .setAudience("threatdetect-console")
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION_MS))
    .sign(secretKey());
}

/**
 * Verify and decode a session token.
 *
 * Returns null for anything that does not verify — expired, tampered with,
 * signed with another key, or using a different algorithm. Pinning
 * `algorithms` is what prevents an attacker presenting an `alg: none` token.
 */
export async function decryptSession(token) {
  if (!token) {
    return null;
  }

  /*
    Resolved outside the try deliberately.

    A missing SESSION_SECRET in production is a deployment fault, not a bad
    token. Swallowing it here would make every request look unauthenticated
    and redirect the whole site to /login — which presents as "login is
    broken" rather than "the secret is not set". Letting it throw surfaces the
    real cause.
  */
  const key = secretKey();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: "threatdetect",
      audience: "threatdetect-console",
    });

    return payload?.userId ? payload : null;
  } catch {
    // Invalid, expired or forged. Indistinguishable to the caller on purpose.
    return null;
  }
}

/** Cookie attributes, shared by set and delete so they cannot drift apart. */
function cookieOptions(expires) {
  return {
    httpOnly: true,
    // Secure requires https, which breaks local development over http.
    secure: process.env.NODE_ENV === "production",
    // `lax` still sends the cookie on a top-level navigation back to the app,
    // while withholding it from cross-site subrequests.
    sameSite: "lax",
    path: "/",
    expires,
  };
}

/** Issue a session cookie for a user. */
export async function createSession({ userId, role, name }) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await encryptSession({
    userId,
    role,
    name,
    // Recorded so the refresh check below has something to compare against.
    issuedAt: Date.now(),
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** Read and verify the current session, or null. */
export async function getSession() {
  const cookieStore = await cookies();

  return decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Slide the expiry forward for an active user.
 *
 * Safe to call from a Server Action or Route Handler. It is a no-op in a
 * Server Component render, where cookies are read-only — Next throws there,
 * and the session simply is not extended on that request.
 */
export async function refreshSession() {
  const session = await getSession();

  if (!session) {
    return false;
  }

  const age = Date.now() - Number(session.issuedAt ?? 0);

  if (age < REFRESH_AFTER_MS) {
    return false;
  }

  try {
    await createSession({
      userId: session.userId,
      role: session.role,
      name: session.name,
    });

    return true;
  } catch {
    return false;
  }
}

/** Clear the session cookie. */
export async function deleteSession() {
  const cookieStore = await cookies();

  // Overwrite then delete: some clients ignore a bare delete for a cookie
  // that was set with attributes.
  cookieStore.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
  cookieStore.delete(SESSION_COOKIE);
}
