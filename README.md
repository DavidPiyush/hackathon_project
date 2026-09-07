# ThreatDetect

An AI-assisted **email threat detection and forensic intelligence** platform. It analyses suspicious
messages, reconstructs the technical evidence behind them, correlates indicators across cases, and
produces defensible investigation reports.

Built with Next.js 16 (App Router), React 19 and Tailwind CSS v4.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Development server                              |
| `npm run build`       | Production build                                |
| `npm start`           | Serve the production build                      |
| `npm run lint`        | ESLint (flat config, `eslint-config-next`)      |
| `npm test`            | Vitest suite, single run                        |
| `npm run test:watch`  | Vitest in watch mode                            |
| `npm run verify`      | Lint → test → build, in that order              |

---

## What actually works

This is a front end with **no deployed backend**, so it is worth being precise about which parts do
real work and which are demonstrations.

**Real, working functionality**

- **Email header analyzer** (`/dashboard/analysis`) — paste raw RFC 5322 headers and it unfolds them,
  reconstructs the `Received` routing path origin-first, reads SPF/DKIM/DMARC and alignment,
  extracts indicators, and produces a scored assessment with every contributing signal listed.
  It runs **entirely in the browser**: hostile evidence never leaves the machine.
- **Contact form** (`/#contact`) — posts to a Server Action, validates server-side, renders
  per-field errors, preserves input on failure, and rejects credential-shaped content. It reports
  honestly that there is no mail backend rather than implying a human received the message.
- All filtering, search, selection, tabs, dialogs, menus and toggles across the console.

**Demonstration data**

- The email corpus, investigations, indicator registry, campaign clusters, GeoIP origins and
  reports are fixtures in `lib/data/`. Every derived figure (counts, distributions, severity bands)
  is computed from them, so nothing on screen contradicts anything else.
- `/docs/api` documents an intended API contract; those endpoints are not deployed.

---

## Architecture

```
app/                        Routes only — thin, mostly server components
  layout.jsx                Fonts, metadata, skip link
  page.jsx                  Landing page (composes marketing sections)
  dashboard/                Console shell + 9 pages
  docs/ · security/ privacy/  Content pages
  sitemap.js · robots.js    Generated from the same nav tables as the UI
  error.jsx · not-found.jsx

components/
  ui/                       Design system primitives
  marketing/                Landing-page sections
  dashboard/                Console shell, evidence panels, analyzer

lib/
  data/                     Pure data — no UI imports
  utils/                    Risk scale, header parser, formatting, tones
  actions/                  Server Actions

__tests__/                  Vitest + React Testing Library
```

### Design system

Colour, type and motion live as tokens in `app/globals.css` under Tailwind v4's `@theme`.
Components never hardcode a hex value — they take a semantic `tone` name and resolve it through
`lib/utils/tones.js`, so a severity looks identical everywhere it appears.

The **risk scale** is the backbone: a 0–100 score maps to exactly one severity band in
`lib/utils/risk.js`, and every badge, meter, border and label derives from it. Changing a threshold
is a one-line edit that updates the entire product.

### Single sources of truth

Three deliberate choke points, each one closing a class of bug:

| Concern            | Lives in                  | Why                                                                 |
| ------------------ | ------------------------- | ------------------------------------------------------------------- |
| Every link         | `lib/data/site.js`        | A test walks these tables against the real `app/` tree              |
| Every icon         | `components/ui/Icon.jsx`  | Data references icons by name; a typo fails the suite, not silently |
| Every risk colour  | `lib/utils/risk.js` + `tones.js` | Score, label and colour cannot drift apart               |

---

## Testing

```bash
npm test
```

**198 tests across 8 files.** Beyond ordinary unit coverage, the suite pins the specific defects
this codebase was rebuilt to fix:

- **`routes.test.js`** walks the real `app/` directory and asserts every internal `href` — in the
  nav tables *and* hardcoded in JSX — resolves to a page that exists. It also fails if any route
  segment is not lowercase. The original code shipped 21 broken links that the build, the linter
  and the type checker all passed.
- **`modal.test.jsx`** covers Escape, backdrop dismissal, focus entry and return, Tab wrapping in
  both directions, and scroll locking.
- **`inbox.test.jsx`** covers the select-all regression: selection is compared by id, not by
  count, and clears when the visible set changes.
- **`parse-headers.test.js`** covers the parser against folded headers, CRLF, malformed input,
  out-of-range IPs and the full sample message.
- **`ui.test.jsx`** asserts every icon-only button has an accessible name and every meter exposes
  progressbar semantics.

---

## Accessibility

Treated as a correctness property, not a pass at the end:

- One `<main>` landmark and one `<h1>` per page (the landing page previously had four and six).
- `IconButton` **requires** a `label` prop — the type of the component is what prevents unlabelled
  icon buttons, of which there were 34.
- Dialogs: `role="dialog"`, `aria-modal`, labelled by their title, Escape to close, focus trapped
  and returned, background scroll locked.
- Tabs follow the ARIA tabs pattern with arrow/Home/End keys; switches use `role="switch"`.
- Form errors are wired with `aria-describedby` / `aria-invalid` and announced, never colour-only.
- A skip link, a visible focus ring on every interactive element, and full
  `prefers-reduced-motion` support.

---

## Notable implementation choices

- **No charting library.** The trend chart and distribution bars are hand-drawn inline SVG,
  rendered on the server with zero client JavaScript, and exposed to assistive tech via
  `role="img"` with a descriptive label.
- **No map library.** The GeoIP view is a schematic projection — no tile requests, no client
  bundle, and honest about being approximate.
- **Client components only where interaction demands it.** Static sections are server components;
  the previous version marked ~4,800 lines of inert markup `"use client"`.
- **`.jsx` for files containing JSX.** Next.js permits JSX in `.js`, but keeping the extension
  honest matches every other tool's default.

---

## Known limits

Stated here for the same reason the product states them in its own UI:

- GeoIP resolves where a **network** is registered, never where a person is.
- Header-only analysis marks every extracted indicator `unknown` — assigning a verdict needs DNS,
  RDAP and reputation enrichment that a browser cannot perform.
- A passing SPF, DKIM or DMARC check proves a message came from infrastructure authorised for
  *that domain*. It says nothing about whether the domain is trustworthy.
- Settings changes are session-only; there is no persistence layer.
