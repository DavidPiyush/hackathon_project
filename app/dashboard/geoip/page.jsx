import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { geoOrigins } from "@/lib/data/dashboard";
import { riskTone, riskLabel } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "GeoIP Intelligence",
  description:
    "Network and location context for observed sending infrastructure, with explicit limits on what geolocation can prove.",
};

export default function GeoIpPage() {
  const totalVolume = geoOrigins.reduce(
    (total, origin) => total + origin.volume,
    0,
  );

  const highRisk = geoOrigins.filter((origin) => origin.risk >= 75);
  const countries = new Set(geoOrigins.map((origin) => origin.code)).size;

  const sorted = [...geoOrigins].sort((a, b) => b.risk - a.risk);

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure"
        eyebrowIcon="map"
        title="GeoIP Intelligence"
        description="Where the infrastructure behind analysed messages is registered, and which networks host it. This is context about servers, not about people."
        meta={[
          { icon: "globe", label: "Origins", value: geoOrigins.length },
          { icon: "pin", label: "Countries", value: countries },
        ]}
        actions={
          <>
            <Button icon="download">Export origins</Button>

            <Button
              href="/dashboard/threat-intelligence"
              variant="secondary"
              icon="network"
            >
              Indicator registry
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        {/* ================= LIMITS NOTICE ================= */}
        <Card tone="info" className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <Icon name="info" />
            </span>

            <div>
              <p className="text-sm font-semibold text-ink">
                What geolocation can and cannot tell you
              </p>

              <p className="mt-2 max-w-3xl text-xs leading-6 text-ink-soft">
                GeoIP resolves the{" "}
                <strong className="font-semibold text-ink">
                  registered location of a network
                </strong>
                , not the physical location of a sender. VPNs, proxies,
                compromised hosts and cloud providers routinely break any link
                between the two. Treat these results as infrastructure context —{" "}
                <em className="not-italic text-info">
                  never as attribution
                </em>
                .
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="globe"
            label="Observed origins"
            value={geoOrigins.length}
            detail="Distinct sending addresses"
          />

          <StatCard
            icon="envelope"
            label="Message volume"
            value={totalVolume}
            detail="Attributed to these origins"
            tone="info"
          />

          <StatCard
            icon="warning"
            label="High-risk origins"
            value={highRisk.length}
            detail="Scoring 75 or above"
            tone="critical"
          />

          <StatCard
            icon="pin"
            label="Countries"
            value={countries}
            detail="By network registration"
            tone="warn"
          />
        </div>

        {/* ================= SCHEMATIC MAP ================= */}
        <Card className="p-6">
          <CardHeader
            icon="map"
            title="Observed sending origins"
            subtitle="Marker size reflects volume; colour reflects risk"
            level={2}
            actions={
              <div className="hidden items-center gap-3 sm:flex">
                {[
                  { tone: "critical", label: "High" },
                  { tone: "warn", label: "Suspicious" },
                  { tone: "safe", label: "Safe" },
                ].map((key) => (
                  <span
                    key={key.label}
                    className="flex items-center gap-1.5 text-[10px] text-ink-muted"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        resolveTone(key.tone).fill,
                      )}
                    />
                    {key.label}
                  </span>
                ))}
              </div>
            }
          />

          {/*
            A schematic plot rather than a tile map: it needs no map library,
            no external tile requests (which the CSP would block anyway) and no
            client JavaScript. Positions are percentage coordinates on an
            equirectangular projection.
          */}
          <div className="mt-6 overflow-x-auto">
            <div className="relative min-w-[40rem]">
              <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-line bg-abyss">
                {/* Graticule */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-blueprint opacity-[0.06]"
                />

                {/* Equator and prime meridian */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1/2 h-px bg-line-strong/60"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-px bg-line-strong/60"
                />

                {geoOrigins.map((origin) => {
                  const t = resolveTone(riskTone(origin.risk));
                  const diameter = 12 + (origin.volume / totalVolume) * 60;

                  return (
                    <div
                      key={origin.ip}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
                    >
                      {/* Halo sized by volume */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20",
                          t.fill,
                        )}
                        style={{ width: diameter, height: diameter }}
                      />

                      <span
                        className={cn(
                          "relative block h-2.5 w-2.5 rounded-full ring-2 ring-canvas",
                          t.fill,
                        )}
                        title={`${origin.city}, ${origin.country} — ${origin.volume} messages, ${riskLabel(origin.risk)}`}
                      />

                      <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-ink-faint">
                        {origin.code}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px] text-ink-faint">
                Schematic projection. Marker positions are approximate and
                intended for comparison, not measurement.
              </p>
            </div>
          </div>
        </Card>

        {/* ================= ORIGIN TABLE ================= */}
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-line p-5">
            <CardHeader
              icon="server"
              title="Origin detail"
              subtitle="Sorted by risk score"
              level={2}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <caption className="sr-only">
                Observed sending origins with network, volume and risk
              </caption>

              <thead className="border-b border-line bg-white/[0.015]">
                <tr>
                  {[
                    "Origin",
                    "Location",
                    "Network",
                    "Volume",
                    "Risk",
                    "Severity",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-ink-faint"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {sorted.map((origin) => (
                  <tr
                    key={origin.ip}
                    className="transition duration-150 hover:bg-elevated/50"
                  >
                    <th scope="row" className="px-5 py-4 text-left font-normal">
                      <span className="ioc font-medium text-ink">
                        {origin.ip}
                      </span>
                    </th>

                    <td className="px-5 py-4">
                      <p className="text-xs text-ink-soft">{origin.city}</p>
                      <p className="mt-0.5 text-[10px] text-ink-faint">
                        {origin.country}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-xs text-ink-soft">{origin.network}</p>
                      <p className="ioc mt-0.5 text-[10px] text-ink-faint">
                        {origin.asn}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Meter
                          value={origin.volume}
                          max={Math.max(...geoOrigins.map((o) => o.volume))}
                          tone="info"
                          size="sm"
                          label={`${origin.volume} messages from ${origin.ip}`}
                          className="w-16"
                        />

                        <span className="font-mono text-[11px] font-semibold text-ink">
                          {origin.volume}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "font-mono text-sm font-bold",
                          resolveTone(riskTone(origin.risk)).text,
                        )}
                      >
                        {origin.risk}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <RiskBadge score={origin.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ================= METHOD ================= */}
        <Card className="p-6">
          <CardHeader
            icon="scale"
            title="How an origin is established"
            subtitle="Each step is recorded so the conclusion can be challenged"
            level={2}
          />

          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Earliest hop",
                text: "Read the first Received header, which the receiving infrastructure added — not one the sender controls.",
              },
              {
                step: "02",
                title: "Address extraction",
                text: "Pull the client IP recorded by that hop, ignoring any address the sender claimed.",
              },
              {
                step: "03",
                title: "Network lookup",
                text: "Resolve ASN, network operator and registration country through RDAP.",
              },
              {
                step: "04",
                title: "Confidence note",
                text: "Record whether the address is a hosting provider, relay or residential range, since that changes what it implies.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-line bg-white/[0.02] p-4"
              >
                <span className="font-mono text-lg font-bold text-accent/40">
                  {item.step}
                </span>

                <p className="mt-2 text-sm font-semibold text-ink">
                  {item.title}
                </p>

                <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
            <Badge tone="warn" size="xs" icon="warning" uppercase>
              Limitation
            </Badge>
            A hosting-provider address tells you where a server is rented, which
            is rarely where the operator is.
          </p>
        </Card>
      </PageBody>
    </>
  );
}
