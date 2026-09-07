/**
 * @vitest-environment node
 *
 * These modules are server-only. Running them under jsdom puts typed arrays in
 * a different realm from the one jose checks against, so a perfectly valid key
 * fails its instanceof test — an artefact of the environment, not the code.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sessions, the user store and the auth actions.
 *
 * `next/headers` and `next/navigation` only exist inside a request, so both
 * are mocked with implementations that behave like the real thing: a cookie
 * jar that records what was set, and a `redirect` that throws the way Next's
 * does (so code after it genuinely does not run).
 */

const cookieJar = new Map();

let requestHeaders = new Map([["x-forwarded-for", "203.0.113.5"]]);

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name).value } : undefined,
    set: (name, value, options) => cookieJar.set(name, { value, options }),
    delete: (name) => cookieJar.delete(name),
  }),
  headers: async () => ({
    get: (name) => requestHeaders.get(name) ?? null,
  }),
}));

class RedirectError extends Error {
  constructor(url) {
    super(`NEXT_REDIRECT:${url}`);
    this.digest = `NEXT_REDIRECT;${url}`;
    this.url = url;
  }
}

vi.mock("next/navigation", () => ({
  redirect: (url) => {
    throw new RedirectError(url);
  },
}));

const {
  SESSION_COOKIE,
  encryptSession,
  decryptSession,
  createSession,
  getSession,
  deleteSession,
} = await import("@/lib/auth/session");

const {
  findByEmail,
  createUser,
  verifyCredentials,
  getPublicUser,
  DEMO_CREDENTIALS,
  __resetUsers,
  __userCount,
} = await import("@/lib/auth/users");

const { signupAction, loginAction, logoutAction } = await import(
  "@/lib/actions/auth"
);

const { __resetLimits, LIMITS } = await import("@/lib/auth/rate-limit");

/** Capture the redirect an action performs, or null if it returned instead. */
async function runAction(action, formData, state = {}) {
  try {
    const result = await action(state, formData);

    return { redirected: null, state: result };
  } catch (error) {
    if (error instanceof RedirectError) {
      return { redirected: error.url, state: null };
    }

    throw error;
  }
}

const form = (fields) => {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      data.set(key, value);
    }
  }

  return data;
};

beforeEach(() => {
  cookieJar.clear();
  requestHeaders = new Map([["x-forwarded-for", "203.0.113.5"]]);
  __resetUsers();
  __resetLimits();
});

/* ============================ SESSIONS ============================ */

