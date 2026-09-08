"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Meter, Timeline, RiskMeter } from "@/components/ui/DataDisplay";
import { useData } from "@/components/providers/DataProvider";
import {
  MessagePanel,
  AuthenticationPanel,
  InfrastructurePanel,
  IndicatorPanel,
  FindingsPanel,
  AttachmentPanel,
} from "@/components/dashboard/Evidence";

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function flattenValues(value, prefix = "") {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenValues(item, prefix ? `${prefix}.${index}` : String(index)),
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      flattenValues(item, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [{ label: formatLabel(prefix), value: String(value) }];
}

function AnalysisSignals({ analysis, identity, behavioral }) {
  const evidence = useMemo(
    () =>
      [
        ...flattenValues(identity, "identity"),
        ...flattenValues(behavioral, "behavioral"),
      ].slice(0, 12),
    [identity, behavioral],
  );

  if (evidence.length === 0 && !analysis) return null;

  return (
    <Card className="p-5">
      <CardHeader
        icon="brain"
        title="Detection analysis"
        subtitle="Backend evidence contributing to the assessment"
        level={3}
      />

      {analysis?.risk && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Score", value: analysis.risk.score ?? "—" },
            { label: "Level", value: formatLabel(analysis.risk.level) || "—" },
            {
              label: "Classification",
              value: formatLabel(analysis.classification) || "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-line bg-raise px-3 py-2.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                {item.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {evidence.length > 0 && (
        <dl className="mt-5 grid gap-2 sm:grid-cols-2">
          {evidence.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-lg border border-line bg-raise px-3 py-2.5"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                {item.label}
              </dt>
              <dd className="mt-1 break-words text-xs text-ink-soft">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function ThreatIntelligence({ intelligence }) {
  if (!intelligence) return null;

  const indicators = Array.isArray(intelligence.indicators)
    ? intelligence.indicators
    : [];
  const evidence = Array.isArray(intelligence.evidence)
    ? intelligence.evidence
    : [];

  return (
    <Card className="p-5">
      <CardHeader
        icon="shield"
        title="Threat intelligence"
        subtitle="Enrichment returned by the backend providers"
        level={3}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Threat score",
            value: intelligence.threat_score ?? intelligence.threatScore ?? "—",
          },
          {
            label: "Reputation",
            value: formatLabel(intelligence.reputation) || "—",
          },
          {
            label: "Provider status",
            value: intelligence.providers?.length
              ? "Enriched"
              : "No provider data",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-line bg-raise px-3 py-2.5"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              {item.label}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      {indicators.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
            Indicators
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {indicators.slice(0, 12).map((indicator, index) => {
              const value =
                indicator?.value ?? indicator?.indicator ?? String(indicator);
              return (
                <Badge key={`${value}-${index}`} tone="neutral" size="xs">
                  {value}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {evidence.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
            Evidence
          </p>
          {evidence.slice(0, 8).map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink-soft"
            >
              {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function LiveAnalysis({ email }) {
  const analysis = email.analysis;
  const identity = email.identityAnalysis;
  const behavioral = email.behavioralAnalysis;
  const intelligence = email.threatIntelligence;

  return (
    <section aria-labelledby="live-analysis" className="space-y-6">
      <div className="rule-fade" aria-hidden="true" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Live backend analysis
          </p>
          <h2
            id="live-analysis"
            className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
          >
            {email.subject}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            This view is populated from the message and forensic analysis
            returned by FastAPI.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone="neutral" size="md">
            {email.id}
          </Badge>
          <RiskBadge score={email.risk} size="md" showScore />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <RiskMeter score={email.risk} />
        <AnalysisSignals
          analysis={analysis}
          identity={identity}
          behavioral={behavioral}
        />
      </div>

      <MessagePanel email={email} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AuthenticationPanel authentication={email.authentication} />
        <InfrastructurePanel infrastructure={email.infrastructure} />
      </div>

      <ThreatIntelligence intelligence={intelligence} />
      <AttachmentPanel attachments={email.attachments} />

      <div className="grid gap-5 lg:grid-cols-2">
        <IndicatorPanel indicators={email.indicators} />
        <FindingsPanel findings={email.findings} />
      </div>

      {analysis?.evidence_hash && (
        <Card className="p-5">
          <CardHeader
            icon="checklist"
            title="Evidence integrity"
            subtitle="Hash returned by the analysis pipeline"
            level={3}
          />
          <p className="ioc mt-4 break-all rounded-lg border border-line bg-raise p-3 text-xs text-ink-soft">
            {analysis.evidence_hash}
          </p>
        </Card>
      )}

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
              Evidence, findings, confidence and enrichment in an audit-ready
              document.
            </p>
          </div>
        </div>
        <Button href="/dashboard/reports" iconEnd="arrow-right">
          Generate report
        </Button>
      </Card>
    </section>
  );
}

export default function AnalysisClient() {
  const { emails, backendLoading, backendError, actions } = useData();

  const analyzedEmail = useMemo(
    () =>
      [...emails]
        .filter((email) => !email.deleted && !email.archived && email.analysis)
        .sort(
          (a, b) =>
            b.risk - a.risk ||
            String(b.receivedAt ?? "").localeCompare(
              String(a.receivedAt ?? ""),
            ),
        )[0] ?? null,
    [emails],
  );

  if (backendLoading && emails.length === 0) {
    return (
      <Card className="flex min-h-64 items-center justify-center p-6">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
          Loading live analysis…
        </div>
      </Card>
    );
  }

  if (!analyzedEmail) {
    return (
      <EmptyState
        icon="search"
        title="No analyzed messages yet"
        description={
          backendError?.message ||
          "Open the inbox and wait for Gmail messages to finish their analysis pass."
        }
        action={
          <Button
            href="/dashboard/inbox"
            variant="secondary"
            icon="inbox"
            onClick={() => actions?.refreshGmail?.()}
          >
            Open inbox
          </Button>
        }
      />
    );
  }

  return <LiveAnalysis email={analyzedEmail} />;
}
