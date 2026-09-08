// lib/auth/users.js

import "server-only";

import { getSession } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * ============================================================
 * GET CURRENT AUTHENTICATED USER
 * ============================================================
 *
 * The Next.js session is authoritative for the
 * frontend console session.
 *
 * Google profile information is stored in the
 * signed session when the OAuth callback creates it.
 */
export async function getPublicUser(id) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return null;
    }

    // If a specific ID was requested, make sure it
    // matches the authenticated session.
    if (id && session.userId !== id) {
      return null;
    }

    return {
      id: session.userId,

      name: session.name || "ThreatDetect Analyst",

      email: session.email || "",

      picture: session.picture || null,

      role: session.role || "analyst",
    };
  } catch (error) {
    console.error("[AUTH] Failed to get public user:", error);

    return null;
  }
}

/**
 * ============================================================
 * VERIFY EMAIL / PASSWORD CREDENTIALS
 * ============================================================
 *
 * Kept for the existing email/password authentication flow.
 */
export async function verifyCredentials(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data.user || null;
  } catch (error) {
    console.error("[AUTH] Credential verification failed:", error);

    return null;
  }
}

/**
 * ============================================================
 * CREATE USER
 * ============================================================
 *
 * Kept for the existing email/password signup flow.
 */
export async function createUser({ name, email, password }) {
  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      let error = {};

      try {
        error = await res.json();
      } catch {
        // Ignore invalid error response.
      }

      return {
        error: error.detail || "SIGNUP_FAILED",
      };
    }

    const data = await res.json();

    return {
      user: data.user,
    };
  } catch (error) {
    console.error("[AUTH] User creation failed:", error);

    return {
      error: "SIGNUP_FAILED",
    };
  }
}
