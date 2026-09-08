import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * ============================================================
 * SESSION CONFIGURATION
 * ============================================================
 */

export const SESSION_COOKIE = "threatdetect_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * ============================================================
 * SECRET
 * ============================================================
 */

function secretKey() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production.",
    );
  }

  if (secret) {
    return new TextEncoder().encode(secret.padEnd(32, "0"));
  }

  return new TextEncoder().encode(
    "threatdetect-development-only-session-secret",
  );
}

/**
 * ============================================================
 * ENCRYPT / SIGN SESSION
 * ============================================================
 */

export async function encryptSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setIssuer("threatdetect")
    .setAudience("threatdetect-console")
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION_MS))
    .sign(secretKey());
}

/**
 * ============================================================
 * VERIFY SESSION
 * ============================================================
 */

export async function decryptSession(token) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: "threatdetect",
      audience: "threatdetect-console",
    });

    if (!payload?.userId) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * ============================================================
 * COOKIE OPTIONS
 * ============================================================
 */

function cookieOptions(expires) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  };
}

/**
 * ============================================================
 * CREATE SESSION
 * ============================================================
 *
 * Supports both:
 *
 * 1. Email/password authentication
 * 2. Google OAuth authentication
 *
 * Google-specific fields are optional so the existing
 * email/password flow continues to work.
 */

export async function createSession({ userId, role, name, email, picture }) {
  if (!userId) {
    throw new Error("Cannot create session without userId.");
  }

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await encryptSession({
    userId,

    role: role || "analyst",

    name: name || "ThreatDetect Analyst",

    email: email || null,

    picture: picture || null,

    issuedAt: Date.now(),
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/**
 * ============================================================
 * GET SESSION
 * ============================================================
 */

export async function getSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return decryptSession(token);
}

/**
 * ============================================================
 * REFRESH SESSION
 * ============================================================
 */

export async function refreshSession() {
  const session = await getSession();

  if (!session) {
    return false;
  }

  const issuedAt = Number(session.issuedAt ?? 0);

  const age = Date.now() - issuedAt;

  if (age < REFRESH_AFTER_MS) {
    return false;
  }

  try {
    await createSession({
      userId: session.userId,
      role: session.role,
      name: session.name,
      email: session.email,
      picture: session.picture,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * ============================================================
 * DELETE SESSION
 * ============================================================
 */

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));

  cookieStore.delete(SESSION_COOKIE);
}
