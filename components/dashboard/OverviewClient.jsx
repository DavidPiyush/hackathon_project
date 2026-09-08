"use client";

import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone, STATE_TONES } from "@/lib/utils/tones";
import { threatTrend, threatDistribution, serviceStatus } from "@/lib/data/dashboard";
import { riskTone, needsReview, summarizeRisk } from "@/lib/utils/risk";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { BackendStatus } from "@/components/dashboard/BackendStatus";
import {
  StatCard,
  TrendChart,
  DistributionBar,
  RiskMeter,
} from "@/components/ui/DataDisplay";

const BANDS = [
  { id: "critical", label: "Critical", tone: "critical" },
  { id: "high", label: "High", tone: "high" },
  { id: "suspicious", label: "Suspicious", tone: "warn" },
  { id: "safe", label: "Safe", tone: "safe" },
];

/**
 * Overview widgets.
 *
 * Every figure derives from live store state, so archiving a message or
 * closing a case is reflected here immediately rather than leaving the
 * overview disagreeing with the pages it summarises.
 */
export function OverviewClient() {
  const { emails, investigations, reports } = useData();

  const live = emails.filter((email) => !email.deleted && !email.archived);

  const analysed = threatTrend.reduce((total, day) => total + day.total, 0);
  const highRisk = live.filter((email) => email.risk >= 75).length;
  const reviewQueue = live.filter((email) => needsReview(email.risk)).length;
  const openCases = investigations.filter((item) => item.status !== "closed");
  const bands = summarizeRisk(live);

  const triage = [...live].sort((a, b) => b.risk - a.risk).slice(0, 5);
  const topCase = openCases[0] ?? investigations[0] ?? null;

  return (
    <div className="space-y-6">
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
          detail="In the inbox, scoring 75+"
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
          value={openCases.length}
          detail="Active, pending or monitoring"
          tone="info"
          delta={-4}
        />
      </div>

      {/* Backend connection, so "why is nothing loading" is answerable */}
      <BackendStatus />

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

          {/* Severity bands, counted from what is actually in the inbox */}
          <div className="mt-7 grid grid-cols-2 gap-2 border-t border-line pt-5">
            {BANDS.map((band) => (
              <div
                key={band.id}
                className="flex items-center justify-between rounded-lg border border-line bg-raise px-3 py-2"
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
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-line p-6">
            <CardHeader
              icon="inbox"
              title="Triage queue"
              subtitle="Highest-scoring messages still in the inbox"
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

          {triage.length === 0 ? (
            <EmptyState
              icon="check-circle"
              title="The queue is clear"
              description="Every message has been archived or deleted. Nothing is waiting on an analyst."
              action={
                <Button href="/dashboard/inbox" size="sm" variant="secondary" icon="inbox">
                  Open the inbox
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {triage.map((email) => {
                const t = resolveTone(riskTone(email.risk));

                return (
                  <li key={email.id}>
                    <Link
                      href="/dashboard/inbox"
                      className="flex items-center gap-4 px-6 py-4 transition duration-200 hover:bg-elevated"
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                          t.bg,
                          t.border,
                          t.text,
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
                );
              })}
            </ul>
          )}
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
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raise px-3 py-2.5"
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
          {topCase ? (
            <Card className="p-6">
              <CardHeader
                icon="folder"
                iconTone="critical"
                title="Leading investigation"
                subtitle={topCase.case_id}
                level={2}
              />

              <p className="mt-5 text-sm font-medium text-ink">
                {topCase.title}
              </p>

              <p className="mt-2 text-xs leading-6 text-ink-soft">
                {topCase.description}
              </p>

              <RiskMeter score={topCase.risk} className="mt-5" />

              <dl className="mt-5 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Emails",
                    value: emails.filter(
                      (email) => email.caseId === topCase.case_id && !email.deleted,
                    ).length,
                  },
                  { label: "Reports", value: reports.filter((r) => r.case_id === topCase.case_id).length },
                  { label: "Updated", value: topCase.updated },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-line bg-raise px-3 py-2 text-center"
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
          ) : (
            <Card className="p-6">
              <EmptyState
                icon="folder"
                title="No investigations"
                description="Open a case to start collecting evidence against an incident."
                action={
                  <Button
                    href="/dashboard/investigations"
                    size="sm"
                    icon="plus"
                  >
                    Open a case
                  </Button>
                }
                className="py-8"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewClient;
