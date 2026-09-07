import { requireUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { campaigns } from "@/lib/data/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { IndicatorRegistry } from "@/components/dashboard/IndicatorRegistry";
import {
  IntelStats,
  IntelComposition,
  VerdictRules,
} from "@/components/dashboard/IntelStats";

export const metadata = {
  title: "Threat Intelligence",
  description:
    "Indicator registry, infrastructure context and campaign clusters correlated across investigations.",
};

export default async function ThreatIntelligencePage() {
  // Authoritative check. Proxy is optimistic; this is what actually gates
  // the page, per the Next.js auth guidance on layouts.
  await requireUser("/dashboard/threat-intelligence");

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        eyebrowIcon="network"
        title="Threat Intelligence"
        description="Indicators extracted from analysed messages, enriched with DNS, RDAP and ASN context, then correlated into campaign clusters. Register new indicators, run enrichment, or override a verdict."
        meta={[
          { icon: "refresh", label: "Last cycle", value: "14 min ago" },
          { icon: "database", label: "Sources", value: "DNS · RDAP · GeoIP" },
        ]}
        actions={
          <Button href="/dashboard/geoip" variant="secondary" icon="map">
            GeoIP view
          </Button>
        }
      />

      <PageBody className="space-y-6">
        <IntelStats />

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
                              className="rounded-lg border border-line bg-raise px-3 py-2 text-center"
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
            <IntelComposition />
            <VerdictRules />
          </div>
        </div>
      </PageBody>
    </>
  );
}
