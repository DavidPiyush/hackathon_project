import Link from "next/link";

import { ENDPOINTS, SCHEMAS } from "@/lib/api/schema";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Layout";
import { PageShell, Prose } from "@/components/marketing/PageShell";
import { CtaBand } from "@/components/marketing/CtaBand";

export const metadata = {
  title: "API Reference",
  description:
    "The ThreatDetect HTTP API: Google OAuth, Gmail ingestion, forensic analysis, investigations and reports.",
  alternates: { canonical: "/docs/api" },
};

const METHOD_TONES = {
  GET: "info",
  POST: "safe",
  PATCH: "warn",
  DELETE: "critical",
};

/**
 * Endpoint groups, described for a reader.
 *
 * Paths and methods come from `lib/api/schema.js`, which is transcribed from
 * the OpenAPI document — so this page cannot describe a route the client does
 * not also know about.
 */
const GROUPS = [
  {
    title: "Authentication",
    icon: "key",
    intro:
      "Google OAuth. There is no password endpoint: sign-in is a full-page redirect to Google and back, and the session is a cookie the browser sends automatically.",
    rows: [
      [ENDPOINTS.auth.googleLogin, "Begin sign-in. Redirects to Google's consent screen."],
      [ENDPOINTS.auth.googleCallback, "OAuth return path. Exchanges the code for tokens and sets the session cookie."],
      [ENDPOINTS.auth.status, "Whether the caller is signed in, and who they are."],
      [ENDPOINTS.auth.logout, "Clear the session."],
    ],
  },
  {
    title: "Gmail",
    icon: "envelope",
    intro:
      "Reads the signed-in user's mailbox using the scopes granted during OAuth. Listing is paginated with an opaque page token.",
    rows: [
      [ENDPOINTS.gmail.profile, "The connected mailbox's address and message counts."],
      [ENDPOINTS.gmail.messages, "List messages. max_results defaults to 20; query accepts Gmail search syntax."],
      [ENDPOINTS.gmail.message, "One message, including headers and body."],
    ],
  },
  {
    title: "Analysis",
    icon: "search",
    intro:
      "The forensic pipeline: header reconstruction, authentication results, indicator extraction and scoring.",
    rows: [
      [ENDPOINTS.analysis.email, "Analyse raw RFC 5322 content supplied directly."],
      [ENDPOINTS.analysis.gmailMessage, "Fetch a Gmail message by id and run the full pipeline on it."],
      [ENDPOINTS.analysis.status, "Which analysis capabilities are available."],
    ],
  },
  {
    title: "Investigations",
    icon: "folder",
    intro:
      "Cases are addressed by case_id. Updates are PATCH, so a request changes only the fields it sends.",
    rows: [
      [ENDPOINTS.investigations.list, "Every case. No filter or pagination parameters."],
      [ENDPOINTS.investigations.create, "Open a case."],
      [ENDPOINTS.investigations.get, "One case with its emails, findings, IOCs and risk."],
      [ENDPOINTS.investigations.update, "Change title, description, priority, status, analyst or notes."],
      [ENDPOINTS.investigations.remove, "Delete a case."],
      [ENDPOINTS.investigations.analyzeGmail, "Analyse a Gmail message and attach the result to a case."],
    ],
  },
  {
    title: "Reports",
    icon: "file",
    intro: "Structured forensic output for a case, as JSON or a rendered PDF.",
    rows: [
      [ENDPOINTS.reports.get, "The report as structured data."],
      [ENDPOINTS.reports.pdf, "The same report rendered to PDF."],
    ],
  },
  {
    title: "Health",
    icon: "gauge",
    intro:
      "Readiness probes. The threat-intel probe reports which providers are configured and never exposes an API key.",
    rows: [
      [ENDPOINTS.health.basic, "The application is running."],
      [ENDPOINTS.health.database, "PostgreSQL connectivity."],
      [ENDPOINTS.health.threatIntel, "Configured threat-intelligence providers."],
      [ENDPOINTS.health.services, "Internal service capability information."],
      [ENDPOINTS.health.full, "Application, database and services combined."],
    ],
  },
];

