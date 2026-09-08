"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { validateSignup, validateLogin, normalizeEmail } from "@/lib/auth/validation";
import { createUser, verifyCredentials } from "@/lib/auth/users";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { checkLimit, recordFailure, clearAttempts } from "@/lib/auth/rate-limit";

/**
 * Authentication actions.
 *
 * Each is shaped for `useActionState`: previous state first, `FormData`
 * second. Validation runs here rather than only in the browser — client-side
 * checks are a convenience for the user, not a control, since the action is a
 * public endpoint that can be called directly.
 */

/** Only allow same-origin relative paths, so `?next=` cannot become an open redirect. */
function safeReturnTo(value) {
  const path = String(value ?? "");

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  // Keep users inside the console; anything else falls back to the default.
  return path.startsWith("/dashboard") ? path : "/dashboard";
}

/**
 * Throttle key.
 *
 * Combines the email with the client address so one attacker cannot lock out a
 * legitimate user by hammering their address, and one address cannot cycle
 * through many accounts freely.
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
    // Echo values back so a failed submit does not clear the form. Passwords
    // are deliberately never echoed.
    values,
  };
}

/**
 * Turn a configuration fault into something the person in front of the screen
 * can act on.
 *
 * A missing SESSION_SECRET used to surface as an unhandled 500 and the words
 * "UNEXPECTED ERROR" — accurate but useless, and indistinguishable from "the
 * app is broken". The real cause was only in the server log.
 */
function configErrorState(values, error) {
  const isMissingSecret = /SESSION_SECRET/i.test(error?.message ?? "");

  // Still logged, because this needs to reach whoever deployed it.
  console.error("[auth] could not create a session:", error);

  return errorState(
    values,
    {},
    isMissingSecret
      ? "The server is missing its SESSION_SECRET, so it cannot sign you in. Run `npm run setup` to generate one, then restart the server."
      : "Sign-in is unavailable because of a server configuration problem. Check the server logs.",
  );
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

  const values = { name: fields.name, email: fields.email };

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
    // Signup genuinely cannot hide that an address is registered — it has to
    // refuse the duplicate. The login form is where enumeration is prevented.
    return errorState(
      values,
      { email: "An account already exists for this email address." },
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

  try {
    await createSession({
      userId: result.user.id,
      role: result.user.role,
      name: result.user.name,
    });
  } catch (error) {
    return configErrorState(values, error);
  }

  // redirect() throws, so it must sit outside the try above.
  redirect("/dashboard");
}

/* ============================= LOG IN ============================= */

export async function loginAction(previousState, formData) {
  const fields = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const values = { email: fields.email };

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
      `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    );
  }

  const user = await verifyCredentials(fields.email, fields.password);

  if (!user) {
    const next = recordFailure(key);

    // One message for both "no such account" and "wrong password". Telling
    // them apart would let anyone test which addresses are registered.
    return errorState(
      values,
      {},
      next.remaining <= 3 && next.remaining > 0
        ? `Incorrect email or password. ${next.remaining} attempt${next.remaining === 1 ? "" : "s"} left before a temporary lock.`
        : "Incorrect email or password.",
    );
  }

  clearAttempts(key);

  try {
    await createSession({
      userId: user.id,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    return configErrorState(values, error);
  }

  redirect(returnTo);
}

/* ============================= LOG OUT ============================= */

export async function logoutAction() {
  await deleteSession();

  redirect("/login");
}

/**
 * Whether a session is currently valid.
 *
 * Exposed as an action so a client component can re-check after a tab has sat
 * idle, without importing the server-only session module.
 */
export async function checkSessionAction() {
  const session = await getSession();

  return Boolean(session?.userId);
}
