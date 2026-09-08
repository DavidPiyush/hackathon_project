"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import { analysis, isApiConfigured } from "@/lib/api/client";
import { useApiAction, describeApiError } from "@/lib/api/useBackend";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select, Field } from "@/components/ui/Form";
import { Spinner } from "@/components/ui/Feedback";
import { RiskMeter } from "@/components/ui/DataDisplay";

/**
 * Server-side analysis.
 *
 * The browser parser in `HeaderAnalyzer` is deliberately limited: it can read
 * what the headers say, but it cannot resolve DNS, query RDAP or check
 * reputation, so every indicator it finds stays `unknown`. This posts the same
 * raw message to `POST /analysis/email`, where the full pipeline runs and can
 * actually assign verdicts.
 *
 * Only mounted when a backend is configured (the caller checks), because this
 * also reads the case list from the console store. The internal guard below is
 * a belt-and-braces fallback for any future caller that forgets.
 */
export function ServerAnalysis({ rawEmail }) {
  const { investigations } = useData();
  const [caseId, setCaseId] = useState("");

  const { status, data, error, run, reset } = useApiAction((payload) =>
    analysis.email(payload),
  );

  if (!isApiConfigured()) {
    return null;
  }

  const hasInput = Boolean(rawEmail?.trim());

  return (
    <Card className="p-6">
      <CardHeader
        icon="server"
        title="Full server analysis"
        subtitle="Runs the complete pipeline, including DNS, RDAP and reputation enrichment"
        level={2}
        actions={
          <Badge tone="accent" size="sm" icon="network">
            Backend
          </Badge>
        }
      />

      <p className="mt-4 flex items-start gap-2 rounded-lg border border-info/20 bg-info/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
        <Icon name="info" className="mt-0.5 shrink-0 text-info" />
        <span>
          Unlike the in-browser pass, this <strong>sends the message to the
          server</strong>. That is what lets it assign verdicts rather than
          leaving every indicator unknown — but it also means the message leaves
          this machine.
        </span>
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field
          id="server-analysis-case"
          label="Attach to a case"
          hint="Optional. Links the result to an existing investigation."
        >
          {(field) => (
            <Select
              {...field}
              value={caseId}
              onChange={(event) => setCaseId(event.target.value)}
            >
              <option value="">Standalone analysis</option>

              {investigations.map((item) => (
                <option key={item.case_id} value={item.case_id}>
                  {item.case_id} — {item.title}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Button
          onClick={() => run({ rawEmail, caseId: caseId || null })}
          disabled={!hasInput || status === "loading"}
          icon={status === "loading" ? undefined : "magic"}
        >
          {status === "loading" && <Spinner size="xs" />}
          {status === "loading" ? "Analysing…" : "Analyse on the server"}
        </Button>
      </div>

      {!hasInput && (
        <p className="mt-3 text-[11px] text-ink-faint">
          Paste headers above, or load the sample, to enable this.
        </p>
      )}

      {/* ---------------- Errors ---------------- */}
      {status === "error" && (
        <div className="mt-5 rounded-lg border border-critical/25 bg-critical/[0.06] p-3">
          <p className="flex items-start gap-2 text-xs leading-6 text-critical">
            <Icon name="warning" className="mt-0.5 shrink-0" />
            {describeApiError(error)}
          </p>

          {/* Field-level detail from a 422, mapped by the client. */}
          {Object.keys(error?.fieldErrors ?? {}).length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-critical/20 pt-3">
              {Object.entries(error.fieldErrors).map(([field, message]) => (
                <li key={field} className="text-[11px] text-ink-soft">
                  <code className="ioc text-critical">{field}</code> — {message}
                </li>
              ))}
            </ul>
          )}

          {error?.code === "unauthenticated" && (
            <p className="mt-3 border-t border-critical/20 pt-3 text-[11px] leading-5 text-ink-soft">
              The analysis endpoints require a backend session. Sign in with
              Google from the sign-in page, then try again.
            </p>
          )}
        </div>
      )}

      {/* ---------------- Result ---------------- */}
      {status === "success" && data && (
        <div className="mt-6 space-y-4 motion-safe:animate-rise">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-medium text-safe">
              <Icon name="check-circle" />
              Analysis complete
            </p>

            <Button variant="ghost" size="sm" icon="refresh" onClick={reset}>
              Clear
            </Button>
          </div>

          {/* The response is untyped in the spec, so anything recognisable is
              surfaced and the rest is shown raw rather than dropped. */}
          {typeof data.score === "number" && <RiskMeter score={data.score} />}

          <ResponseTree payload={data} />
        </div>
      )}
    </Card>
  );
}

/**
 * Render an untyped JSON response readably.
 *
 * `/analysis/email` is documented with an empty schema, so the shape is not
 * known ahead of time. Rather than guess and silently drop fields, this walks
 * the object — scalars as key/value rows, nested objects and arrays collapsed
 * into disclosures.
 */
function ResponseTree({ payload, depth = 0 }) {
  if (payload === null || payload === undefined) {
    return <span className="ioc text-ink-faint">null</span>;
  }

  if (typeof payload !== "object") {
    return <span className="ioc break-all text-ink-soft">{String(payload)}</span>;
  }

  const entries = Array.isArray(payload)
    ? payload.map((value, index) => [String(index), value])
    : Object.entries(payload);

  if (entries.length === 0) {
    return (
      <span className="ioc text-ink-faint">
        {Array.isArray(payload) ? "[]" : "{}"}
      </span>
    );
  }

  return (
    <dl className={cn("space-y-2", depth > 0 && "mt-2")}>
      {entries.map(([key, value]) => {
        const nested = value !== null && typeof value === "object";

        return (
          <div
            key={key}
            className="rounded-lg border border-line bg-raise px-3 py-2"
          >
            {nested ? (
              <details>
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-[11px] font-medium text-ink-soft">
                  <span>{key}</span>

                  <span className="text-[10px] text-ink-faint">
                    {Array.isArray(value)
                      ? `${value.length} item${value.length === 1 ? "" : "s"}`
                      : `${Object.keys(value).length} field${Object.keys(value).length === 1 ? "" : "s"}`}
                  </span>
                </summary>

                {/* Nesting is capped so a deeply recursive payload cannot
                    render an unbounded tree. */}
                {depth < 3 ? (
                  <ResponseTree payload={value} depth={depth + 1} />
                ) : (
                  <pre className="mt-2 overflow-x-auto text-[10px] text-ink-muted">
                    <code>{JSON.stringify(value, null, 2)}</code>
                  </pre>
                )}
              </details>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-[11px] text-ink-faint">{key}</dt>

                <dd className="ioc max-w-[65%] break-all text-right text-ink-soft">
                  {String(value)}
                </dd>
              </div>
            )}
          </div>
        );
      })}
    </dl>
  );
}

export default ServerAnalysis;
