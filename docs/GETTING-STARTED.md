# Getting started

How to run ThreatDetect, sign in, use each screen, and connect it to the FastAPI backend.

If something is not working, jump to **[Troubleshooting](./TROUBLESHOOTING.md)** — it lists the two
faults that account for almost every "it doesn't work" report, with the exact symptom each produces.

---

## 1. Run it

You need **Node.js 20 or newer**.

```bash
git clone https://github.com/DavidPiyush/hackathon_project.git
cd hackathon_project
npm install
npm run dev
```

Open <http://localhost:3000>.

`npm run dev` runs `scripts/ensure-env.mjs` first, which creates `.env.local` with a generated
`SESSION_SECRET` if you do not already have one. **You do not need to configure anything to start.**

### Production build

```bash
npm run build
npm start          # http://localhost:3000
```

### Every script

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run setup` | Generate `SESSION_SECRET` into `.env.local` (idempotent) |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest in watch mode |
| `npm run verify` | Lint → test → build, in that order |

---

## 2. Sign in

The console at `/dashboard` requires a session. You have three ways in.

### Option A — a seeded account (fastest)

Both are listed on the sign-in page with a **Use this** button that fills the form for you.

| Role | Email | Password |
| --- | --- | --- |
| Analyst | `analyst@threatdetect.com` | `evidence-first-2026` |
| DFIR Lead | `lead@threatdetect.com` | `chain-of-custody-2026` |

### Option B — create your own

Go to `/signup`. There is no email confirmation step, because this build has no mail service — you
land straight in the console.

The password rules follow NIST SP 800-63B: **at least 10 characters**, not a commonly-used password,
and not containing your own name or email. No forced symbols — a memorable phrase like
`marmalade tractor window` scores higher than `P@ssw0rd!`.

### Option C — Google (needs the backend)

**Continue with Google** is the backend's real authentication path. It is disabled until you set
`NEXT_PUBLIC_API_URL` — see [section 5](#5-connect-the-fastapi-backend).

> Accounts created through options A and B live in the **server's memory**. They are cleared when
> the server restarts, and are not shared between instances. Do not reuse a real password.

---

## 3. What each screen does

### Public pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page — what the platform does, the evidence model, the six-stage pipeline |
| `/docs` | How to read an investigation: the risk score, authentication results, known limits |
| `/docs/api` | The HTTP API reference, generated from the same schema the client uses |
| `/security` | How hostile evidence is handled, and how to report a vulnerability |
| `/privacy` | What is collected — in this build, almost nothing |

### The console

**`/dashboard` — Overview.** Detection volume over seven days, threat composition, service health,
the highest-scoring messages, and the **backend connection panel**. Every figure is computed from
live state, so it can never disagree with the page it summarises.

**`/dashboard/inbox` — Triage.** Messages ranked by risk.

- Four views: **Inbox**, **Starred**, **Archived**, **Trash**
- Category tabs, risk filters, and search across subject, sender, domain, case id and message id
- Per row: star, archive, open
- Select rows for bulk archive, mark read/unread, add to a case, or delete
- Click a subject to open the full evidence dialog — authentication, infrastructure, indicators,
  findings, attachments
- **Every destructive action can be undone** from its toast. Deletes are soft; the evidence record
  is never destroyed.

**`/dashboard/analysis` — Email Analysis.** The most useful screen, and the one that works with no
backend at all.

1. In your mail client, open a suspicious message and choose **Show original** (Gmail) or
   **View message source** (Outlook).
2. Copy from the first `Received:` line down to the blank line before the body.
3. Paste it in and press **Analyze headers** — or press **Load sample** to see a worked example.

You get the routing path reconstructed origin-first, SPF/DKIM/DMARC and alignment results,
extracted indicators, and a score with **every contributing signal listed**. This runs entirely in
your browser: the message never leaves your machine.

With a backend configured, a second panel offers **Analyse on the server**, which posts the same
text to `POST /analysis/email` for the full pipeline — DNS, RDAP and reputation enrichment, which a
browser cannot do.

**`/dashboard/investigations` — Cases.** Create, edit, move between statuses, delete. Status and
priority use the backend's vocabulary. Deleting a case detaches its messages rather than deleting
them.

**`/dashboard/threat-intelligence` — Indicators.** Register an indicator, run enrichment against it,
override a verdict, or remove it. Campaign clusters show what correlates across cases.

**`/dashboard/geoip` — Origins.** Where sending infrastructure is registered. Read the notice at the
top: this is **not attribution**.

**`/dashboard/reports` — Output.** Generate a report with staged progress, finalise it to make it
immutable, or delete it.

**`/dashboard/settings`.** The backend connection and health probes come first, then detection,
intelligence, notification and evidence-handling toggles. **Reset the console** clears all local
changes.

**`/dashboard/help`.** Keyboard shortcuts, FAQs, and incident-response first steps.

---

## 4. Where data lives

| What | Stored in | Survives a reload? | Survives a restart? |
| --- | --- | --- | --- |
| Accounts | Server memory | Yes | **No** |
| Session | httpOnly cookie | Yes | Yes (7 days) |
| Theme choice | `localStorage` | Yes | Yes |
| Console changes (stars, archives, cases, indicators, reports, settings) | `localStorage` | Yes | Yes |
| Pasted email headers | Browser memory only | No | No |

Console changes are per-browser. They are never sent anywhere, and **Settings → Reset the console**
clears them.

---

## 5. Connect the FastAPI backend

### Point the frontend at it

Add the origin to `.env.local` and restart:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart is required — `NEXT_PUBLIC_*` variables are inlined at build time.

### Configure CORS on the backend

This is the step that catches people out. The backend session is a cookie, so the frontend sends
every request with `credentials: "include"`. A browser **refuses** a credentialed request answered
with `Access-Control-Allow-Origin: *`. The origin must be named explicitly:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # not ["*"]
    allow_credentials=True,                    # required for the session cookie
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Get this wrong and the frontend shows *"Could not reach the backend"* while the browser console
shows a CORS error. The connection panel says as much when it sees a network-class failure.

### Confirm it worked

1. Open `/dashboard`. The **Backend connection** panel should say **Connected** and list what
   `GET /health/full` returned.
2. The console header should read **Backend online** instead of **Local mode**.
3. `/dashboard/settings` should show a green probe for each health endpoint, plus an **Open FastAPI
   docs** link.
4. `/login` should offer **Sign in with Google** as a live link to `{API}/auth/google`.

### What becomes available

| Feature | Endpoint |
| --- | --- |
| Google sign-in | `GET /auth/google` |
| Connection + health panels | `GET /health/full` and the four specific probes |
| Server-side analysis | `POST /analysis/email` |

`lib/api/client.js` also covers Gmail, investigations, reports and the rest of the contract — every
endpoint in `lib/api/schema.js` is callable today. The screens above are the ones wired to the UI.

### Two authentication paths

Your API's only real authentication is **Google OAuth**; it has no password endpoint. So:

- **Google** is the production path. Use it when the backend is deployed.
- **Email + password** is local to this frontend. It exists so the console can be opened and
  demonstrated with no backend running, and it is labelled as such on screen.

If you deploy for real, prefer Google and treat the password form as demo-only.

---

## 6. Deploying

1. **Set `SESSION_SECRET`** in the host's environment — 32+ characters:
   ```bash
   openssl rand -base64 32
   ```
   In production the app refuses to sign sessions with the development fallback. It will not use a
   value that is public in this repository.
2. **Set `NEXT_PUBLIC_API_URL`** to the backend's public origin.
3. **Add the frontend origin** to the backend's CORS `allow_origins`.
4. Sessions are `Secure` in production, so the site must be served over **HTTPS** or the cookie is
   never stored.

Replacing the in-memory account store with a database is a change to `lib/auth/users.js` alone —
its interface (`findByEmail`, `findById`, `createUser`, `verifyCredentials`) is already the shape a
database adapter needs.
