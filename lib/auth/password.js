import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

/**
 * Password hashing.
 *
 * Uses scrypt from Node's own crypto module — a memory-hard KDF designed for
 * exactly this, and available without a native dependency like bcrypt or
 * argon2. Parameters follow the Node docs' recommended minimums.
 *
 * The stored format is self-describing (`scrypt$N$r$p$salt$hash`) so cost
 * parameters can be raised later without invalidating existing hashes: an old
 * hash still verifies against the parameters it was created with.
 */

// N=2^15 keeps a single hash around 100ms on modest hardware, which is the
// right trade-off for an interactive login.
const PARAMS = { N: 32768, r: 8, p: 1, keylen: 64 };

const SALT_BYTES = 16;

/** Hash a plaintext password. Returns a string safe to store as-is. */
export async function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("hashPassword requires a non-empty password");
  }

  const salt = randomBytes(SALT_BYTES);

  const derived = await scrypt(password, salt, PARAMS.keylen, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
    // scrypt needs enough memory for the chosen cost, or it throws.
    maxmem: 128 * PARAMS.N * PARAMS.r * 2,
  });

  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/** Parse a stored hash back into its parameters. Returns null if malformed. */
function parseStored(stored) {
  if (typeof stored !== "string") {
    return null;
  }

  const parts = stored.split("$");

  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return null;
  }

  const [, n, r, p, salt, hash] = parts;

  const params = { N: Number(n), r: Number(r), p: Number(p) };

  if (!Object.values(params).every((value) => Number.isInteger(value) && value > 0)) {
    return null;
  }

  return {
    ...params,
    salt: Buffer.from(salt, "base64url"),
    hash: Buffer.from(hash, "base64url"),
  };
}

/**
 * Verify a password against a stored hash.
 *
 * Comparison is timing-safe: a plain `===` on the derived key leaks how much
 * of the hash matched, which is enough to reconstruct it byte by byte.
 *
 * Returns false rather than throwing on a malformed hash, so a corrupt record
 * fails closed instead of 500-ing the login route.
 */
export async function verifyPassword(password, stored) {
  const parsed = parseStored(stored);

  if (!parsed || typeof password !== "string") {
    return false;
  }

  try {
    const derived = await scrypt(password, parsed.salt, parsed.hash.length, {
      N: parsed.N,
      r: parsed.r,
      p: parsed.p,
      maxmem: 128 * parsed.N * parsed.r * 2,
    });

    // timingSafeEqual throws on a length mismatch, which the guard prevents.
    return (
      derived.length === parsed.hash.length &&
      timingSafeEqual(derived, parsed.hash)
    );
  } catch {
    return false;
  }
}

/**
 * Whether a stored hash was created with weaker parameters than current
 * policy. A real deployment re-hashes on next successful login when true.
 */
export function needsRehash(stored) {
  const parsed = parseStored(stored);

  if (!parsed) {
    return true;
  }

  return parsed.N < PARAMS.N || parsed.r < PARAMS.r || parsed.p < PARAMS.p;
}
