import "server-only";

import { randomUUID } from "node:crypto";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/validation";

/**
 * User store.
 *
 * This is the one part of authentication that is not production-ready, and it
 * is worth being precise about why. Everything around it is real: passwords
 * are scrypt-hashed with per-user salts, sessions are signed JWTs in httpOnly
 * cookies, and every check runs server-side. What is missing is durable
 * storage — records live in a module-level Map, which means:
 *
 * - accounts are lost when the server restarts
 * - they are not shared between serverless instances or replicas
 *
 * The interface below is deliberately the shape a database adapter would have
 * (`findByEmail`, `findById`, `createUser`, `verifyCredentials`), so swapping
 * in Postgres or MongoDB is a change to this file alone. Nothing above it
 * knows how users are stored.
 *
 * `globalThis` keeps the Map alive across hot reloads in development, which
 * otherwise re-evaluate the module and drop every account mid-session.
 */

const store = (globalThis.__threatdetectUsers ??= {
  byId: new Map(),
  byEmail: new Map(),
  seeded: false,
});

/** The demo account, so the console can be opened without signing up first. */
export const DEMO_CREDENTIALS = {
  email: "analyst@threatdetect.com",
  password: "evidence-first-2026",
};

/**
 * Fixed id for the demo account.
 *
 * Accounts live in memory, so a random id would be regenerated on every server
 * restart and silently invalidate the session cookie of anyone using the demo
 * login — they would be bounced to the sign-in screen with no explanation. A
 * stable id keeps that session valid across restarts. Real signups still get a
 * random UUID.
 */
const DEMO_USER_ID = "demo-analyst";

/** Fields that are safe to hand to a client. Never the password hash. */
function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * Create the demo account on first use.
 *
 * Hashing is deliberate work, so this runs once and is awaited by every entry
 * point rather than at module load, where a top-level await would delay the
 * first render of every route.
 */
async function ensureSeeded() {
  if (store.seeded) {
    return;
  }

  // Guard against two concurrent requests both seeding.
  store.seeded = true;

  const email = normalizeEmail(DEMO_CREDENTIALS.email);

  if (store.byEmail.has(email)) {
    return;
  }

  const user = {
    id: DEMO_USER_ID,
    name: "A. Rahman",
    email,
    role: "analyst",
    passwordHash: await hashPassword(DEMO_CREDENTIALS.password),
    createdAt: new Date().toISOString(),
  };

  store.byId.set(user.id, user);
  store.byEmail.set(email, user);
}

export async function findByEmail(email) {
  await ensureSeeded();

  return store.byEmail.get(normalizeEmail(email)) ?? null;
}

export async function findById(id) {
  await ensureSeeded();

  return store.byId.get(id) ?? null;
}

/** Public projection of a user by id, for the session-backed shell UI. */
export async function getPublicUser(id) {
  return toPublicUser(await findById(id));
}

/**
 * Create an account.
 *
 * Returns `{ user }` on success or `{ error }` when the email is taken, rather
 * than throwing — a duplicate address is an expected outcome of a public
 * signup form, not an exceptional one.
 */
export async function createUser({ name, email, password }) {
  await ensureSeeded();

  const normalized = normalizeEmail(email);

  if (store.byEmail.has(normalized)) {
    return { error: "EMAIL_TAKEN" };
  }

  const user = {
    id: randomUUID(),
    name: String(name).trim(),
    email: normalized,
    role: "analyst",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  store.byId.set(user.id, user);
  store.byEmail.set(normalized, user);

  return { user: toPublicUser(user) };
}

/**
 * Check an email and password pair.
 *
 * When the email is unknown, this still runs a hash comparison against a
 * dummy value. Returning early would make "no such account" measurably faster
 * than "wrong password", which turns the login form into an account
 * enumeration oracle regardless of how careful the error message is.
 */
const DUMMY_HASH_PROMISE = hashPassword("timing-equalisation-placeholder");

export async function verifyCredentials(email, password) {
  const user = await findByEmail(email);

  if (!user) {
    await verifyPassword(String(password ?? ""), await DUMMY_HASH_PROMISE);

    return null;
  }

  const valid = await verifyPassword(String(password ?? ""), user.passwordHash);

  return valid ? toPublicUser(user) : null;
}

/** Test seam: wipe the store so suites do not leak accounts into each other. */
export function __resetUsers() {
  store.byId.clear();
  store.byEmail.clear();
  store.seeded = false;
}

/** Test/diagnostic seam: how many accounts exist. */
export function __userCount() {
  return store.byId.size;
}
