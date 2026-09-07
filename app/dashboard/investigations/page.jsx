import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { investigations } from "@/lib/data/dashboard";
import { riskTone } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "Investigations",
  description:
    "Open cases, their current state, assigned analyst and correlated evidence.",
};

/** Case state maps to a tone so the list scans by colour. */
const STATE_TONES = {
  Active: "critical",
  "Pending Review": "warn",
  Monitoring: "info",
  Closed: "safe",
};

const PRIORITY_TONES = {
  critical: "critical",
  high: "high",
  medium: "warn",
  low: "safe",
};

export default function InvestigationsPage() {
  const open = investigations.filter((item) => item.state !== "Closed");
  const totalEmails = investigations.reduce(
    (total, item) => total + item.emails,
    0,
  );
  const totalIndicators = investigations.reduce(
    (total, item) => total + item.indicators,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Case Management"
        eyebrowIcon="folder"
        title="Investigations"
        description="Every case links the messages, indicators and infrastructure that belong to it, so a conclusion can be traced back to the evidence that produced it."
        actions={
          <>
            <Button icon="plus">Open a case</Button>

            <Button href="/dashboard/reports" variant="secondary" icon="file">
              Reports
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="folder"
            label="Open cases"
            value={open.length}
            detail="Active, pending or monitoring"
            tone="critical"
          />

          <StatCard
            icon="checklist"
            label="Total cases"
            value={investigations.length}
            detail="Including closed"
          />

          <StatCard
            icon="envelope"
            label="Messages linked"
            value={totalEmails}
            detail="Across all cases"
            tone="info"
          />

          <StatCard
            icon="fingerprint"
            label="Indicators"
            value={totalIndicators}
            detail="Registered from these cases"
            tone="warn"
          />
        </div>

        {/* ================= CASE LIST ================= */}
        {investigations.length === 0 ? (
          <Card>
            <EmptyState
              icon="folder"
              title="No investigations yet"
              description="A case is created automatically when a message escalates past the critical threshold."
            />
          </Card>
        ) : (
          <ul className="space-y-4">
            {investigations.map((item) => {
              const stateTone = STATE_TONES[item.state] ?? "neutral";
              const priorityTone = PRIORITY_TONES[item.priority] ?? "neutral";
              const closed = item.state === "Closed";

              return (
                <li key={item.id}>
                  <Card
                    interactive
                    className={cn("p-6", closed && "opacity-70")}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Case identity */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-bold text-accent">
                            {item.id}
                          </span>

                          <Badge tone={stateTone} size="sm" dot>
                            {item.state}
                          </Badge>

                          <Badge tone={priorityTone} size="sm" uppercase>
                            {item.priority}
                          </Badge>
                        </div>

                        <h2 className="mt-3 text-base font-semibold text-ink">
                          {item.title}
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                          {item.summary}
                        </p>

                        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                          {[
                            { icon: "user", label: "Analyst", value: item.analyst },
                            { icon: "clock", label: "Opened", value: item.opened },
                            { icon: "refresh", label: "Updated", value: item.updated },
                            { icon: "envelope", label: "Messages", value: item.emails },
                            { icon: "fingerprint", label: "Indicators", value: item.indicators },
                          ].map((meta) => (
                            <div key={meta.label} className="flex items-center gap-2">
                              <Icon
                                name={meta.icon}
                                className="text-[10px] text-ink-faint"
                              />
                              <dt className="text-ink-faint">{meta.label}</dt>
                              <dd className="font-mono font-semibold text-ink-soft">
                                {meta.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      {/* Risk + actions */}
                      <div className="shrink-0 lg:w-56">
                        <div className="flex items-center justify-between gap-3">
                          <RiskBadge score={item.risk} showScore />

                          <span
                            className={cn(
                              "font-mono text-2xl font-bold",
                              resolveTone(riskTone(item.risk)).text,
                            )}
                          >
                            {item.risk}
                          </span>
                        </div>

                        <Meter
                          value={item.risk}
                          tone={riskTone(item.risk)}
                          size="sm"
                          label={`Case risk ${item.risk} of 100`}
                          className="mt-3"
                        />

                        <div className="mt-4 flex gap-2">
                          <Button
                            href="/dashboard/analysis"
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                          >
                            Evidence
                          </Button>

                          <Button
                            href="/dashboard/reports"
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                          >
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {/* ================= WORKFLOW NOTE ================= */}
        <Card className="p-6">
          <CardHeader
            icon="scale"
            title="When a case can be closed"
            subtitle="The platform blocks closure while evidence is outstanding"
            level={2}
          />

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Every promoted indicator has been acknowledged by an analyst",
              "Authentication and infrastructure stages have both completed",
              "Findings state a confidence level, or are marked unknown",
              "A report has been generated and attached to the case",
            ].map((rule) => (
              <li
                key={rule}
                className="flex items-start gap-3 rounded-lg border border-line bg-white/[0.02] p-3 text-xs leading-5 text-ink-soft"
              >
                <StatusDot tone="safe" className="mt-1.5" />
                {rule}
              </li>
            ))}
          </ul>
        </Card>
      </PageBody>
    </>
  );
}
