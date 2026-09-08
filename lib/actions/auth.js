"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  validateSignup,
  validateLogin,
  normalizeEmail,
} from "@/lib/auth/validation";

import { createUser, verifyCredentials } from "@/lib/auth/users";

import { createSession, deleteSession, getSession } from "@/lib/auth/session";

import {
  checkLimit,
  recordFailure,
  clearAttempts,
} from "@/lib/auth/rate-limit";

/**
 * Authentication actions.
 *
 * Each is shaped for `useActionState`:
 * previous state first, FormData second.
 *
 * Validation runs here rather than only in the browser.
 */

/**
 * Only allow same-origin relative paths so `?next=`
 * cannot become an open redirect.
 */
function safeReturnTo(value) {
  const path = String(value ?? "");

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  // Keep users inside the console.
  return path.startsWith("/dashboard") ? path : "/dashboard";
}

/**
 * Throttle key.
 *
 * Combines the email with the client address so one
 * attacker cannot lock out a legitimate user by
 * repeatedly targeting their address.
 */
async function throttleKey(email) {
  const headerList = await headers();

  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  return `${normalizeEmail(email)}|${ip}`;
}

function errorState(values, errors, message) {
  return {
    status: "error",
    message: message ?? "Please correct the highlighted fields.",
    errors,
    // Passwords are deliberately never returned.
    values,
  };
}

/* ============================ SIGN UP ============================ */

export async function signupAction(previousState, formData) {
  const fields = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
    terms: formData.get("terms"),
  };

  const values = {
    name: fields.name,
    email: fields.email,
  };

  const errors = validateSignup(fields);

  if (Object.keys(errors).length > 0) {
    return errorState(values, errors);
  }

  const result = await createUser({
    name: fields.name,
    email: fields.email,
    password: fields.password,
  });

  if (result.error === "EMAIL_TAKEN") {
    return errorState(
      values,
      {
        email: "An account already exists for this email address.",
      },
      "That email is already registered. Try signing in instead.",
    );
  }

  if (!result.user) {
    return errorState(
      values,
      {},
      "Something went wrong creating your account. Please try again.",
    );
  }

  await createSession({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
  });

  redirect("/dashboard");
}

/* ============================= LOG IN ============================= */

export async function loginAction(previousState, formData) {
  const fields = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const values = {
    email: fields.email,
  };

  const returnTo = safeReturnTo(formData.get("next"));

  const errors = validateLogin(fields);

  if (Object.keys(errors).length > 0) {
    return errorState(values, errors);
  }

  const key = await throttleKey(fields.email);
  const limit = checkLimit(key);

  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);

    return errorState(
      values,
      {},
      `Too many failed attempts. Try again in ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    );
  }

  const user = await verifyCredentials(fields.email, fields.password);

  if (!user) {
    const next = recordFailure(key);

    return errorState(
      values,
      {},
      next.remaining <= 3 && next.remaining > 0
        ? `Incorrect email or password. ${next.remaining} attempt${
            next.remaining === 1 ? "" : "s"
          } left before a temporary lock.`
        : "Incorrect email or password.",
    );
  }

  clearAttempts(key);

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
  });

  redirect(returnTo);
}

/* ============================= LOG OUT ============================= */

export async function logoutAction() {
  /*
   * First remove the Next.js ThreatDetect session.
   * This immediately prevents access to /dashboard.
   */
  await deleteSession();

  /*
   * Also ask FastAPI to clear the Google OAuth token
   * stored for the current OAuth session.
   *
   * Failure here should NOT prevent local logout.
   */
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[AUTH] FastAPI logout failed:", error);
  }

  redirect("/login");
}

/**
 * Whether the current Next.js session is valid.
 *
 * This can be used by client components through
 * a Server Action without importing the
 * server-only session module into the browser.
 */
export async function checkSessionAction() {
  const session = await getSession();

  return Boolean(session?.userId);
}
