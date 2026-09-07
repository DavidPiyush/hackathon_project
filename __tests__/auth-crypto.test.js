/**
 * @vitest-environment node
 *
 * These modules are server-only. Running them under jsdom puts typed arrays in
 * a different realm from the one jose checks against, so a perfectly valid key
 * fails its instanceof test — an artefact of the environment, not the code.
 */
import { describe, expect, it, beforeEach } from "vitest";

import {
  hashPassword,
  verifyPassword,
  needsRehash,
} from "@/lib/auth/password";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateSignup,
  validateLogin,
  scorePassword,
  normalizeEmail,
  PASSWORD_MIN,
} from "@/lib/auth/validation";
import {
  checkLimit,
  recordFailure,
  clearAttempts,
  __resetLimits,
  LIMITS,
} from "@/lib/auth/rate-limit";

/**
 * Password hashing, validation and throttling.
 *
 * These are the parts of authentication where a subtle mistake is silent and
 * serious, so they are tested directly rather than only through the UI.
 */

describe("hashPassword", () => {
  it("produces a self-describing scrypt hash", async () => {
    const hash = await hashPassword("a-reasonable-passphrase");
    const parts = hash.split("$");

    expect(parts[0]).toBe("scrypt");
    expect(parts).toHaveLength(6);
    // Cost parameters are stored, so they can be raised without invalidating
    // existing hashes.
    expect(Number(parts[1])).toBeGreaterThanOrEqual(32768);
  });

  it("never stores the password itself", async () => {
    const password = "correct-horse-battery-staple";
    const hash = await hashPassword(password);

    expect(hash).not.toContain(password);
  });

  it("salts each hash, so identical passwords differ", async () => {
    const [a, b] = await Promise.all([
      hashPassword("identical-password"),
      hashPassword("identical-password"),
    ]);

    expect(a).not.toBe(b);
  });

  it("rejects an empty password rather than hashing nothing", async () => {
    await expect(hashPassword("")).rejects.toThrow();
    await expect(hashPassword(undefined)).rejects.toThrow();
  });
});

describe("verifyPassword", () => {
  it("accepts the correct password", async () => {
    const hash = await hashPassword("a-reasonable-passphrase");

    await expect(verifyPassword("a-reasonable-passphrase", hash)).resolves.toBe(
      true,
    );
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("a-reasonable-passphrase");

    await expect(verifyPassword("wrong-passphrase", hash)).resolves.toBe(false);
  });

  it("is case and whitespace sensitive", async () => {
    const hash = await hashPassword("Passphrase With Case");

    await expect(verifyPassword("passphrase with case", hash)).resolves.toBe(false);
    await expect(verifyPassword("Passphrase With Case ", hash)).resolves.toBe(false);
  });

  it("fails closed on a malformed or truncated hash", async () => {
    for (const bad of [
      "",
      "not-a-hash",
      "scrypt$1$2$3",
      "bcrypt$32768$8$1$c2FsdA$aGFzaA",
      "scrypt$0$8$1$c2FsdA$aGFzaA",
      null,
      undefined,
    ]) {
      await expect(verifyPassword("anything", bad)).resolves.toBe(false);
    }
  });

  it("does not throw when the supplied password is not a string", async () => {
    const hash = await hashPassword("a-reasonable-passphrase");

    await expect(verifyPassword(undefined, hash)).resolves.toBe(false);
    await expect(verifyPassword(12345, hash)).resolves.toBe(false);
  });

  it("handles long and unicode passwords", async () => {
    const long = "🔐-a-very-long-passphrase-".repeat(6);
    const hash = await hashPassword(long);

    await expect(verifyPassword(long, hash)).resolves.toBe(true);
    await expect(verifyPassword(long.slice(0, -1), hash)).resolves.toBe(false);
  });
});

describe("needsRehash", () => {
  it("is false for a hash at current policy", async () => {
    expect(needsRehash(await hashPassword("a-reasonable-passphrase"))).toBe(false);
  });

  it("is true for weaker parameters or a malformed hash", () => {
    expect(needsRehash("scrypt$1024$8$1$c2FsdA$aGFzaA")).toBe(true);
    expect(needsRehash("garbage")).toBe(true);
  });
});

