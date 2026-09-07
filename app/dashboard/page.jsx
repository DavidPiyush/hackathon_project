import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone, STATE_TONES } from "@/lib/utils/tones";
import { emails } from "@/lib/data/emails";
import {
  threatTrend,
  threatDistribution,
  serviceStatus,
  investigations,
} from "@/lib/data/dashboard";
import { riskTone, needsReview, summarizeRisk } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import {
  StatCard,
  TrendChart,
  DistributionBar,
  RiskMeter,
} from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "Overview",
  description:
    "Platform health, detection volume and threat activity across the last seven days.",
};

export default function DashboardOverviewPage() {
  // Every figure below is derived from the shared dataset rather than typed in,
  // so the tiles can never contradict the inbox they summarise.
  const analysed = threatTrend.reduce((total, day) => total + day.total, 0);
  const highRisk = emails.filter((email) => email.risk >= 75).length;
  const reviewQueue = emails.filter((email) => needsReview(email.risk)).length;
  const openCases = investigations.filter(
    (item) => item.state !== "Closed",
  ).length;
  const bands = summarizeRisk(emails);

  const recent = [...emails]
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 5);

  const topCase = investigations[0];

  return (
    <>
      <PageHeader
        eyebrow="Security Console"
        eyebrowIcon="gauge"
        title="Overview"
        description="Detection volume, threat composition and service health for the current reporting window."
        meta={[
          { icon: "clock", label: "Window", value: "Last 7 days" },
          { icon: "refresh", label: "Updated", value: "2 min ago" },
          { icon: "shield", label: "Engine", value: "v4.2" },
        ]}
        actions={
          <>
            <Button href="/dashboard/analysis" icon="upload">
              Analyze an email
            </Button>

            <Button href="/dashboard/reports" variant="secondary" icon="file">
              Reports
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        {/* ================= KPI ROW ================= */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="envelope"
            label="Emails analysed"
            value={analysed}
            detail="Across the last 7 days"
            delta={12}
          />

          <StatCard
            icon="warning"
            label="High-risk detections"
            value={highRisk}
            detail="Scoring 75 or above"
            tone="critical"
            delta={8}
          />

          <StatCard
            icon="checklist"
            label="Awaiting review"
            value={reviewQueue}
            detail="Scoring 40 or above"
            tone="warn"
          />

          <StatCard
            icon="folder"
            label="Open investigations"
            value={openCases}
            detail="Active, pending or monitoring"
            tone="info"
            delta={-4}
          />
        </div>

        {/* ================= TREND + DISTRIBUTION ================= */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <Card className="p-6">
            <CardHeader
              icon="chart"
              title="Threat activity"
              subtitle="Messages analysed and high-risk detections per day"
              level={2}
              actions={
                <Badge tone="accent" size="sm" icon="clock">
                  7 days
                </Badge>
              }
            />

            <div className="mt-6">
              <TrendChart data={threatTrend} />
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader
              icon="layers"
              title="Threat distribution"
              subtitle="Detected categories this window"
              level={2}
            />

            <DistributionBar data={threatDistribution} className="mt-6" />

            {/* Severity band summary derived from the same corpus */}
            <div className="mt-7 grid grid-cols-2 gap-2 border-t border-line pt-5">
              {[
                { id: "critical", label: "Critical", tone: "critical" },
                { id: "high", label: "High", tone: "high" },
                { id: "suspicious", label: "Suspicious", tone: "warn" },
                { id: "safe", label: "Safe", tone: "safe" },
              ].map((band) => (
                <div
                  key={band.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-white/[0.02] px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-[11px] text-ink-muted">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        resolveTone(band.tone).fill,
                      )}
                    />
                    {band.label}
                  </span>

                  <span className="font-mono text-xs font-semibold text-ink">
                    {bands[band.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ================= TRIAGE + SERVICES ================= */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          {/* Highest-risk messages */}
          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-6">
              <CardHeader
                icon="inbox"
                title="Triage queue"
                subtitle="Highest-scoring messages in the current window"
                level={2}
                actions={
                  <Button
                    href="/dashboard/inbox"
                    variant="ghost"
                    size="sm"
                    iconEnd="arrow-right"
                  >
                    Inbox
                  </Button>
                }
              />
            </div>

            <ul className="divide-y divide-line">
              {recent.map((email) => (
                <li key={email.id}>
                  <Link
                    href="/dashboard/inbox"
                    className="flex items-center gap-4 px-6 py-4 transition duration-200 hover:bg-elevated/60"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                        resolveTone(riskTone(email.risk)).bg,
                        resolveTone(riskTone(email.risk)).border,
                        resolveTone(riskTone(email.risk)).text,
                      )}
                    >
                      <Icon
                        name={email.risk >= 75 ? "warning" : "envelope"}
                        className="text-xs"
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {email.subject}
                      </p>

                      <p className="ioc mt-0.5 truncate text-ink-faint">
                        {email.senderEmail}
                      </p>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-[11px] text-ink-muted">
                        {email.classification}
                      </p>
                      <p className="font-mono text-[10px] text-ink-faint">
                        {email.id}
                      </p>
                    </div>

                    <RiskBadge score={email.risk} showScore />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            {/* Service health */}
            <Card className="p-6">
              <CardHeader
                icon="server"
                title="Security services"
                subtitle="Current platform status"
                level={2}
              />

              <ul className="mt-6 space-y-3">
                {serviceStatus.map((service) => {
                  const stateTone = STATE_TONES[service.state] ?? "neutral";

                  return (
                    <li
                      key={service.name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-xs font-medium text-ink">
                          <StatusDot tone={stateTone} />
                          <span className="truncate">{service.name}</span>
                        </p>

                        <p className="mt-1 truncate text-[10px] text-ink-faint">
                          {service.detail}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "font-mono text-[10px] font-semibold uppercase",
                            resolveTone(stateTone).text,
                          )}
                        >
                          {service.state}
                        </p>
                        <p className="font-mono text-[10px] text-ink-faint">
                          {service.latency}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Leading case */}
            <Card className="p-6">
              <CardHeader
                icon="folder"
                iconTone="critical"
                title="Leading investigation"
                subtitle={topCase.id}
                level={2}
              />

              <p className="mt-5 text-sm font-medium text-ink">
                {topCase.title}
              </p>

              <p className="mt-2 text-xs leading-6 text-ink-soft">
                {topCase.summary}
              </p>

              <RiskMeter score={topCase.risk} className="mt-5" />

              <dl className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Emails", value: topCase.emails },
                  { label: "Indicators", value: topCase.indicators },
                  { label: "Updated", value: topCase.updated },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-center"
                  >
                    <dt className="text-[9px] uppercase tracking-wider text-ink-faint">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-mono text-xs font-semibold text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Button
                href="/dashboard/investigations"
                variant="secondary"
                size="sm"
                iconEnd="arrow-right"
                className="mt-5 w-full"
              >
                Open investigations
              </Button>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
