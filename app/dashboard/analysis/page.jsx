import { emails } from "@/lib/data/emails";
import { analysisSignals, custodyTrail } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Meter, Timeline, RiskMeter } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { HeaderAnalyzer } from "@/components/dashboard/HeaderAnalyzer";
import {
  MessagePanel,
  AuthenticationPanel,
  InfrastructurePanel,
  IndicatorPanel,
  FindingsPanel,
  AttachmentPanel,
} from "@/components/dashboard/Evidence";

export const metadata = {
  title: "Email Analysis",
  description:
    "Parse raw email headers in the browser and review the full forensic breakdown of a message.",
};

/** The worked example shown beneath the live analyzer. */
const CASE_STUDY_ID = "EM-2041";

export default function AnalysisPage() {
  const subject = emails.find((email) => email.id === CASE_STUDY_ID);

  return (
    <>
      <PageHeader
        eyebrow="Forensics"
        eyebrowIcon="search"
        title="Email Analysis"
        description="Paste the raw headers of a suspicious message for an immediate, explained assessment. Parsing runs entirely in your browser, so hostile evidence never leaves this machine."
        meta={[
          { icon: "lock", label: "Processing", value: "Client-side" },
          { icon: "shield", label: "Engine", value: "v4.2" },
          { icon: "scale", label: "Model", value: "Explainable" },
        ]}
        actions={
          <Button href="/dashboard/inbox" variant="secondary" icon="inbox">
            Back to inbox
          </Button>
        }
      />

      <PageBody className="space-y-8">
        {/* ================= LIVE ANALYZER ================= */}
        <HeaderAnalyzer />

        {/* ================= WORKED EXAMPLE ================= */}
        <section aria-labelledby="worked-example" className="space-y-6">
          <div className="rule-fade" aria-hidden="true" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Worked example
              </p>

              <h2
                id="worked-example"
                className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
              >
                {subject.subject}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                A completed investigation, showing what a full enrichment pass
                adds beyond header parsing alone.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Badge tone="neutral" size="md">
                {subject.id}
              </Badge>
              <RiskBadge score={subject.risk} size="md" showScore />
            </div>
          </div>

          {/* Verdict and model signals */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <RiskMeter score={subject.risk} />

            <Card className="p-5">
              <CardHeader
                icon="brain"
                title="Detection signals"
                subtitle="Feature weights that produced the score"
                level={3}
              />

              <ul className="mt-5 space-y-3">
                {analysisSignals.map((signal) => (
                  <li key={signal.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-xs text-ink-soft">
                        {signal.name}
                      </span>

                      <span
                        className={cn(
                          "shrink-0 font-mono text-[11px] font-semibold",
                          signal.direction === "malicious"
                            ? "text-critical"
                            : "text-safe",
                        )}
                      >
                        {signal.direction === "malicious" ? "+" : "−"}
                        {Math.round(signal.weight * 100)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-3">
                      <Meter
                        value={signal.weight * 100}
                        max={30}
                        tone={
                          signal.direction === "malicious" ? "critical" : "safe"
                        }
                        size="xs"
                        label={`${signal.name}: weight ${signal.weight}`}
                      />

                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                        {signal.family}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-ink-muted">
                <Icon name="scale" className="mt-0.5 shrink-0 text-accent" />
                Weights sum to the model contribution, which is combined with
                deterministic rule hits to produce the final score.
              </p>
            </Card>
          </div>

          <MessagePanel email={subject} />

          <div className="grid gap-5 lg:grid-cols-2">
            <AuthenticationPanel authentication={subject.authentication} />
            <InfrastructurePanel infrastructure={subject.infrastructure} />
          </div>

          <AttachmentPanel attachments={subject.attachments} />

          <div className="grid gap-5 lg:grid-cols-2">
            <IndicatorPanel indicators={subject.indicators} />
            <FindingsPanel findings={subject.findings} />
          </div>

          {/* Chain of custody */}
          <Card className="p-5">
            <CardHeader
              icon="checklist"
              title="Chain of custody"
              subtitle="Immutable, timestamped record of every action against this evidence"
              level={3}
              actions={
                <Button variant="ghost" size="sm" icon="print" className="no-print">
                  Print
                </Button>
              }
            />

            <Timeline items={custodyTrail} className="mt-6" />
          </Card>

          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon name="file" />
              </span>

              <div>
                <p className="text-sm font-semibold text-ink">
                  Turn this into a report
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Evidence, findings, confidence and custody trail, in one
                  audit-ready document.
                </p>
              </div>
            </div>

            <Button href="/dashboard/reports" iconEnd="arrow-right">
              Generate report
            </Button>
          </Card>
        </section>
      </PageBody>
    </>
  );
}
