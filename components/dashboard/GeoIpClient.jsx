"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const DEFAULT_IP = "8.8.8.8";

function isValidIp(value) {
  const input = value.trim();

  if (!input) return false;
  const ipv4Parts = input.split(".");

  if (
    ipv4Parts.length === 4 &&
    ipv4Parts.every((part) => {
      if (!/^\d+$/.test(part)) return false;

      const number = Number(part);

      return number >= 0 && number <= 255;
    })
  ) {
    return true;
  }
  if (input.includes(":")) {
    return /^[0-9a-fA-F:]+$/.test(input);
  }

  return false;
}

function formatCoordinate(value, positive, negative) {
  if (value === null || value === undefined) return "Unknown";

  const number = Number(value);

  if (!Number.isFinite(number)) return "Unknown";

  const direction = number >= 0 ? positive : negative;

  return `${Math.abs(number).toFixed(4)}° ${direction}`;
}

function formatAccuracy(value) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Unknown";
  }

  return `${number.toLocaleString()} km`;
}

function getMapPosition(latitude, longitude) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return null;
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const left = ((lon + 180) / 360) * 100;
  const top = ((90 - lat) / 180) * 100;

  return {
    left: Math.max(1, Math.min(99, left)),
    top: Math.max(1, Math.min(99, top)),
  };
}

function getAccuracyDiameter(radiusKm) {
  if (!radiusKm || !Number.isFinite(Number(radiusKm))) {
    return 0;
  }
  const diameter = (Number(radiusKm) * 2 * 100) / 20000;

  return Math.max(4, Math.min(80, diameter));
}

function EvidenceRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <span className="text-[11px] uppercase tracking-wider text-ink-faint">
        {label}
      </span>

      <span
        className={cn(
          "max-w-[65%] text-right text-xs text-ink",
          mono && "font-mono",
        )}
      >
        {value ?? "Unknown"}
      </span>
    </div>
  );
}

function EvidenceBadge({ children }) {
  return (
    <Badge tone="info" size="xs" uppercase>
      {children}
    </Badge>
  );
}

