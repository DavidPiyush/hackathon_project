import { requireUser } from "@/lib/auth/dal";

import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

import {
IntelStats,
IntelComposition,
VerdictRules,
} from "@/components/dashboard/IntelStats";

import { IndicatorRegistry } from "@/components/dashboard/IndicatorRegistry";
import { DynamicCampaignClusters } from "@/components/dashboard/DynamicCampaignClusters";

export const metadata = {
title: "Threat Intelligence",
description:
"Indicator registry, infrastructure context and campaign clusters correlated across analyzed email metadata.",
};

export default async function ThreatIntelligencePage() {
await requireUser("/dashboard/threat-intelligence");

return (
<>
<PageHeader
eyebrow="Intelligence"
eyebrowIcon="network"
title="Threat Intelligence"
description="Indicators extracted from analyzed messages, enriched with threat-intelligence context, and correlated into observable activity clusters."
meta={[
{
icon: "refresh",
label: "Source",
value: "Live Gmail analysis",
},
{
icon: "database",
label: "Enrichment",
value: "AbuseIPDB · VirusTotal",
},
]}
actions={ <Button
         href="/dashboard/geoip"
         variant="secondary"
         icon="map"
       >
GeoIP view </Button>
}
/>

```
  <PageBody className="space-y-6">
    <IntelStats />

    <section
      aria-labelledby="registry-heading"
      className="space-y-4"
    >
      <h2
        id="registry-heading"
        className="text-lg font-semibold text-ink"
      >
        Indicator registry
      </h2>

      <IndicatorRegistry />
    </section>

    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <section
        aria-labelledby="campaigns-heading"
        className="space-y-4"
      >
        <div>
          <h2
            id="campaigns-heading"
            className="text-lg font-semibold text-ink"
          >
            Campaign clusters
          </h2>

          <p className="mt-1 text-xs text-ink-muted">
            Derived from sender domains, repeated IOCs and analyzed email
            behavior. These are correlation signals, not attribution
            claims.
          </p>
        </div>

        <DynamicCampaignClusters />
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
