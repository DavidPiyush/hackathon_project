import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { indicatorRegistry, campaigns } from "@/lib/data/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard, DistributionBar } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { IndicatorRegistry } from "@/components/dashboard/IndicatorRegistry";

export const metadata = {
  title: "Threat Intelligence",
  description:
    "Indicator registry, infrastructure context and campaign clusters correlated across investigations.",
};

export default function ThreatIntelligencePage() {
  const malicious = indicatorRegistry.filter(
    (entry) => entry.verdict === "malicious",
  ).length;

  const suspicious = indicatorRegistry.filter(
    (entry) => entry.verdict === "suspicious",
  ).length;

  const sightings = indicatorRegistry.reduce(
    (total, entry) => total + entry.sightings,
    0,
  );

  // Composition by indicator type, derived from the registry itself.
  const typeCounts = indicatorRegistry.reduce((counts, entry) => {
    counts[entry.type] = (counts[entry.type] ?? 0) + 1;

    return counts;
  }, {});

  const typeTones = ["critical", "high", "warn", "info", "safe"];

  const distribution = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      tone: typeTones[index % typeTones.length],
    }));

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        eyebrowIcon="network"
        title="Threat Intelligence"
        description="Indicators extracted from analysed messages, enriched with DNS, RDAP and ASN context, then correlated into campaign clusters across cases."
        meta={[
          { icon: "refresh", label: "Last cycle", value: "14 min ago" },
          { icon: "database", label: "Sources", value: "DNS · RDAP · GeoIP" },
        ]}
        actions={
          <>
            <Button icon="download">Export IOCs</Button>

            <Button href="/dashboard/geoip" variant="secondary" icon="map">
              GeoIP view
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="fingerprint"
            label="Registered indicators"
            value={indicatorRegistry.length}
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

        {/* ================= REGISTRY ================= */}
        <section aria-labelledby="registry-heading" className="space-y-4">
          <h2 id="registry-heading" className="text-lg font-semibold text-ink">
            Indicator registry
          </h2>

          <IndicatorRegistry />
        </section>

        {/* ================= CAMPAIGNS + COMPOSITION ================= */}
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <section aria-labelledby="campaigns-heading" className="space-y-4">
            <h2 id="campaigns-heading" className="text-lg font-semibold text-ink">
              Campaign clusters
            </h2>

            <ul className="space-y-4">
              {campaigns.map((campaign) => {
                const t = resolveTone(campaign.tone);

                return (
                  <li key={campaign.name}>
                    <Card interactive className={cn("p-5", t.border)}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                                t.bg,
                                t.border,
                                t.text,
                              )}
                            >
                              <Icon name="nodes" className="text-xs" />
                            </span>

                            <h3 className="text-base font-semibold text-ink">
                              {campaign.name}
                            </h3>

                            <Badge tone={campaign.tone} size="xs" uppercase>
                              {campaign.confidence} confidence
                            </Badge>
                          </div>

                          <p className="mt-3 text-xs text-ink-muted">
                            {campaign.theme}
                          </p>

                          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                            {campaign.note}
                          </p>
                        </div>

                        <dl className="flex shrink-0 gap-2">
                          {[
                            { label: "Cases", value: campaign.cases },
                            { label: "IOCs", value: campaign.indicators },
                            { label: "Since", value: campaign.firstSeen },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-center"
                            >
                              <dt className="text-[9px] uppercase tracking-wider text-ink-faint">
                                {item.label}
                              </dt>
                              <dd className="mt-1 font-mono text-[11px] font-semibold text-ink">
                                {item.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="space-y-5">
            <Card className="p-5">
              <CardHeader
                icon="layers"
                title="Registry composition"
                subtitle="Indicators by type"
                level={2}
              />

              <DistributionBar data={distribution} className="mt-5" />
            </Card>

            <Card className="p-5">
              <CardHeader
                icon="scale"
                title="How verdicts are assigned"
                subtitle="Nothing is marked malicious on a single signal"
                level={2}
              />

              <ol className="mt-5 space-y-3">
                {[
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
                ].map((item) => {
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

                      <p className="text-[11px] leading-5 text-ink-soft">
                        {item.rule}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