export function GeoIpClient() {
  const [ip, setIp] = useState(DEFAULT_IP);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const data = result?.data ?? null;

  const geolocation = data?.geolocation ?? {};
  const network = data?.network ?? {};
  const errors = Array.isArray(data?.errors) ? data.errors : [];

  const mapPosition = useMemo(
    () => getMapPosition(geolocation.latitude, geolocation.longitude),
    [geolocation.latitude, geolocation.longitude],
  );

  const accuracyDiameter = useMemo(
    () => getAccuracyDiameter(geolocation.accuracy_radius_km),
    [geolocation.accuracy_radius_km],
  );

  async function lookupIp(value = ip) {
    const target = value.trim();

    setError("");

    if (!isValidIp(target)) {
      setResult(null);
      setError("Enter a valid IPv4 or IPv6 address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/geoip/${encodeURIComponent(target)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      let payload = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(
          payload?.detail ||
            `GeoIP lookup failed with HTTP ${response.status}.`,
        );
      }

      if (!payload?.success) {
        throw new Error(
          payload?.detail ||
            payload?.data?.errors?.join(", ") ||
            "GeoIP lookup failed.",
        );
      }

      setResult(payload);
    } catch (lookupError) {
      console.error("[GEOIP] Lookup failed:", lookupError);

      setResult(null);
      setError(lookupError?.message || "Unable to reach the GeoIP service.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    lookupIp();
  }

  function loadSample() {
    setIp(DEFAULT_IP);
    lookupIp(DEFAULT_IP);
  }

  function exportJson() {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    const safeIp = String(data?.ip || "lookup").replace(
      /[^0-9a-zA-Z._-]/g,
      "_",
    );
    anchor.download = `geoip-${safeIp}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure"
        eyebrowIcon="map"
        title="GeoIP Intelligence"
        description="Resolve observable network infrastructure into geographic and ASN context. This is evidence about infrastructure — not attribution of a person."
        meta={[
          {
            icon: "globe",
            label: "Source",
            value: "MaxMind",
          },
          {
            icon: "server",
            label: "Mode",
            value: "Live lookup",
          },
        ]}
        actions={
          <>
            <Button
              type="button"
              icon="download"
              onClick={exportJson}
              disabled={!result}
            >
              Export JSON
            </Button>

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
                compromised hosts and cloud providers can break any direct
                relationship between infrastructure and an operator. Treat these
                results as infrastructure evidence —{" "}
                <em className="not-italic text-info">never as attribution</em>.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader
            icon="search"
            title="IP intelligence lookup"
            subtitle="Query the backend GeoIP service backed by MaxMind GeoLite2"
            level={2}
          />

          <form onSubmit={handleSubmit} className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Icon
                  name="server"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
                />

                <input
                  value={ip}
                  onChange={(event) => setIp(event.target.value)}
                  placeholder="8.8.8.8"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-xl border border-line bg-sunken px-10 py-3 font-mono text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                />
              </div>

              <Button type="submit" icon="search" disabled={loading}>
                {loading ? "Resolving..." : "Lookup IP"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={loadSample}
                disabled={loading}
              >
                Test 8.8.8.8
              </Button>
            </div>

            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-critical/20 bg-critical/5 px-4 py-3 text-xs text-critical">
                <Icon name="warning" />
                <span>{error}</span>
              </div>
            ) : null}
          </form>
        </Card>

        {!data && !loading ? (
          <Card className="p-8">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-sunken text-accent">
                <Icon name="globe" />
              </div>

              <h2 className="mt-5 text-base font-semibold text-ink">
                No IP has been analysed yet
              </h2>

              <p className="mt-2 text-xs leading-6 text-ink-muted">
                Enter an IPv4 or IPv6 address above to retrieve geographic, ASN
                and network-registration intelligence from the backend.
              </p>
            </div>
          </Card>
        ) : null}

        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center gap-3 text-xs text-ink-muted">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
              Querying MaxMind GeoIP intelligence...
            </div>
          </Card>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="globe"
                label="Country"
                value={geolocation.country || "Unknown"}
                detail={
                  geolocation.country_code
                    ? `Country code ${geolocation.country_code}`
                    : "No country returned"
                }
              />

              <StatCard
                icon="server"
                label="ASN"
                value={network.asn ? `AS${network.asn}` : "Unknown"}
                detail={network.organization || "Network operator unavailable"}
                tone="info"
              />

              <StatCard
                icon="pin"
                label="Accuracy radius"
                value={formatAccuracy(geolocation.accuracy_radius_km)}
                detail="Approximate GeoIP confidence boundary"
                tone="warn"
              />

              <StatCard
                icon="shield"
                label="Classification"
                value={data.classification ? data.classification : "Unknown"}
                detail={
                  data.is_public
                    ? "Publicly routable address"
                    : "Non-public address"
                }
                tone={data.is_public ? "safe" : "neutral"}
              />
            </div>

            <Card className="p-6">
              <CardHeader
                icon="map"
                title="Network geolocation"
                subtitle="Schematic geographic representation of the observed IP"
                level={2}
                actions={<EvidenceBadge>MaxMind GeoIP</EvidenceBadge>}
              />

              <div className="mt-6 overflow-x-auto">
                <div className="relative min-w-[40rem]">
                  <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-line bg-sunken">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-blueprint opacity-[0.06]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-1/2 h-px bg-line-strong/60"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 left-1/2 w-px bg-line-strong/60"
                    />

                    <div className="absolute left-1/2 top-3 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                      0° latitude
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-widest text-ink-faint">
                      180° / 180°
                    </div>

                    {mapPosition ? (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${mapPosition.left}%`,
                          top: `${mapPosition.top}%`,
                        }}
                      >
                        {accuracyDiameter > 0 ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-info/30 bg-info/5"
                            style={{
                              width: `${accuracyDiameter}%`,
                              aspectRatio: "1",
                            }}
                          />
                        ) : null}

                        <span className="relative block h-3 w-3 rounded-full bg-info ring-4 ring-info/20" />

                        <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-raise px-2 py-1 font-mono text-[9px] text-ink">
                          {data.ip}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-lg border border-line bg-raise px-4 py-3 text-xs text-ink-muted">
                          No geographic coordinates returned.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-faint">
                    <span>Schematic projection — not a measurement map.</span>

                    <span className="font-mono">
                      {geolocation.latitude !== null &&
                      geolocation.latitude !== undefined &&
                      geolocation.longitude !== null &&
                      geolocation.longitude !== undefined
                        ? `${Number(geolocation.latitude).toFixed(4)}, ${Number(
                            geolocation.longitude,
                          ).toFixed(4)}`
                        : "Coordinates unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-6">
                <CardHeader
                  icon="pin"
                  title="Geolocation evidence"
                  subtitle="Observed geographic registration data"
                  level={2}
                />

                <div className="mt-4">
                  <EvidenceRow
                    label="Country"
                    value={
                      geolocation.country
                        ? `${geolocation.country}${
                            geolocation.country_code
                              ? ` (${geolocation.country_code})`
                              : ""
                          }`
                        : "Unknown"
                    }
                  />

                  <EvidenceRow
                    label="Continent"
                    value={geolocation.continent}
                  />

                  <EvidenceRow
                    label="Region"
                    value={
                      geolocation.region || geolocation.region_code
                        ? [geolocation.region, geolocation.region_code]
                            .filter(Boolean)
                            .join(" · ")
                        : "Unknown"
                    }
                  />

                  <EvidenceRow label="City" value={geolocation.city} />

                  <EvidenceRow
                    label="Latitude"
                    value={formatCoordinate(geolocation.latitude, "N", "S")}
                    mono
                  />

                  <EvidenceRow
                    label="Longitude"
                    value={formatCoordinate(geolocation.longitude, "E", "W")}
                    mono
                  />

                  <EvidenceRow
                    label="Accuracy radius"
                    value={formatAccuracy(geolocation.accuracy_radius_km)}
                  />

                  <EvidenceRow label="Timezone" value={geolocation.timezone} />
                </div>
              </Card>

              <Card className="p-6">
                <CardHeader
                  icon="server"
                  title="Network intelligence"
                  subtitle="ASN and registered network context"
                  level={2}
                />

                <div className="mt-4">
                  <EvidenceRow label="IP" value={data.ip} mono />

                  <EvidenceRow
                    label="Classification"
                    value={data.classification}
                  />

                  <EvidenceRow
                    label="Public"
                    value={data.is_public ? "Yes" : "No"}
                  />

                  <EvidenceRow
                    label="ASN"
                    value={network.asn ? `AS${network.asn}` : "Unknown"}
                    mono
                  />

                  <EvidenceRow
                    label="Organization"
                    value={network.organization}
                  />

                  <EvidenceRow label="Network" value={network.network} mono />

                  <EvidenceRow
                    label="GeoIP source"
                    value={data.sources?.geoip}
                  />

                  <EvidenceRow label="ASN source" value={data.sources?.asn} />
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader
                icon="scale"
                title="Evidence interpretation"
                subtitle="How this result should be used in an investigation"
                level={2}
              />

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-line bg-raise p-4">
                  <EvidenceBadge>Observed</EvidenceBadge>

                  <p className="mt-3 text-sm font-semibold text-ink">
                    Network registration
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                    The IP, ASN, organization and network returned by the GeoIP
                    provider are observable infrastructure attributes.
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-raise p-4">
                  <EvidenceBadge>Derived</EvidenceBadge>

                  <p className="mt-3 text-sm font-semibold text-ink">
                    Geographic context
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                    Country, coordinates and accuracy radius provide a
                    probabilistic geographic context for the network.
                  </p>
                </div>

                <div className="rounded-lg border border-line bg-raise p-4">
                  <Badge tone="warn" size="xs" uppercase>
                    Not attribution
                  </Badge>

                  <p className="mt-3 text-sm font-semibold text-ink">
                    No operator identification
                  </p>

                  <p className="mt-2 text-[11px] leading-5 text-ink-muted">
                    GeoIP does not establish who controlled the address or where
                    a human operator physically was.
                  </p>
                </div>
              </div>
            </Card>

            {errors.length > 0 ? (
              <Card tone="warn" className="p-5">
                <div className="flex items-start gap-3">
                  <Icon name="warning" />

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Provider warnings
                    </p>

                    <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                      {errors.map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ) : null}

            <Card className="p-6">
              <CardHeader
                icon="scale"
                title="How an origin is established"
                subtitle="Each step should remain challengeable during investigation"
                level={2}
              />

              <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "01",
                    title: "Earliest reliable hop",
                    text: "Use the earliest trustworthy network observation from the email's Received chain rather than accepting a sender-controlled address.",
                  },
                  {
                    step: "02",
                    title: "Address extraction",
                    text: "Extract the relevant IP and classify whether it is public, private, reserved or otherwise unsuitable for external geolocation.",
                  },
                  {
                    step: "03",
                    title: "Network lookup",
                    text: "Resolve geographic and ASN metadata through the configured MaxMind GeoIP databases.",
                  },
                  {
                    step: "04",
                    title: "Confidence boundary",
                    text: "Preserve the provider accuracy radius and infrastructure context instead of converting network registration into a claim about a person's location.",
                  },
                ].map((item) => (
                  <li
                    key={item.step}
                    className="rounded-lg border border-line bg-raise p-4"
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
                A hosting-provider address tells you where infrastructure is
                registered or hosted. It rarely tells you where the operator is
                physically located.
              </p>
            </Card>
          </>
        ) : null}
      </PageBody>
    </>
  );
}