/** Render a request schema's fields as a readable table. */
function SchemaTable({ name }) {
  const schema = SCHEMAS[name];

  return (
    <Card padded={false} className="mt-4 overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <code className="ioc font-semibold text-ink">{name}</code>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left">
          <caption className="sr-only">
            Fields accepted by {name}, with their constraints
          </caption>

          <thead className="border-b border-line bg-raise">
            <tr>
              {["Field", "Type", "Constraints"].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {Object.entries(schema.fields).map(([field, rule]) => {
              const constraints = [
                schema.required.includes(field) ? "required" : "optional",
                rule.minLength !== undefined ? `min ${rule.minLength}` : null,
                rule.maxLength !== undefined ? `max ${rule.maxLength}` : null,
                rule.default !== undefined ? `default "${rule.default}"` : null,
                rule.nullable ? "nullable" : null,
              ].filter(Boolean);

              return (
                <tr key={field}>
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    <code className="ioc font-medium text-ink">{field}</code>
                  </th>

                  <td className="px-4 py-2.5">
                    <Badge tone="neutral" size="xs">
                      {rule.type}
                    </Badge>
                  </td>

                  <td className="px-4 py-2.5 text-[11px] text-ink-muted">
                    {constraints.join(" · ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function ApiDocsPage() {
  return (
    <PageShell
      eyebrow="API Reference"
      eyebrowIcon="code"
      title="ThreatDetect HTTP API"
      description="Everything the console does is available over HTTP, so analysis can run inside an existing SOAR pipeline rather than only in a browser."
      breadcrumb={[
        { name: "Documentation", href: "/docs" },
        { name: "API Reference" },
      ]}
      meta={[
        { label: "Version", value: "1.0.0" },
        { label: "Spec", value: "OpenAPI 3.1" },
        { label: "Auth", value: "Google OAuth" },
      ]}
    >
      <Section size="md">
        <Card tone="info" className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon name="info" />
            </span>

            <div>
              <p className="text-sm font-semibold text-ink">
                Point the frontend at your backend
              </p>

              <p className="mt-2 max-w-3xl text-xs leading-6 text-ink-soft">
                Set{" "}
                <code className="rounded border border-line bg-raise-md px-1.5 py-0.5 font-mono text-[11px] text-ink">
                  NEXT_PUBLIC_API_URL
                </code>{" "}
                to the FastAPI origin. Until it is set, Google sign-in is
                disabled and the console runs against its local demo store. The{" "}
                <Link
                  href="/dashboard/analysis"
                  className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  header analyzer
                </Link>{" "}
                works either way, because it parses in the browser and needs no
                API at all.
              </p>
            </div>
          </div>
        </Card>

        <Prose className="mt-10 max-w-none">
          <h2 id="authentication">Authentication</h2>

          <p>
            The API authenticates with <strong>Google OAuth</strong> and a
            session cookie — there is no password endpoint. Sign-in is a
            top-level navigation, not a <code>fetch</code>: the flow redirects
            to Google and back to the callback, which a same-origin request
            cannot follow.
          </p>

          <pre>
            <code>{`// Start sign-in — a real navigation, not a fetch
window.location.href = \`\${API_URL}/auth/google\`;

// Later, check who is signed in
const status = await fetch(\`\${API_URL}/auth/status\`, {
  credentials: "include",   // the session is a cookie
}).then((response) => response.json());`}</code>
          </pre>

          <p>
            Because the session is a cookie, every request must send{" "}
            <code>credentials: &quot;include&quot;</code> — which also means the
            backend&rsquo;s CORS policy has to name the frontend origin
            explicitly. A wildcard is not permitted with credentialed requests.
          </p>

          <h2 id="endpoints">Endpoints</h2>
        </Prose>

        <div className="mt-6 space-y-6">
          {GROUPS.map((group) => (
            <Card key={group.title} className="p-6">
              <CardHeader
                icon={group.icon}
                title={group.title}
                subtitle={group.intro}
                level={3}
              />

              <ul className="mt-6 space-y-3">
                {group.rows.map(([endpoint, note]) => (
                  <li
                    key={`${endpoint.method} ${endpoint.path}`}
                    className="rounded-lg border border-line bg-raise p-3"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        tone={METHOD_TONES[endpoint.method] ?? "neutral"}
                        size="sm"
                        uppercase
                      >
                        {endpoint.method}
                      </Badge>

                      <code className="ioc font-semibold text-ink">
                        {endpoint.path}
                      </code>

                      {endpoint.query && (
                        <span className="text-[10px] text-ink-faint">
                          query: {endpoint.query.join(", ")}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                      {note}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Prose className="mt-12 max-w-none">
          <h2 id="schemas">Request bodies</h2>

          <p>
            These constraints are enforced client-side too, so an over-long
            title is rejected before it becomes a 422 the user has to decode.
          </p>
        </Prose>

        <SchemaTable name="EmailAnalysisRequest" />
        <SchemaTable name="InvestigationCreate" />
        <SchemaTable name="InvestigationUpdate" />

        <Prose className="mt-12 max-w-none">
          <h2 id="analysis-example">Analysing a message</h2>

          <pre>
            <code>{`POST /analysis/email
Content-Type: application/json

{
  "raw_email": "Received: from mail.example.com ...\\nFrom: \\"Finance\\" <finance@example.com>\\nSubject: Urgent Invoice Payment Required",
  "case_id": "IR-2026-018"
}`}</code>
          </pre>

          <p>
            <code>case_id</code> is optional. Supplying it associates the
            analysis with an existing case; omitting it produces a standalone
            result.
          </p>

          <h2 id="errors">Errors</h2>

          <p>
            Validation failures return <code>422</code> with FastAPI&rsquo;s
            standard body. The client maps it onto per-field errors, so the same
            rendering handles a local rejection and a server one.
          </p>

          <pre>
            <code>{`422 Unprocessable Entity

{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "String should have at least 1 character",
      "type": "string_too_short"
    }
  ]
}`}</code>
          </pre>

          <ul>
            <li>
              <code>401</code> / <code>403</code> — no valid session. Send the
              user back through <code>/auth/google</code>.
            </li>
            <li>
              <code>404</code> — no case or message with that id.
            </li>
            <li>
              <code>422</code> — the body failed validation; read{" "}
              <code>detail</code>.
            </li>
          </ul>

          <h2 id="field-names">A note on field names</h2>

          <p>
            This console&rsquo;s own data model uses the API&rsquo;s field names
            — <code>case_id</code>, <code>description</code>,{" "}
            <code>status</code>, <code>notes</code> — rather than the names an
            isolated frontend would have invented. That is deliberate: swapping
            the local demo store for live HTTP calls should not require renaming
            anything in the UI, and{" "}
            <code>__tests__/api-contract.test.js</code> fails if the two drift
            apart.
          </p>
        </Prose>
      </Section>

      <CtaBand
        eyebrow="Questions"
        title="Need an endpoint that is not here?"
        description="Tell us what your pipeline needs and we will tell you whether it is on the roadmap."
        primaryHref="/#contact"
        primaryLabel="Contact the team"
        secondaryHref="/docs"
        secondaryLabel="Back to docs"
      />
    </PageShell>
  );
}