describe("session tokens", () => {
  it("round-trips a payload", async () => {
    const token = await encryptSession({ userId: "u-1", role: "analyst", name: "Ada" });
    const payload = await decryptSession(token);

    expect(payload.userId).toBe("u-1");
    expect(payload.role).toBe("analyst");
    expect(payload.name).toBe("Ada");
  });

  it("sets standard JWT claims", async () => {
    const payload = await decryptSession(
      await encryptSession({ userId: "u-1" }),
    );

    expect(payload.iss).toBe("threatdetect");
    expect(payload.aud).toBe("threatdetect-console");
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("rejects a token whose payload was edited", async () => {
    const token = await encryptSession({ userId: "u-1", role: "analyst" });
    const [header, payload, signature] = token.split(".");

    // Re-encode the payload with an escalated role and keep the original
    // signature, which is what a privilege-escalation attempt looks like.
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());

    const forged = Buffer.from(
      JSON.stringify({ ...decoded, role: "admin" }),
    ).toString("base64url");

    expect(await decryptSession(`${header}.${forged}.${signature}`)).toBeNull();
  });

  it("rejects a token whose signature was altered", async () => {
    const token = await encryptSession({ userId: "u-1", role: "analyst" });
    const [header, payload, signature] = token.split(".");

    /*
      Altered mid-signature rather than at the end: the final base64url
      character encodes only part of a byte, so several different characters
      there decode to identical bytes and the token would still verify.
    */
    const middle = Math.floor(signature.length / 2);
    const swapped = signature[middle] === "a" ? "b" : "a";

    const tampered = [
      header,
      payload,
      signature.slice(0, middle) + swapped + signature.slice(middle + 1),
    ].join(".");

    expect(await decryptSession(tampered)).toBeNull();
  });

  it("rejects an unsigned 'alg: none' token", async () => {
    // The classic JWT bypass. Pinning algorithms is what stops it.
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");

    const body = Buffer.from(
      JSON.stringify({
        userId: "attacker",
        iss: "threatdetect",
        aud: "threatdetect-console",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url");

    expect(await decryptSession(`${header}.${body}.`)).toBeNull();
  });

  it("rejects garbage and absent tokens", async () => {
    for (const token of [undefined, null, "", "not.a.jwt", "a.b.c"]) {
      expect(await decryptSession(token)).toBeNull();
    }
  });

  it("rejects a token with no userId", async () => {
    // A signed but identity-less token must not count as a session.
    expect(await decryptSession(await encryptSession({ role: "admin" }))).toBeNull();
  });
});

describe("session cookie", () => {
  it("is httpOnly, same-site and scoped to the whole site", async () => {
    await createSession({ userId: "u-1", role: "analyst", name: "Ada" });

    const { options } = cookieJar.get(SESSION_COOKIE);

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.expires.getTime()).toBeGreaterThan(Date.now());
  });

  it("stores a verifiable token, not the raw identity", async () => {
    await createSession({ userId: "u-1", role: "analyst", name: "Ada" });

    const { value } = cookieJar.get(SESSION_COOKIE);

    // Signed JWT: three dot-separated segments, and the id is not in plaintext.
    expect(value.split(".")).toHaveLength(3);
    expect(value).not.toContain("u-1");
  });

  it("is readable back through getSession", async () => {
    await createSession({ userId: "u-42", role: "analyst", name: "Ada" });

    expect((await getSession()).userId).toBe("u-42");
  });

  it("returns null when no cookie is present", async () => {
    expect(await getSession()).toBeNull();
  });

  it("is cleared on delete", async () => {
    await createSession({ userId: "u-1", role: "analyst", name: "Ada" });
    await deleteSession();

    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
    expect(await getSession()).toBeNull();
  });
});

/* ============================ USER STORE ============================ */

describe("user store", () => {
  it("seeds the demo account on first lookup", async () => {
    const user = await findByEmail(DEMO_CREDENTIALS.email);

    expect(user).not.toBeNull();
    expect(user.email).toBe(DEMO_CREDENTIALS.email);
  });

  it("signs the demo account in with its published password", async () => {
    const user = await verifyCredentials(
      DEMO_CREDENTIALS.email,
      DEMO_CREDENTIALS.password,
    );

    expect(user).not.toBeNull();
    expect(user.role).toBe("analyst");
  });

  it("creates an account and hashes the password", async () => {
    const { user } = await createUser({
      name: "Ada Lovelace",
      email: "Ada@Example.com",
      password: "marmalade tractor window",
    });

    expect(user.id).toBeTruthy();
    // Email is normalised for consistent lookup.
    expect(user.email).toBe("ada@example.com");
    // The public projection must never carry the hash.
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("refuses a duplicate email regardless of case", async () => {
    await createUser({
      name: "Ada",
      email: "ada@example.com",
      password: "marmalade tractor window",
    });

    const second = await createUser({
      name: "Someone Else",
      email: "ADA@EXAMPLE.COM",
      password: "different passphrase here",
    });

    expect(second.error).toBe("EMAIL_TAKEN");
    expect(second.user).toBeUndefined();
  });

  it("verifies the right password and rejects the wrong one", async () => {
    await createUser({
      name: "Ada",
      email: "ada@example.com",
      password: "marmalade tractor window",
    });

    expect(
      await verifyCredentials("ada@example.com", "marmalade tractor window"),
    ).not.toBeNull();

    expect(
      await verifyCredentials("ada@example.com", "wrong passphrase"),
    ).toBeNull();
  });

  it("returns null for an unknown account without throwing", async () => {
    expect(await verifyCredentials("nobody@example.com", "whatever")).toBeNull();
  });

  it("does not leak whether an account exists through timing", async () => {
    /*
      An early return for an unknown email would make that case measurably
      faster than a wrong password, turning login into an enumeration oracle.
      The store hashes against a dummy value instead. This asserts the same
      order of magnitude rather than an exact figure, which would be flaky.
    */
    await createUser({
      name: "Ada",
      email: "ada@example.com",
      password: "marmalade tractor window",
    });

    const time = async (email) => {
      const start = performance.now();
      await verifyCredentials(email, "some attempted password");
      return performance.now() - start;
    };

    const unknown = await time("nobody@example.com");
    const known = await time("ada@example.com");

    const ratio = Math.max(unknown, known) / Math.max(1, Math.min(unknown, known));

    expect(ratio).toBeLessThan(4);
  });

  it("resolves a public user by id", async () => {
    const { user } = await createUser({
      name: "Ada",
      email: "ada@example.com",
      password: "marmalade tractor window",
    });

    const found = await getPublicUser(user.id);

    expect(found.email).toBe("ada@example.com");
    expect(found).not.toHaveProperty("passwordHash");
  });

  it("returns null for an id that no longer exists", async () => {
    expect(await getPublicUser("does-not-exist")).toBeNull();
  });
});

/* ============================ ACTIONS ============================ */

describe("signupAction", () => {
  const VALID = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "marmalade tractor window",
    confirm: "marmalade tractor window",
    terms: "on",
  };

  it("creates the account, signs in, and redirects to the console", async () => {
    const { redirected } = await runAction(signupAction, form(VALID));

    expect(redirected).toBe("/dashboard");
    expect(cookieJar.has(SESSION_COOKIE)).toBe(true);
    expect((await getSession()).name).toBe("Ada Lovelace");
  });

  it("returns field errors and creates nothing when invalid", async () => {
    const before = __userCount();

    const { state, redirected } = await runAction(
      signupAction,
      form({ ...VALID, email: "not-an-email" }),
    );

    expect(redirected).toBeNull();
    expect(state.status).toBe("error");
    expect(state.errors.email).toBeTruthy();
    expect(__userCount()).toBe(before);
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
  });

  it("never echoes the password back to the client", async () => {
    const { state } = await runAction(
      signupAction,
      form({ ...VALID, email: "bad" }),
    );

    expect(state.values.email).toBe("bad");
    expect(state.values).not.toHaveProperty("password");
    expect(state.values).not.toHaveProperty("confirm");
  });

  it("rejects a duplicate email and points at sign-in", async () => {
    await runAction(signupAction, form(VALID));
    cookieJar.clear();

    const { state } = await runAction(signupAction, form(VALID));

    expect(state.status).toBe("error");
    expect(state.errors.email).toMatch(/already exists/i);
    expect(state.message).toMatch(/signing in/i);
  });

  it("requires the consent box", async () => {
    const { state } = await runAction(
      signupAction,
      form({ ...VALID, terms: undefined }),
    );

    expect(state.errors.terms).toBeTruthy();
  });

  it("rejects a weak password before storing anything", async () => {
    const { state } = await runAction(
      signupAction,
      form({ ...VALID, password: "password", confirm: "password" }),
    );

    expect(state.errors.password).toBeTruthy();
    expect(__userCount()).toBe(0);
  });
});

describe("loginAction", () => {
  beforeEach(async () => {
    await createUser({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "marmalade tractor window",
    });
  });

  it("signs in valid credentials and redirects to the console", async () => {
    const { redirected } = await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "marmalade tractor window" }),
    );

    expect(redirected).toBe("/dashboard");
    expect((await getSession()).userId).toBeTruthy();
  });

  it("honours a safe return path", async () => {
    const { redirected } = await runAction(
      loginAction,
      form({
        email: "ada@example.com",
        password: "marmalade tractor window",
        next: "/dashboard/inbox",
      }),
    );

    expect(redirected).toBe("/dashboard/inbox");
  });

  it("refuses an off-site return path", async () => {
    // Otherwise ?next= is an open redirect for phishing.
    for (const next of [
      "https://evil.example.com",
      "//evil.example.com",
      "/docs",
      "javascript:alert(1)",
    ]) {
      cookieJar.clear();

      const { redirected } = await runAction(
        loginAction,
        form({
          email: "ada@example.com",
          password: "marmalade tractor window",
          next,
        }),
      );

      expect(redirected, next).toBe("/dashboard");
    }
  });

  it("gives the same message for a wrong password and an unknown account", async () => {
    const wrongPassword = await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "not the password" }),
    );

    const unknownAccount = await runAction(
      loginAction,
      form({ email: "nobody@example.com", password: "not the password" }),
    );

    // Distinguishable messages would let anyone test which emails are
    // registered.
    expect(wrongPassword.state.message).toBe(unknownAccount.state.message);
    expect(wrongPassword.state.message).toMatch(/incorrect email or password/i);
  });

  it("sets no session on a failed attempt", async () => {
    await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "wrong" }),
    );

    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
  });

  it("reports missing fields without consulting the store", async () => {
    const { state } = await runAction(loginAction, form({}));

    expect(state.errors.email).toBeTruthy();
    expect(state.errors.password).toBeTruthy();
  });

  it("locks out after too many failures", async () => {
    for (let i = 0; i < LIMITS.MAX_ATTEMPTS; i += 1) {
      await runAction(
        loginAction,
        form({ email: "ada@example.com", password: `wrong-${i}` }),
      );
    }

    const { state } = await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "marmalade tractor window" }),
    );

    // Even the correct password is refused while the window is open.
    expect(state.status).toBe("error");
    expect(state.message).toMatch(/too many failed attempts/i);
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
  });

  it("warns as the remaining attempts run low", async () => {
    let message = "";

    for (let i = 0; i < LIMITS.MAX_ATTEMPTS - 1; i += 1) {
      const { state } = await runAction(
        loginAction,
        form({ email: "ada@example.com", password: `wrong-${i}` }),
      );

      message = state.message;
    }

    expect(message).toMatch(/attempts? left/i);
  });

  it("clears the counter after a successful sign-in", async () => {
    await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "wrong" }),
    );

    await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "marmalade tractor window" }),
    );

    cookieJar.clear();

    // A fresh failure should not be near the limit.
    const { state } = await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "wrong" }),
    );

    expect(state.message).toBe("Incorrect email or password.");
  });

  it("throttles per address as well as per account", async () => {
    for (let i = 0; i < LIMITS.MAX_ATTEMPTS; i += 1) {
      await runAction(
        loginAction,
        form({ email: "ada@example.com", password: `wrong-${i}` }),
      );
    }

    // A different client address is unaffected, so one attacker cannot lock
    // a legitimate user out of their own account.
    requestHeaders = new Map([["x-forwarded-for", "198.51.100.9"]]);

    const { redirected } = await runAction(
      loginAction,
      form({ email: "ada@example.com", password: "marmalade tractor window" }),
    );

    expect(redirected).toBe("/dashboard");
  });
});

