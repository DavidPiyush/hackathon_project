# Troubleshooting

Every fault below was reproduced, diagnosed and fixed. Each entry gives the **exact symptom**, so
you can match what you are seeing rather than guessing.

---

## Start here: two faults caused nearly every "it's not working" report

### 1. Sign-in failed on a production build with no `.env.local`

**Symptom.** The site loads. `/`, `/login` and `/signup` all render. You enter correct credentials,
the page reloads, and you get a red banner reading only **"UNEXPECTED ERROR"**. The URL stays on
`/login`. No session cookie is set.

**What was actually happening.** `npm start` runs with `NODE_ENV=production`. The session module
deliberately refuses to sign a token with its development fallback secret, because that value is
public in this repository. So it threw:

```
⨯ Error: SESSION_SECRET must be set to at least 32 characters in production.
```

That message only ever appeared in the **server log**. The browser got a generic 500, which React
rendered as "UNEXPECTED ERROR". Accurate, and completely useless — indistinguishable from the whole
app being broken.

Because `.env.local` is gitignored (correctly — it holds a secret), **every fresh clone hit this.**

**Fixed three ways:**

1. `npm run dev` and `npm run build` now run `scripts/ensure-env.mjs` first, which generates a
   `SESSION_SECRET` into `.env.local` if one is missing. A fresh clone works with no setup.
2. If it still happens, the sign-in form now says what to do instead of "UNEXPECTED ERROR":
   *"The server is missing its SESSION_SECRET… Run `npm run setup` to generate one, then restart."*
3. `decryptSession` deliberately lets this error propagate rather than swallowing it. Catching it
   would make every request look unauthenticated and redirect the whole site to `/login` — which
   presents as "login is broken" instead of "one variable is unset".

**If you see it:** `npm run setup`, then restart the server.

---

### 2. Sign-in rejected correct credentials on the very first attempt

**Symptom.** A correct password returns **"Incorrect email or password."** Trying again sometimes
works. It is worst immediately after starting the server.

**What was actually happening.** Seeding the demo accounts set a `seeded` **boolean** *before*
awaiting the password hash:

```js
store.seeded = true;                            // set first
const hash = await hashPassword(password);      // ~100ms
store.byEmail.set(email, user);                 // only now populated
```

Hashing takes ~100 ms *by design* — scrypt with N=32768. Any second caller arriving inside that
window saw the flag already set and returned to an **empty store**. `findByEmail` returned `null`,
and the login action reported the generic failure message.

The proxy and the page render hit the store **together on the very first request**, so this fired
exactly when someone first tried to sign in.

**Fixed** by caching the seeding **promise** rather than a boolean, so concurrent callers await the
same work. The regression test drives two concurrent lookups and fails on the old code.

---

### 3. Sign out did nothing

**Symptom.** Open the account menu, click **Sign out**. The menu closes. You are still signed in,
still on `/dashboard`, with the session cookie intact. No error anywhere.

**What was actually happening.** The `Popover` closed on any click inside its panel, which unmounted
the sign-out form **in the same tick as the click**. A submit button whose form is unmounted never
dispatches its action, so the session was never cleared.

**Fixed** by not closing the panel when the click originates inside a `<form>`. Verified by A/B
against a production build: with the guard disabled the browser test fails, with it enabled it
passes.

---

## Other things that look like breakage

### "Could not reach the backend"

The connection panel on `/dashboard` shows this when `NEXT_PUBLIC_API_URL` is set but requests fail.

**Almost always CORS.** The session is a cookie, so requests are sent with
`credentials: "include"`, and a browser **refuses** a credentialed request answered with
`Access-Control-Allow-Origin: *`. Name the origin:

```python
allow_origins=["http://localhost:3000"],   # not ["*"]
allow_credentials=True,
```

Also check: the backend is actually running, the port is right, and you used `http://` not `https://`
for a local server. The browser hides CORS detail from JavaScript by design, so check the browser
console — it will name the real cause.

### Google sign-in is greyed out

`NEXT_PUBLIC_API_URL` is not set. The button is deliberately disabled with an explanation rather
than looking available and failing on click. Set the variable and **restart** — `NEXT_PUBLIC_*` is
inlined at build time, so a running server will not pick it up.

### My account disappeared

Accounts live in the server's memory. They are gone on restart. The seeded accounts are recreated
automatically; ones you signed up with are not. Use a seeded account, or replace
`lib/auth/users.js` with a database-backed store — its interface is already the right shape.

### The console redirected me to /login

Either the session expired (they last 7 days), or the cookie was not stored. `Secure` is set in
production, so **an HTTPS origin is required** — a production build served over plain `http://` on
a non-localhost host will never keep you signed in.

### My stars, archives and cases vanished

Console changes live in `localStorage`, which is per-browser and per-origin. A different browser, a
private window, cleared site data, or a different port all start clean. **Settings → Reset the
console** does this deliberately.

### Everything indicator says "unknown" in the analyzer

Correct, and intentional. The in-browser pass reads what the headers *say*; assigning a verdict
needs DNS, RDAP and reputation lookups a browser cannot perform. With a backend configured, use
**Analyse on the server** for the full pipeline.

### Too many failed attempts

Login is throttled to 8 attempts per 15 minutes, keyed on email **and** client address. Wait for the
window, or restart the server to clear the in-memory counter.

### Settings changes do not appear on another device

They are stored in `localStorage`, not on the backend. The banner on that page says so.

---

## Reproducing the fixed faults

Both root causes have permanent regression tests:

```bash
npm test -- auth-session      # the seeding race
npm test -- modal             # focus and dismissal behaviour
```

To confirm a fresh clone works, from a clean checkout:

```bash
npm install
npm run build     # generates SESSION_SECRET
npm start
```

Then sign in with `analyst@threatdetect.com` / `evidence-first-2026`.

---

## Filing something new

Include:

- the URL you were on
- what you clicked, and what you expected
- the **server terminal output** — this is where the useful message usually is
- the **browser console** (F12) — CORS and hydration faults only appear here
- whether you were on `npm run dev` or `npm run build && npm start`

That last point matters more than it sounds: root cause #1 above only ever reproduced on a
production build.
