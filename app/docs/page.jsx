import Link from "next/link";

import { site } from "@/lib/data/site";
import { evidenceClasses, workflow } from "@/lib/data/marketing";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Layout";
import { PageShell, Prose } from "@/components/marketing/PageShell";
import { CtaBand } from "@/components/marketing/CtaBand";

export const metadata = {
  title: "Documentation",
  description:
    "How to read a ThreatDetect investigation: the risk score, authentication results, the evidence model and its limits.",
  alternates: { canonical: "/docs" },
};

/** In-page navigation, matched to the section ids below. */
const CONTENTS = [
  { id: "quick-start", name: "Quick start" },
  { id: "risk-score", name: "Reading the risk score" },
  { id: "authentication", name: "Authentication results" },
  { id: "evidence-model", name: "The evidence model" },
  { id: "pipeline", name: "The investigation pipeline" },
  { id: "limits", name: "Known limits" },
];

export default function DocsPage() {
  return (
    <PageShell
      eyebrow="Documentation"
      eyebrowIcon="book"
      title="Reading a ThreatDetect investigation"
      description="The platform is deliberately explicit about what it knows, how it knows it, and where the evidence runs out. This page explains how to read that."
      breadcrumb={[{ name: "Documentation" }]}
      meta={[
        { label: "Applies to", value: "Engine v4.2" },
        { label: "Schema", value: "2026.09" },
        { label: "Updated", value: "2026-09-07" },
      ]}
    >
      <Section size="md">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          {/* ---- Contents ---- */}
          <nav
            aria-label="On this page"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              On this page
            </p>

            <ul className="mt-4 space-y-1 border-l border-line">
              {CONTENTS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-xs text-ink-muted transition duration-200 hover:border-accent hover:text-accent"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <Button
              href="/docs/api"
              variant="secondary"
              size="sm"
              icon="code"
              className="mt-6 w-full"
            >
              API reference
            </Button>
          </nav>

          {/* ---- Body ---- */}
          <Prose>
            <h2 id="quick-start">Quick start</h2>

            <p>
              The fastest way to understand the platform is to run a real
              message through it. Open{" "}
              <Link href="/dashboard/analysis">Email Analysis</Link>, paste the raw
              headers of a suspicious email, and read the result.
            </p>

            <p>
              Header parsing happens <em>entirely in your browser</em>. Nothing
              is uploaded, which is the correct handling for evidence you do not
              yet trust. To see what a full enrichment pass adds, load the sample
              message on that page.
            </p>

            <ol>
              <li>
                In your mail client, open the message and choose{" "}
                <strong>Show original</strong> or{" "}
                <strong>View message source</strong>.
              </li>
              <li>
                Copy everything from the first <code>Received:</code> line down
                to the blank line before the body.
              </li>
              <li>
                Paste it into the analyzer and select{" "}
                <strong>Analyze headers</strong>.
              </li>
            </ol>

            <h2 id="risk-score">Reading the risk score</h2>

            <p>
              Every message carries a score from <code>0</code> to{" "}
              <code>100</code>. The score exists so a queue can be ranked; the
              severity band derived from it drives every colour and label you
              see. The bands are fixed:
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                { range: "90–100", label: "Critical", tone: "critical", note: "Contain first, investigate second" },
                { range: "75–89", label: "High Risk", tone: "high", note: "Investigate before any user action" },
                { range: "40–74", label: "Suspicious", tone: "warn", note: "Needs an analyst decision" },
                { range: "20–39", label: "Low Risk", tone: "info", note: "Logged, no action expected" },
                { range: "0–19", label: "Safe", tone: "safe", note: "No significant signals fired" },
              ].map((band) => (
                <Card key={band.label} className="flex items-center gap-3 p-3">
                  <Badge tone={band.tone} size="sm" dot uppercase>
                    {band.label}
                  </Badge>

                  <span className="ioc shrink-0 text-ink-faint">
                    {band.range}
                  </span>

                  <span className="ml-auto text-right text-[11px] text-ink-muted">
                    {band.note}
                  </span>
                </Card>
              ))}
            </div>

            <p>
              A score is never shown on its own. The analysis view lists every
              signal that contributed and its weight, so you can disagree with
              the weighting rather than being handed an unexplained verdict.
            </p>

            <h2 id="authentication">Authentication results</h2>

            <p>
              This is the most misread part of email security, so it is worth
              being blunt about it.
            </p>

            <p>
              <strong>
                A passing SPF, DKIM or DMARC check does not mean a message is
                safe.
              </strong>{" "}
              It means the message was sent by infrastructure authorised for{" "}
              <em>that particular domain</em>. An attacker who registers{" "}
              <code>micr0soft-security.com</code> can publish perfectly valid
              SPF and DKIM records for it, and every check will pass.
            </p>

            <ul>
              <li>
                <strong>SPF</strong> — was the sending IP authorised by the
                envelope domain?
              </li>
              <li>
                <strong>DKIM</strong> — is the cryptographic signature valid,
                and which domain signed it?
              </li>
              <li>
                <strong>DMARC</strong> — is the domain owner&rsquo;s published
                policy satisfied?
              </li>
              <li>
                <strong>Alignment</strong> — does the address the recipient sees
                match the one that was actually authenticated? This is the check
                that catches impersonation, and the one most often missing.
              </li>
            </ul>

            <p>
              The platform therefore treats a pass as{" "}
              <em>necessary but not sufficient</em>, and weights alignment
              failures far more heavily than a raw SPF result.
            </p>

            <h2 id="evidence-model">The evidence model</h2>

            <p>
              Every finding is labelled with how it was established. This is the
              difference between an analysis and a guess.
            </p>

            <div className="mt-5 space-y-2.5">
              {evidenceClasses.map((item) => (
                <Card key={item.title} className="flex items-start gap-4 p-4">
                  <Badge tone={item.tone} size="sm" uppercase>
                    {item.title}
                  </Badge>

                  <p className="text-xs leading-6 text-ink-muted">
                    {item.text}
                  </p>
                </Card>
              ))}
            </div>

            <p>
              The important one is <strong>unknown</strong>. Where evidence does
              not support a conclusion, the platform records the gap instead of
              rounding it into certainty. A report with several honest unknowns
              is more useful than one that quietly guessed.
            </p>

            <h2 id="pipeline">The investigation pipeline</h2>

            <p>
              Six stages run in order, each adding evidence the next can build
              on. The original message is preserved at ingestion and never
              modified.
            </p>

            <ol>
              {workflow.map((stage) => (
                <li key={stage.id}>
                  <strong>{stage.label}</strong> — {stage.description}
                </li>
              ))}
            </ol>

            <h2 id="limits">Known limits</h2>

            <p>
              Being explicit about limits is part of the product, not a
              disclaimer bolted onto it.
            </p>

            <ul>
              <li>
                <strong>GeoIP is not attribution.</strong> It resolves where a
                network is registered, not where a person is. Proxies, VPNs and
                hosting providers break the link entirely.
              </li>
              <li>
                <strong>Header-only analysis cannot assign verdicts.</strong>{" "}
                The in-browser analyzer marks every extracted indicator{" "}
                <code>unknown</code>, because a verdict needs DNS, RDAP and
                reputation enrichment.
              </li>
              <li>
                <strong>A low score is not a clean bill of health.</strong>{" "}
                Headers and content can both look ordinary while a payload does
                not.
              </li>
              <li>
                <strong>Model signals are probabilistic.</strong> They are
                weighted contributions to a score, never a determination on
                their own.
              </li>
            </ul>

            <p className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface/60 p-4">
              <Icon name="headset" className="mt-0.5 shrink-0 text-accent" />
              <span className="text-xs leading-6">
                Something here unclear or wrong?{" "}
                <Link href="/#contact">Tell us</Link> — corrections to the
                documentation are treated as bugs. You can also reach us at{" "}
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
              </span>
            </p>
          </Prose>
        </div>
      </Section>

      <CtaBand
        eyebrow="Next"
        title="Run a real message through it."
        description="The analyzer works on any raw headers you can paste, without an account."
        primaryHref="/dashboard/analysis"
        primaryLabel="Open the analyzer"
        secondaryHref="/docs/api"
        secondaryLabel="API reference"
      />
    </PageShell>
  );
}