describe("email normalisation and validation", () => {
  it("lowercases and trims for consistent lookup", () => {
    expect(normalizeEmail("  Analyst@Example.COM ")).toBe("analyst@example.com");
    expect(normalizeEmail(undefined)).toBe("");
  });

  it("accepts plausible addresses", () => {
    for (const email of [
      "analyst@example.com",
      "a.b+tag@sub.example.co.uk",
      "analyst_1@example.io",
    ]) {
      expect(validateEmail(email)).toBeNull();
    }
  });

  it("rejects malformed addresses", () => {
    for (const email of [
      "",
      "   ",
      "no-at-sign",
      "missing@tld",
      "@example.com",
      "spaces in@example.com",
      "two@@example.com",
    ]) {
      expect(validateEmail(email)).toBeTruthy();
    }
  });

  it("enforces an upper length bound", () => {
    expect(validateEmail(`${"a".repeat(250)}@example.com`)).toMatch(/characters/);
  });
});

describe("name validation", () => {
  it("requires something usable", () => {
    expect(validateName("Ada Lovelace")).toBeNull();
    expect(validateName("A")).toBeTruthy();
    expect(validateName("   ")).toBeTruthy();
    expect(validateName(undefined)).toBeTruthy();
  });

  it("enforces an upper length bound", () => {
    expect(validateName("a".repeat(81))).toMatch(/characters/);
  });
});

