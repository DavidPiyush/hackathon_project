import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Layout";
import { PageShell, Prose } from "@/components/marketing/PageShell";
import { CtaBand } from "@/components/marketing/CtaBand";

export const metadata = {
  title: "API Reference",
  description:
    "Submit messages for analysis and retrieve investigation results programmatically.",
  alternates: { canonical: "/docs/api" },
};

const ENDPOINTS = [
  {
    method: "POST",
    path: "/v1/messages",
    tone: "safe",
    summary: "Submit a message for analysis",
    detail:
      "Accepts raw RFC 5322 content. Returns an evidence record id immediately; analysis completes asynchronously.",
  },
  {
    method: "GET",
    path: "/v1/messages/{id}",
    tone: "info",
    summary: "Retrieve an analysis",
    detail:
      "Returns the score, contributing signals, authentication results, routing path, indicators and findings.",
  },
  {
    method: "GET",
    path: "/v1/indicators",
    tone: "info",
    summary: "Query the indicator registry",
    detail:
      "Filter by type, verdict, first-seen date or linked case. Paginated.",
  },
  {
    method: "POST",
    path: "/v1/cases",
    tone: "safe",
    summary: "Open an investigation",
    detail: "Creates a case and links one or more evidence records to it.",
  },
  {
    method: "GET",
    path: "/v1/cases/{id}/report",
    tone: "info",
    summary: "Generate a report",
    detail:
      "Returns the report as PDF, JSON, STIX 2.1 or CSV via the Accept header.",
  },
];

