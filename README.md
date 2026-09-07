# ThreatDetect

An AI-assisted **email threat detection and forensic intelligence** platform. It analyses suspicious
messages, reconstructs the technical evidence behind them, correlates indicators across cases, and
produces defensible investigation reports.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS v4. **Real authentication**, light
and dark themes, full CRUD across every console module, and 470 tests.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional in dev, required in production
npm run dev                  # http://localhost:3000
```

### Signing in

The console is behind authentication. Either create an account at `/signup`, or use the seeded
demo credentials shown on the sign-in page:

```
analyst@threatdetect.com
evidence-first-2026
```

| Script               | What it does                               |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Development server                         |
| `npm run build`      | Production build                           |
| `npm start`          | Serve the production build                 |
| `npm run lint`       | ESLint (flat config, `eslint-config-next`) |
| `npm test`           | Vitest suite, single run                   |
| `npm run test:watch` | Vitest in watch mode                       |
| `npm run verify`     | Lint → test → build, in that order         |

---

## What actually works

There is **no backend**, so it is worth being precise about which parts do real work.

### Real, working functionality

- **Authentication.** Real, not a mock:
  - Passwords hashed with **scrypt** (`node:crypto`, memory-hard, N=32768) with a per-account salt
    and a **timing-safe** comparison. The stored format is self-describing, so cost parameters can be
    raised later without invalidating existing hashes.
  - Sessions are **signed JWTs** (`jose`, HS256, pinned algorithm) in an **httpOnly, SameSite=Lax**
    cookie, `Secure` in production. The payload carries only id, role and display name — a JWT is
    signed, not encrypted.
  - **Layered route protection**: `proxy.js` does a cheap cookie check to keep signed-out users off
    console URLs, and `lib/auth/dal.js` runs the authoritative check inside every page. A layout
    check alone is not sufficient — layouts do not re-render on navigation and do not stop nested
    segments from rendering.
  - **Login does not leak which emails are registered**: one message for both a wrong password and
    an unknown account, and an unknown email still runs a hash comparison so the two cases take the
    same time.
  - **Throttling** per email *and* client address, so one attacker cannot lock a real user out.
  - `?next=` is validated server-side, so it cannot become an open redirect.
  - Password policy follows **NIST SP 800-63B**: a length floor, a blocklist of what attacks
    actually try, and rejection of sequences or the user's own name — no forced character classes.
- **Email header analyzer** (`/dashboard/analysis`) — paste raw RFC 5322 headers and it unfolds
  them, reconstructs the `Received` routing path origin-first, reads SPF/DKIM/DMARC and alignment,
  extracts indicators, and produces a scored assessment with every contributing signal listed. It
  runs **entirely in the browser**: hostile evidence never leaves the machine.
- **Full CRUD across the console**, persisted to `localStorage` so work survives a reload:

  | Module              | Operations                                                                        |
  | ------------------- | --------------------------------------------------------------------------------- |
  | **Inbox**           | Star, mark read/unread, archive, delete, restore, assign to a case — single + bulk |
  | **Investigations**  | Create, edit, move between states, delete                                          |
  | **Threat Intel**    | Register an indicator, run enrichment, override a verdict, remove                  |
  | **Reports**         | Generate (staged progress), finalise to immutable, delete                          |
  | **Settings**        | Edit as a draft, save, revert, restore defaults, reset the whole console           |

  Every destructive action reports through a toast with **undo**, and deletes are soft — the
  evidence record is never destroyed.

- **Light / dark / system theming** with a switch in both headers.
- **Contact form** — posts to a Server Action, validates server-side, renders per-field errors,
  preserves input on failure, and rejects credential-shaped content.

### Demonstration data

The seed corpus (emails, investigations, indicators, reports) lives in `lib/data/`. Every derived
figure — counts, distributions, severity bands, linked-evidence totals — is **computed from live
store state**, so nothing on screen can contradict anything else. `/docs/api` documents an intended
API contract; those endpoints are not deployed.

---

## Architecture

```
app/                        Routes only — thin, mostly server components
  layout.jsx                Fonts, metadata, theme script, skip link
  page.jsx                  Landing page
  (auth)/                   /login and /signup — route group, adds no URL segment
  dashboard/                Console shell + 9 pages
  docs/ security/ privacy/  Content pages
  sitemap.js robots.js      Public routes only, and consistent with each other
  error.jsx not-found.jsx