describe("scorePassword", () => {
  it("blocks the passwords attacks actually try", () => {
    for (const password of ["password", "password123", "12345678", "letmein", "welcome123"]) {
      const result = scorePassword(password);

      expect(result.blocking, password).toBe(true);
      expect(result.score).toBe(0);
    }
  });

  it("blocks anything under the length floor", () => {
    const result = scorePassword("shortpw");

    expect(result.blocking).toBe(true);
    expect(result.hint).toContain(String(PASSWORD_MIN));
  });

  it("blocks a password containing the user's own name or email", () => {
    // Trivially guessable by anyone who knows the target.
    expect(
      scorePassword("adalovelace-1937", { name: "Ada Lovelace" }).blocking,
    ).toBe(true);

    expect(
      scorePassword("analyst-secret-99", { email: "analyst@example.com" })
        .blocking,
    ).toBe(true);
  });

  it("blocks long sequential or repeated runs", () => {
    expect(scorePassword("abcdefghij").blocking).toBe(true);
    expect(scorePassword("aaaaaaaaaaaa").blocking).toBe(true);
    expect(scorePassword("pass123456word").blocking).toBe(true);
  });

  it("accepts a long memorable passphrase without demanding symbols", () => {
    // The point of the policy: length beats character-class theatre.
    const result = scorePassword("marmalade tractor window");

    expect(result.blocking).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it("rates longer and more varied passwords higher", () => {
    const fair = scorePassword("evidence-fi");
    const strong = scorePassword("evidence-first-2026");

    expect(fair.blocking).toBe(false);
    expect(strong.score).toBeGreaterThan(fair.score);
  });

  it("reports an empty password without throwing", () => {
    const result = scorePassword("");

    expect(result.score).toBe(0);
    expect(result.blocking).toBe(true);
    expect(scorePassword(undefined).blocking).toBe(true);
  });

  it("always returns a label and a hint", () => {
    for (const password of ["", "short", "password", "marmalade tractor window"]) {
      const result = scorePassword(password);

      expect(result.label).toBeTruthy();
      expect(result.hint).toBeTruthy();
    }
  });
});

describe("validatePassword", () => {
  it("mirrors the blocking rules from scorePassword", () => {
    expect(validatePassword("marmalade tractor window")).toBeNull();
    expect(validatePassword("password")).toBeTruthy();
    expect(validatePassword("short")).toBeTruthy();
  });

  it("enforces an upper bound so hashing cannot be abused", () => {
    expect(validatePassword("a".repeat(201))).toMatch(/characters/);
  });
});

describe("validateSignup", () => {
  const VALID = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "marmalade tractor window",
    confirm: "marmalade tractor window",
    terms: "on",
  };

  it("accepts a complete submission", () => {
    expect(validateSignup(VALID)).toEqual({});
  });

  it("returns an error per missing field", () => {
    const errors = validateSignup({});

    expect(Object.keys(errors).sort()).toEqual([
      "confirm",
      "email",
      "name",
      "password",
      "terms",
    ]);
  });

  it("requires the confirmation to match", () => {
    expect(
      validateSignup({ ...VALID, confirm: "something else" }).confirm,
    ).toBeTruthy();
  });

  it("requires consent to be given explicitly", () => {
    // A pre-ticked box is not consent, so an absent value must fail.
    expect(validateSignup({ ...VALID, terms: undefined }).terms).toBeTruthy();
    expect(validateSignup({ ...VALID, terms: "off" }).terms).toBeTruthy();
    expect(validateSignup({ ...VALID, terms: true }).terms).toBeUndefined();
  });

  it("rejects a password containing the submitted name", () => {
    expect(
      validateSignup({
        ...VALID,
        password: "ada-lovelace-pass",
        confirm: "ada-lovelace-pass",
      }).password,
    ).toBeTruthy();
  });
});

describe("validateLogin", () => {
  it("only checks for emptiness", () => {
    // Rejecting a login for being "too short" would reveal that the stored
    // password is longer than what was tried.
    expect(validateLogin({ email: "a@b.com", password: "x" })).toEqual({});
    expect(validateLogin({ email: "a@b.com", password: "password" })).toEqual({});
  });

  it("reports missing fields", () => {
    const errors = validateLogin({});

    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it("does not validate the email format on sign-in", () => {
    // A "valid email" check here tells an attacker nothing useful and blocks
    // legacy accounts with odd addresses.
    expect(validateLogin({ email: "odd-address", password: "x" })).toEqual({});
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    __resetLimits();
  });

  it("allows attempts up to the limit", () => {
    const key = "user@example.com|1.2.3.4";

    for (let i = 0; i < LIMITS.MAX_ATTEMPTS; i += 1) {
      expect(checkLimit(key).allowed, `attempt ${i + 1}`).toBe(true);
      recordFailure(key);
    }

    expect(checkLimit(key).allowed).toBe(false);
  });

  it("counts down the remaining attempts", () => {
    const key = "user@example.com|1.2.3.4";

    expect(checkLimit(key).remaining).toBe(LIMITS.MAX_ATTEMPTS);

    recordFailure(key);

    expect(checkLimit(key).remaining).toBe(LIMITS.MAX_ATTEMPTS - 1);
  });

  it("reports how long until the window resets", () => {
    const key = "user@example.com|1.2.3.4";

    for (let i = 0; i < LIMITS.MAX_ATTEMPTS; i += 1) {
      recordFailure(key);
    }

    const limit = checkLimit(key);

    expect(limit.allowed).toBe(false);
    expect(limit.retryAfterSeconds).toBeGreaterThan(0);
    expect(limit.retryAfterSeconds).toBeLessThanOrEqual(LIMITS.WINDOW_MS / 1000);
  });

  it("keys are independent, so one user cannot lock out another", () => {
    const victim = "victim@example.com|9.9.9.9";
    const attacker = "victim@example.com|1.1.1.1";

    for (let i = 0; i < LIMITS.MAX_ATTEMPTS; i += 1) {
      recordFailure(attacker);
    }

    expect(checkLimit(attacker).allowed).toBe(false);
    expect(checkLimit(victim).allowed).toBe(true);
  });

  it("clears the counter after a successful sign-in", () => {
    const key = "user@example.com|1.2.3.4";

    recordFailure(key);
    recordFailure(key);
    clearAttempts(key);

    expect(checkLimit(key).remaining).toBe(LIMITS.MAX_ATTEMPTS);
  });

  it("treats an unseen key as fully allowed", () => {
    expect(checkLimit("never-seen").allowed).toBe(true);
  });
});
