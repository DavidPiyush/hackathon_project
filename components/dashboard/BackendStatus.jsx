"use client";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { health, API_BASE_URL, isApiConfigured } from "@/lib/api/client";
import { useApiQuery, describeApiError } from "@/lib/api/useBackend";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";

/**
 * Live backend health.
 *
 * Calls `GET /health/full`, which the spec describes as combined application,
 * database and service health. Polls every 30 seconds so the panel stays
 * current without hammering the API.
 *
 * When no backend is configured it says so and explains what to set, rather
 * than showing a red "down" state that would wrongly suggest something is
 * broken.
 */
export function BackendStatus({ compact = false }) {
  const { status, data, error, refetch } = useApiQuery(
    (options) => health.full(options),
    { pollMs: 30000 },
  );

  const configured = isApiConfigured();

  /* ---------------- Not configured ---------------- */

  if (!configured) {
    if (compact) {
      return (
        <span className="hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-ink-muted lg:flex">
          <StatusDot tone="warn" />
          Local mode
        </span>
      );
    }

    return (
      <Card tone="warn" className="p-5">
        <CardHeader
          icon="database"
          iconTone="warn"
          title="Running without a backend"
          subtitle="The console is using its local demo store"
          level={2}
        />

        <p className="mt-4 text-xs leading-6 text-ink-soft">
          Set{" "}
          <code className="rounded border border-line bg-raise-md px-1.5 py-0.5 font-mono text-[11px] text-ink">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          in{" "}
          <code className="rounded border border-line bg-raise-md px-1.5 py-0.5 font-mono text-[11px] text-ink">
            .env.local
          </code>{" "}
          to the FastAPI origin and restart the dev server. Google sign-in,
          Gmail ingestion and server-side analysis all become available.
        </p>

        <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-sunken p-3 font-mono text-[11px] leading-6 text-ink-soft">
          <code>NEXT_PUBLIC_API_URL=http://localhost:8000</code>
        </pre>
      </Card>
    );
  }

  /* ---------------- Compact chip for the header ---------------- */

  if (compact) {
    const tone =
      status === "success" ? "safe" : status === "loading" ? "info" : "critical";

    const label =
      status === "success"
        ? "Backend online"
        : status === "loading"
          ? "Checking…"
          : "Backend offline";

    return (
      <span
        title={
          status === "error" ? describeApiError(error) : `${API_BASE_URL} — ${label}`
        }
        className="hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-ink-muted lg:flex"
      >
        {status === "loading" ? (
          <Spinner size="xs" className="text-info" />
        ) : (
          <StatusDot tone={tone} />
        )}
        {label}
      </span>
    );
  }

  /* ---------------- Full panel ---------------- */

  return (
    <Card className="p-5">
      <CardHeader
        icon="server"
        iconTone={status === "success" ? "safe" : status === "error" ? "critical" : "info"}
        title="Backend connection"
        subtitle={API_BASE_URL}
        level={2}
        actions={
          <IconButton
            icon="refresh"
            label="Re-check backend health"
            size="sm"
            onClick={refetch}
          />
        }
      />

      {status === "loading" && (
        <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
          <Spinner size="xs" className="text-accent" />
          Checking <code className="ioc">GET /health/full</code>…
        </p>
      )}

      {status === "error" && (
        <div className="mt-4 rounded-lg border border-critical/25 bg-critical/[0.06] p-3">
          <p className="flex items-start gap-2 text-xs leading-6 text-critical">
            <Icon name="warning" className="mt-0.5 shrink-0" />
            {describeApiError(error)}
          </p>

          {/*
            CORS is the usual cause of a "network" failure here, and the browser
            deliberately hides the detail — so the likely fix is spelled out.
          */}
          {error?.code === "network" && (
            <p className="mt-3 border-t border-critical/20 pt-3 text-[11px] leading-5 text-ink-soft">
              The session is a cookie, so requests are sent with{" "}
              <code className="ioc">credentials: &quot;include&quot;</code>. The
              backend must therefore name this origin explicitly in its CORS
              policy — a wildcard is not permitted with credentialed requests.
            </p>
          )}
        </div>
      )}

      {status === "success" && (
        <>
          <p className="mt-4 flex items-center gap-2 text-xs text-safe">
            <StatusDot tone="safe" />
            Connected
          </p>

          <HealthReadout payload={data} />
        </>
      )}
    </Card>
  );
}

/**
 * Render whatever `/health/full` returned.
 *
 * The spec types the response as a free-form object, so this walks it rather
 * than assuming a shape — a backend that adds a field gets it displayed
 * instead of dropped.
 */
function HealthReadout({ payload }) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const entries = Object.entries(payload);

  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className="mt-4 space-y-2">
      {entries.map(([key, value]) => {
        const text =
          value === null || value === undefined
            ? "—"
            : typeof value === "object"
              ? JSON.stringify(value)
              : String(value);

        const looksHealthy = /^(ok|healthy|up|true|connected|operational)$/i.test(
          text,
        );

        const looksBroken = /^(false|down|error|unhealthy|disconnected)$/i.test(
          text,
        );

        const t = resolveTone(
          looksHealthy ? "safe" : looksBroken ? "critical" : "neutral",
        );

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-3 rounded-lg border border-line bg-raise px-3 py-2"
          >
            <dt className="text-[11px] text-ink-faint">{key}</dt>

            <dd
              className={cn(
                "ioc max-w-[60%] break-all text-right",
                looksHealthy || looksBroken ? t.text : "text-ink-soft",
              )}
            >
              {text}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Probe every documented health endpoint, for the settings page. */
export function BackendProbes() {
  const probes = [
    { name: "Application", path: "/health", call: health.basic },
    { name: "Database", path: "/health/database", call: health.database },
    { name: "Threat intel", path: "/health/threat-intel", call: health.threatIntel },
    { name: "Services", path: "/health/services", call: health.services },
  ];

  if (!isApiConfigured()) {
    return null;
  }

  return (
    <Card className="p-5">
      <CardHeader
        icon="gauge"
        title="Health probes"
        subtitle="Every documented readiness endpoint"
        level={2}
      />

      <ul className="mt-5 space-y-2">
        {probes.map((probe) => (
          <li key={probe.path}>
            <Probe {...probe} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Probe({ name, path, call }) {
  const { status, error } = useApiQuery((options) => call(options));

  const tone =
    status === "success" ? "safe" : status === "loading" ? "info" : "critical";

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raise px-3 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-medium text-ink">
          {status === "loading" ? (
            <Spinner size="xs" className="text-info" />
          ) : (
            <StatusDot tone={tone} />
          )}
          {name}
        </p>

        <p className="ioc mt-1 truncate text-ink-faint">{path}</p>
      </div>

      <Badge tone={tone} size="xs" uppercase>
        {status === "success"
          ? "ok"
          : status === "loading"
            ? "checking"
            : (error?.status || "fail")}
      </Badge>
    </div>
  );
}

/** Link out to the interactive OpenAPI docs the backend serves. */
export function BackendDocsLink() {
  if (!isApiConfigured()) {
    return null;
  }

  return (
    <Button
      href={`${API_BASE_URL}/docs`}
      external
      variant="secondary"
      size="sm"
      iconEnd="external"
    >
      Open FastAPI docs
    </Button>
  );
}

export default BackendStatus;