export default function ApiDocsPage() {
  return (
    <PageShell
      eyebrow="API Reference"
      eyebrowIcon="code"
      title="Programmatic access"
      description="Everything the console does is available over HTTP, so analysis can run inside an existing SOAR pipeline rather than only in a browser."
      breadcrumb={[
        { name: "Documentation", href: "/docs" },
        { name: "API Reference" },
      ]}
      meta={[
        { label: "Version", value: "v1" },
        { label: "Base URL", value: "api.threatdetect.com" },
        { label: "Auth", value: "Bearer token" },
      ]}
    >
      <Section size="md">
        {/* Status notice — this API is specified, not deployed. */}
        <Card tone="warn" className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warn/10 text-warn">
              <Icon name="info" />
            </span>

            <div>
              <p className="text-sm font-semibold text-ink">
                This is a specification, not a live endpoint
              </p>

              <p className="mt-2 max-w-3xl text-xs leading-6 text-ink-soft">
                The current build is a front end with no deployed backend. These
                routes document the intended contract so the interface and the
                API stay in step — calling them today will not succeed. The{" "}
                <Link
                  href="/dashboard/analysis"
                  className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  in-browser analyzer
                </Link>{" "}
                does work, and needs no API at all.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <Prose>
            <h2 id="authentication">Authentication</h2>

            <p>
              Every request carries a bearer token. Tokens are workspace-scoped
              and carry the same role permissions as the console, so an
              integration can never read more than its analyst could.
            </p>

            <pre>
              <code>{`curl https://api.threatdetect.com/v1/messages/EM-2041 \\
  -H "Authorization: Bearer $THREATDETECT_TOKEN" \\
  -H "Accept: application/json"`}</code>
            </pre>

            <h2 id="endpoints">Endpoints</h2>

            <div className="mt-5 space-y-3">
              {ENDPOINTS.map((endpoint) => (
                <Card key={endpoint.path} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={endpoint.tone} size="sm" uppercase>
                      {endpoint.method}
                    </Badge>

                    <code className="ioc font-semibold text-ink">
                      {endpoint.path}
                    </code>
                  </div>

                  <p className="mt-2.5 text-xs font-medium text-ink-soft">
                    {endpoint.summary}
                  </p>

                  <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
                    {endpoint.detail}
                  </p>
                </Card>
              ))}
            </div>

            <h2 id="submitting">Submitting a message</h2>

            <p>
              Post the raw message. The response returns immediately with an
              evidence id; poll the retrieval endpoint, or supply a{" "}
              <code>callback_url</code> to be notified when analysis completes.
            </p>

            <pre>
              <code>{`POST /v1/messages
Content-Type: message/rfc822

Received: from mail.example.com ...
From: "Finance" <finance@example.com>
Subject: Urgent Invoice Payment Required

--- response ---
201 Created
{
  "id": "EM-2041",
  "state": "analyzing",
  "submitted_at": "2026-09-07T10:42:03Z"
}`}</code>
            </pre>

            <h2 id="result">Reading a result</h2>

            <p>
              The result mirrors what the console shows, including the evidence
              classification on every finding. Note that{" "}
              <code>unknown</code> is a first-class value — clients must handle
              it rather than treating a missing verdict as benign.
            </p>

            <pre>
              <code>{`{
  "id": "EM-2041",
  "score": 92,
  "severity": "critical",
  "authentication": {
    "spf":       { "result": "softfail" },
    "dkim":      { "result": "none" },
    "dmarc":     { "result": "fail" },
    "alignment": { "result": "fail" }
  },
  "signals": [
    { "name": "Banking-detail change request", "weight": 0.28 },
    { "name": "Sender domain age under 30 days", "weight": 0.21 }
  ],
  "findings": [
    { "evidence": "observed", "text": "Header From domain differs from envelope sender." },
    { "evidence": "inferred", "text": "Consistent with invoice-fraud BEC.", "confidence": "high" },
    { "evidence": "unknown",  "text": "Whether a supplier mailbox was compromised." }
  ],
  "indicators": [
    { "type": "domain", "value": "secure-payments.com", "verdict": "malicious" }
  ]
}`}</code>
            </pre>

            <h2 id="errors">Errors</h2>

            <p>
              Errors use standard status codes with a machine-readable{" "}
              <code>code</code> and a human-readable <code>message</code>.
              Rate limits return <code>429</code> with a{" "}
              <code>Retry-After</code> header.
            </p>

            <ul>
              <li>
                <code>400</code> — the submitted content could not be parsed as
                an email message
              </li>
              <li>
                <code>401</code> — missing or expired bearer token
              </li>
              <li>
                <code>403</code> — the token&rsquo;s role cannot access this
                workspace or case
              </li>
              <li>
                <code>404</code> — no evidence record or case with that id
              </li>
              <li>
                <code>409</code> — the case is finalised and cannot be modified
              </li>
              <li>
                <code>429</code> — rate limited; honour{" "}
                <code>Retry-After</code>
              </li>
            </ul>
          </Prose>

          {/* ---- Sidebar ---- */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <CardHeader
                icon="bolt"
                title="Rate limits"
                subtitle="Per workspace token"
                level={2}
              />

              <dl className="mt-5 space-y-2.5">
                {[
                  { label: "Message submission", value: "60 / min" },
                  { label: "Result retrieval", value: "600 / min" },
                  { label: "Registry queries", value: "300 / min" },
                  { label: "Report generation", value: "10 / min" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raise px-3 py-2"
                  >
                    <dt className="text-[11px] text-ink-faint">
                      {item.label}
                    </dt>
                    <dd className="ioc font-semibold text-ink-soft">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card tone="critical" className="p-5">
              <CardHeader
                icon="lock"
                iconTone="critical"
                title="Handling evidence"
                subtitle="Non-negotiable"
                level={2}
              />

              <ul className="mt-5 space-y-2.5">
                {[
                  "Never log full message bodies in your integration",
                  "Store evidence ids, not copies of the message",
                  "Treat every extracted URL as live and hostile",
                  "Scope tokens to the narrowest role that works",
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2.5 text-[11px] leading-5 text-ink-muted"
                  >
                    <Icon
                      name="check"
                      className="mt-0.5 shrink-0 text-[10px] text-critical"
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
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
