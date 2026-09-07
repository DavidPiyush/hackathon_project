# ThreatDetect

An AI-assisted **email threat detection and forensic intelligence** platform. It analyses suspicious
messages, reconstructs the technical evidence behind them, correlates indicators across cases, and
produces defensible investigation reports.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS v4. **Light and dark themes**, full
CRUD across every console module, and 354 tests.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
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
  data/                     Pure seed data — no UI imports
  store/                    Reducer, selectors, theme store
  utils/                    Risk scale, header parser, tones, formatting
  actions/                  Server Actions

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

**354 tests across 12 files.** Beyond ordinary coverage, the suite pins the specific defects this
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
