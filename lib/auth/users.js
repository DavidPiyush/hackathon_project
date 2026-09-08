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
  // Holds the in-flight seeding promise so concurrent callers share it.
  seeding: null,
});

/**
 * Seeded accounts, so the console can be opened without signing up first.
 *
 * Two rather than one: the analyst account is the everyday role, and the lead
 * account exercises a second role so role-dependent UI can actually be seen.
 * Both are published on the sign-in page — they are demo credentials, not
 * secrets, and the screen says not to reuse a real password.
 */
export const SEEDED_ACCOUNTS = [
  {
    id: "demo-analyst",
    name: "A. Rahman",
    email: "analyst@threatdetect.com",
    password: "evidence-first-2026",
    role: "analyst",
    label: "Analyst",
    description: "Day-to-day triage and investigation.",
  },
  {
    id: "demo-lead",
    name: "P. Sharma",
    email: "lead@threatdetect.com",
    password: "chain-of-custody-2026",
    role: "lead",
    label: "DFIR Lead",
    description: "Can also finalise reports and close cases.",
  },
];

/** Kept for the sign-in page's primary demo hint. */
export const DEMO_CREDENTIALS = {
  email: SEEDED_ACCOUNTS[0].email,
  password: SEEDED_ACCOUNTS[0].password,
};

/*
  The seeded ids above are fixed on purpose.

  Accounts live in memory, so a random id would be regenerated on every server
  restart and silently invalidate the session cookie of anyone signed in with a
  demo account — they would be bounced to the sign-in screen with no
  explanation. Stable ids keep those sessions valid across restarts. Real
  signups still get a random UUID.
*/

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
  /*
    The cached value is the *promise*, not a boolean.

    An earlier version set a `seeded` flag before awaiting the hash. Hashing
    takes ~100ms by design, so a second caller arriving inside that window saw
    the flag already set and returned to an empty store — `findByEmail` gave
    back null and a correct password was rejected as "Incorrect email or
    password". The proxy and the page render hit this together on the very
    first request, which made sign-in fail exactly when it mattered.

    Caching the promise means concurrent callers await the same seeding work.
  */
  store.seeding ??= (async () => {
    // Hashed in parallel: each one is deliberately ~100ms, and doing them in
    // sequence would double the delay on the very first request.
    const seeded = await Promise.all(
      SEEDED_ACCOUNTS.map(async (account) => ({
        id: account.id,
        name: account.name,
        email: normalizeEmail(account.email),
        role: account.role,
        passwordHash: await hashPassword(account.password),
        createdAt: new Date().toISOString(),
      })),
    );

    for (const user of seeded) {
      if (store.byEmail.has(user.email)) {
        continue;
      }

      store.byId.set(user.id, user);
      store.byEmail.set(user.email, user);
    }
  })();

  try {
    await store.seeding;
  } catch (error) {
    // Let the next caller retry rather than caching a permanent failure.
    store.seeding = null;

    throw error;
  }
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
  // Clearing the cached promise is what allows the next call to re-seed.
  store.seeding = null;
}

/** Test/diagnostic seam: how many accounts exist. */
export function __userCount() {
  return store.byId.size;
}
