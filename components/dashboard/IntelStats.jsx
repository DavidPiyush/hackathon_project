"use client";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard, DistributionBar } from "@/components/ui/DataDisplay";

const TYPE_TONES = ["critical", "high", "warn", "info", "safe"];

/**
 * Threat-intelligence figures, derived live from the registry.
 *
 * These were server-rendered from the seed, which meant adding or removing an
 * indicator left the tiles contradicting the table directly below them.
 */
export function IntelStats() {
  const { indicators } = useData();

  const malicious = indicators.filter(
    (entry) => entry.verdict === "malicious",
  ).length;

  const suspicious = indicators.filter(
    (entry) => entry.verdict === "suspicious",
  ).length;

  const sightings = indicators.reduce(
    (total, entry) => total + (entry.sightings ?? 0),
    0,
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon="fingerprint"
        label="Registered indicators"
        value={indicators.length}
        detail="Across all investigations"
      />

      <StatCard
        icon="ban"
        label="Confirmed malicious"
        value={malicious}
        detail="Verdict assigned after enrichment"
        tone="critical"
      />

      <StatCard
        icon="warning"
        label="Suspicious"
        value={suspicious}
        detail="Awaiting further evidence"
        tone="warn"
      />

      <StatCard
        icon="eye"
        label="Total sightings"
        value={sightings}
        detail="Observations across the corpus"
        tone="info"
      />
    </div>
  );
}

/** Registry composition by indicator type, also derived live. */
export function IntelComposition() {
  const { indicators } = useData();

  const counts = indicators.reduce((accumulator, entry) => {
    accumulator[entry.type] = (accumulator[entry.type] ?? 0) + 1;

    return accumulator;
  }, {});

  const distribution = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      tone: TYPE_TONES[index % TYPE_TONES.length],
    }));

  return (
    <Card className="p-5">
      <CardHeader
        icon="layers"
        title="Registry composition"
        subtitle="Indicators by type"
        level={2}
      />

      {distribution.length === 0 ? (
        <p className="mt-5 text-xs text-ink-muted">
          The registry is empty. Add an indicator to see its composition.
        </p>
      ) : (
        <DistributionBar data={distribution} className="mt-5" />
      )}
    </Card>
  );
}

/** Verdict assignment rules, static copy but colour-linked to the tone table. */
export function VerdictRules() {
  const rules = [
    {
      verdict: "malicious",
      tone: "critical",
      rule: "Corroborated by two or more independent signals, or observed in a confirmed campaign.",
    },
    {
      verdict: "suspicious",
      tone: "warn",
      rule: "One strong signal, or several weak ones, without corroboration yet.",
    },
    {
      verdict: "benign",
      tone: "safe",
      rule: "Known-good infrastructure with a consistent observation history.",
    },
    {
      verdict: "unknown",
      tone: "neutral",
      rule: "Insufficient evidence. Explicitly recorded rather than assumed safe.",
    },
  ];

  return (
    <Card className="p-5">
      <CardHeader
        icon="scale"
        title="How verdicts are assigned"
        subtitle="Nothing is marked malicious on a single signal"
        level={2}
      />

      <ol className="mt-5 space-y-3">
        {rules.map((item) => {
          const t = resolveTone(item.tone);

          return (
            <li key={item.verdict} className="flex items-start gap-3">
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                  t.bg,
                  t.text,
                )}
              >
                {item.verdict}
              </span>

              <p className="text-[11px] leading-5 text-ink-soft">{item.rule}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