describe("logoutAction", () => {
  it("clears the session and redirects to sign-in", async () => {
    await createSession({ userId: "u-1", role: "analyst", name: "Ada" });

    const { redirected } = await runAction(
      (_state) => logoutAction(),
      form({}),
    );

    expect(redirected).toBe("/login");
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
  });
});

/* ======================= SECRET CONFIGURATION ======================= */

describe("session secret configuration", () => {
  const original = { env: process.env.NODE_ENV, secret: process.env.SESSION_SECRET };

  afterEach(() => {
    process.env.NODE_ENV = original.env;

    if (original.secret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = original.secret;
    }
  });

  it("refuses to sign a session in production without a secret", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.SESSION_SECRET;

    await expect(encryptSession({ userId: "u-1" })).rejects.toThrow(
      /SESSION_SECRET must be set/,
    );
  });

  it("surfaces a missing production secret instead of reporting a bad token", async () => {
    /*
      This is the important one. If the configuration error were swallowed as
      "invalid token", every request would look unauthenticated and the whole
      site would redirect to /login — presenting as "login is broken" rather
      than "the secret is not set".
    */
    const token = await encryptSession({ userId: "u-1" });

    process.env.NODE_ENV = "production";
    delete process.env.SESSION_SECRET;

    await expect(decryptSession(token)).rejects.toThrow(
      /SESSION_SECRET must be set/,
    );
  });

  it("rejects a production secret that is too short to be useful", async () => {
    process.env.NODE_ENV = "production";
    process.env.SESSION_SECRET = "too-short";

    await expect(encryptSession({ userId: "u-1" })).rejects.toThrow(
      /at least 32 characters/,
    );
  });

  it("uses a supplied secret when it is long enough", async () => {
    process.env.SESSION_SECRET = "a".repeat(40);

    const payload = await decryptSession(
      await encryptSession({ userId: "u-1" }),
    );

    expect(payload.userId).toBe("u-1");
  });

  it("does not verify a token signed with a different secret", async () => {
    process.env.SESSION_SECRET = "a".repeat(40);
    const token = await encryptSession({ userId: "u-1" });

    process.env.SESSION_SECRET = "b".repeat(40);

    expect(await decryptSession(token)).toBeNull();
  });
});