components/
  ui/                       Design system primitives
  providers/                Theme, toasts, data store
  marketing/                Landing-page sections
  dashboard/                Console shell, evidence panels, CRUD islands

lib/
  auth/                     password, session, users, dal, rate-limit, validation
  data/                     Pure seed data — no UI imports
  store/                    Reducer, selectors, theme store
  utils/                    Risk scale, header parser, tones, formatting
  actions/                  Server Actions

proxy.js                    Optimistic auth gate (Middleware was renamed in Next 16)

__tests__/                  Vitest + React Testing Library
```

### Theming

Both themes are one set of semantic names. Raw values live as CSS variables on `:root` (light) and
`[data-theme="dark"]`; `@theme inline` maps them to Tailwind utilities so they emit `var(--token)`
rather than a baked literal — which is what makes a runtime switch work with no reflow.

An inline `ThemeScript` stamps `data-theme` **before first paint**, so a dark-mode user never sees a
white flash. The preference is read through `useSyncExternalStore`, which means it hydrates cleanly,
follows the OS while set to `system`, and syncs across tabs.

Components never hold a hex value — they take a semantic `tone` and resolve it through
`lib/utils/tones.js`. The **risk scale** in `lib/utils/risk.js` is the spine: a 0–100 score maps to
exactly one severity band, and every badge, meter, border and label derives from it.

### Authentication

```
proxy.js            optimistic  — cookie check only, runs on every request
lib/auth/dal.js     authoritative — memoised with React cache(), called by every page
```

The user store (`lib/auth/users.js`) is **the one part that is not production-ready**, and the
comment at the top of that file says so. Records live in a module-level `Map`, so accounts are lost
on restart and are not shared between instances. Everything around it is real. The interface is
deliberately the shape a database adapter would have — `findByEmail`, `findById`, `createUser`,
`verifyCredentials` — so swapping in Postgres is a change to that file alone.

`SESSION_SECRET` is **required in production**. Without it the app throws with an actionable
message rather than signing sessions with a value that is public in this repository — and rather
than failing closed on every request, which would present as "login is broken".

### Single sources of truth

Four choke points, each closing a class of bug:

| Concern            | Lives in                         | Enforced by                                            |
| ------------------ | -------------------------------- | ------------------------------------------------------ |
| Every link         | `lib/data/site.js`               | `routes.test.js` walks these against the real `app/`   |
| Every icon         | `components/ui/Icon.jsx`         | Data references icons by name; a typo fails the suite   |
| Every risk colour  | `risk.js` + `tones.js`           | Score, label and colour cannot drift apart              |
| Every mutation     | `lib/store/reducer.js`           | `store.test.js` covers each transition in isolation     |

---

## Testing

```bash
npm test
```

**470 tests across 15 files.** Beyond ordinary coverage, the suite pins the specific defects this
codebase was rebuilt to fix, and the ones found while rebuilding it:

- **`routes.test.js`** walks the real `app/` directory and asserts every internal `href` — in the
  nav tables *and* hardcoded in JSX — resolves to a page that exists, and that no route segment is
  uppercase. The original code shipped 21 broken links that the build, linter and type checker all
  passed.
- **`contrast.test.js`** parses the token blocks out of `globals.css` and computes real WCAG ratios
  for every foreground/background pair in **both themes**. It caught `ink-faint` on `elevated`
  sitting at 2.98:1 in light mode.
- **`store.test.js`** covers every reducer transition, plus the persistence round trip — including
  that a stored snapshot can never resurrect stale forensic data.
- **`crud.test.jsx`** drives the real provider tree, so each test exercises the component, the
  reducer and the toast together.
- **`modal.test.jsx`** covers Escape, backdrop dismissal, focus entry and return, Tab wrapping both
  ways, and scroll locking. It caught the modal re-focusing its panel on every parent render, which
  meant **typing into any dialog form lost focus after the first character**.
- **`inbox.test.jsx`** covers the select-all regression (compared by id, not count) and the full
  archive → undo → restore → delete → recover cycle.
- **`auth-crypto.test.js`** covers hashing (salting, timing-safe verify, failing closed on a
  malformed hash), the password policy, and throttling.
- **`auth-session.test.js`** mocks `next/headers` and `next/navigation` to drive the real Server
  Actions. It covers cookie attributes, the `alg: none` JWT bypass, payload tampering, the
  enumeration-timing equalisation, open-redirect rejection, lockout, and the missing-secret failure
  mode.
- **`auth-forms.test.jsx`** covers labels, autocomplete hints, the reveal toggle, and the live
  strength meter.
- **`parse-headers.test.js`** covers folded headers, CRLF, malformed input and out-of-range IPs.

---

## Accessibility

Treated as a correctness property, not a pass at the end:

- One `<main>` landmark and one `<h1>` per page (the landing page previously had four and six).
- **`IconButton` requires a `label` prop** — the component's own signature is what prevents
  unlabelled icon buttons, of which there were 34.
- Row controls that showed only a value (`malicious`, `Active`) now name their subject:
  *"Change verdict for secure-payments.com — currently malicious"*.
- Dialogs: `role="dialog"`, `aria-modal`, labelled by title, Escape to close, backdrop dismissal,
  focus trapped and returned, background scroll locked.
- Tabs follow the ARIA tabs pattern with arrow/Home/End; switches use `role="switch"`; the theme
  control is a labelled `radiogroup`.
- Destructive actions use an inline `role="alertdialog"` rather than `window.confirm`.
- Form errors are wired with `aria-describedby` / `aria-invalid` and announced, never colour-only.
- **Cursor affordances are restored centrally.** Tailwind v4's preflight sets `cursor: default` on
  buttons, which made every control feel inert; one base rule covers buttons, `role="button"`,
  switches, tabs, links, `summary` and `label[for]`, with `not-allowed` for disabled controls.
- A skip link, a visible focus ring on every interactive element, and full
  `prefers-reduced-motion` support.

---

## Notable implementation choices

- **No charting library.** The trend chart and distribution bars are hand-drawn inline SVG,
  rendered on the server with zero client JavaScript, exposed via `role="img"` with a real label.
- **No map library.** The GeoIP view is a schematic projection — no tile requests, no client
  bundle, and honest about being approximate.
- **Client components only where interaction demands it.** Static sections are server components;
  the interactive islands inside a page sit below the providers in the React tree, so pages
  themselves stay on the server.
- **Spinners only where work is genuinely slow.** Instant local mutations (starring, archiving)
  update optimistically with no spinner; report generation and indicator enrichment — which are
  real network work in a deployment — show staged progress instead.
- **`.jsx` for files containing JSX.** Next.js permits JSX in `.js`, but keeping the extension
  honest matches every other tool's default.

---

## Known limits

Stated here for the same reason the product states them in its own UI:

- GeoIP resolves where a **network** is registered, never where a person is.
- Header-only analysis marks every extracted indicator `unknown` — a verdict needs DNS, RDAP and
  reputation enrichment a browser cannot perform.
- A passing SPF, DKIM or DMARC check proves a message came from infrastructure authorised for
  *that domain*. It says nothing about whether the domain is trustworthy.
- Console state persists to **this browser only**. There is no server to sync to, and
  Settings → *Reset the console* clears it.
- **Accounts live in server memory.** They are lost on restart and not shared between instances.
  Do not reuse a real password; the sign-in screen says so.
- There is **no password reset**, because there is no mail service. The link is deliberately inert
  rather than a dead end that looks like it works.
- Sessions are stateless, so a single session cannot be revoked server-side before it expires —
  the usual trade-off for not keeping a session table.
