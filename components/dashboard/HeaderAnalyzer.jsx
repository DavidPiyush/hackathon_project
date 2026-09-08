"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import {
  tone as resolveTone,
  AUTH_TONES,
  VERDICT_TONES,
} from "@/lib/utils/tones";
import { parseEmailHeaders, SAMPLE_HEADERS } from "@/lib/utils/parse-headers";
import { riskTone } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, KeyValue, EmptyState } from "@/components/ui/Card";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Form";
import { RiskMeter, Meter } from "@/components/ui/DataDisplay";
import { IndicatorRow, CopyButton } from "@/components/ui/Interactive";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
function normalizeBackendAuthentication(authentication) {
  if (!authentication) {
    return {
      spf: {
        result: "unknown",
        detail: "No SPF result returned by the backend.",
      },
      dkim: {
        result: "unknown",
        detail: "No DKIM result returned by the backend.",
      },
      dmarc: {
        result: "unknown",
        detail: "No DMARC result returned by the backend.",
      },
      alignment: {
        result: "unknown",
        detail: "No alignment result returned by the backend.",
      },
    };
  }

  const normalize = (value, fallback) => {
    if (typeof value === "string") {
      return {
        result: value,
        detail: fallback,
      };
    }

    return {
      result: value?.result || value?.status || "unknown",
      detail: value?.detail || value?.reason || fallback,
    };
  };

  return {
    spf: normalize(
      authentication.spf,
      "SPF analysis was returned without additional detail.",
    ),
    dkim: normalize(
      authentication.dkim,
      "DKIM analysis was returned without additional detail.",
    ),
    dmarc: normalize(
      authentication.dmarc,
      "DMARC analysis was returned without additional detail.",
    ),
    alignment: normalize(
      authentication.alignment,
      "Sender alignment could not be established.",
    ),
  };
}

function normalizeBackendResult(data) {
  const email = data?.email || {};
  const risk = data?.risk || {};
  const authentication = data?.authentication || {};

  const score =
    typeof risk?.score === "number"
      ? risk.score
      : typeof risk?.risk_score === "number"
        ? risk.risk_score
        : typeof risk?.total === "number"
          ? risk.total
          : 0;

  const findings = Array.isArray(data?.findings) ? data.findings : [];

  const indicators = Array.isArray(data?.threat_intelligence?.indicators)
    ? data.threat_intelligence.indicators
    : Array.isArray(email?.indicators)
      ? email.indicators
      : [];

  const signals = Array.isArray(risk?.signals)
    ? risk.signals
    : Array.isArray(risk?.breakdown)
      ? risk.breakdown
      : [];

  const hops = Array.isArray(email?.received)
    ? email.received
    : Array.isArray(email?.received_hops)
      ? email.received_hops
      : [];

  const headers = Array.isArray(email?.headers) ? email.headers : [];

  return {
    ok: true,

    score,

    signals: signals.map((signal, index) => ({
      name:
        signal?.name || signal?.signal || signal?.type || `Signal ${index + 1}`,
      weight:
        typeof signal?.weight === "number"
          ? signal.weight
          : typeof signal?.score === "number"
            ? signal.score
            : 0,
      detail: signal?.detail || signal?.description || "",
    })),

    headerCount: headers.length,

    from: email?.from || email?.sender || null,

    subject: email?.subject || null,

    date: email?.date || null,

    messageId: email?.message_id || email?.messageId || null,

    authentication: normalizeBackendAuthentication(authentication),

    identityAnalysis: data?.identity_analysis || null,
    behavioralAnalysis: data?.behavioral_analysis || null,
    threatIntelligence: data?.threat_intelligence || null,

    hops: hops.map((hop, index) => ({
      hop: hop?.hop || index + 1,

      from: hop?.from || null,

      by: hop?.by || hop?.relay || null,

      protocol: hop?.protocol || null,

      timestamp: hop?.timestamp || null,

      ips: Array.isArray(hop?.ips) ? hop.ips : hop?.ip ? [hop.ip] : [],

      raw: hop?.raw || "",
    })),

    indicators: indicators.map((indicator) => ({
      type: indicator?.type || "unknown",

      value: indicator?.value || "",

      note: indicator?.note || indicator?.description || "",

      verdict: indicator?.verdict || "unknown",
    })),

    findings: findings.map((finding, index) => ({
      id: finding?.id || finding?.finding_id || `finding-${index + 1}`,

      type: finding?.type || "Finding",

      severity: finding?.severity || "unknown",

      description: finding?.description || finding?.detail || "",

      evidence: finding?.evidence || {},
    })),

    headers: headers.map((header) => ({
      key: header?.key || String(header?.name || "").toLowerCase(),

      name: header?.name || "",

      value: header?.value || "",
    })),

    backend: data,
  };
}
function EnrichmentStatus({ label, value }) {
  const available =
    value && typeof value === "object"
      ? Object.keys(value).length > 0
      : Boolean(value);

  return (
    <div className="rounded-lg border border-line bg-raise p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink">{label}</span>
        <Badge tone={available ? "safe" : "neutral"} size="xs">
          {available ? "Available" : "Not returned"}
        </Badge>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-ink-muted">
        {available
          ? "Backend evidence is available for this analysis."
          : "The analysis response did not include this section."}
      </p>
    </div>
  );
}

export function HeaderAnalyzer() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [backendResult, setBackendResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [backendError, setBackendError] = useState("");
  const runLocalAnalysis = (input) => {
    const value = input ?? raw;

    if (!value.trim()) {
      setResult({
        ok: false,
        error: "Paste the raw headers of the message you want to analyse.",
      });

      return null;
    }

    const parsed = parseEmailHeaders(value);

    setResult(parsed);

    return parsed;
  };
  const runBackendAnalysis = async (value) => {
    setLoading(true);
    setBackendError("");
    setBackendResult(null);

    try {
      const response = await fetch(`${API_URL}/analysis/email`, {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          raw_email: value,
        }),

        cache: "no-store",
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Analysis failed with status ${response.status}`,
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "The forensic analysis did not complete successfully.",
        );
      }

      const normalized = normalizeBackendResult(data);

      setBackendResult(normalized);
      setResult(normalized);

      return normalized;
    } catch (error) {
      console.error("[HeaderAnalyzer] Backend analysis failed:", error);

      setBackendError(
        error?.message || "Unable to reach the ThreatDetect analysis engine.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  };
  const analyze = async (input) => {
    const value = input ?? raw;

    if (!value.trim()) {
      setResult({
        ok: false,
        error: "Paste the raw headers of the message you want to analyse.",
      });

      return;
    }
    const local = runLocalAnalysis(value);

    if (!local?.ok) {
      return;
    }
    await runBackendAnalysis(value);
  };
  const loadSample = async () => {
    setRaw(SAMPLE_HEADERS);

    const local = parseEmailHeaders(SAMPLE_HEADERS);

    setResult(local);
    setBackendError("");
    await runBackendAnalysis(SAMPLE_HEADERS);
  };
  const reset = () => {
    setRaw("");
    setResult(null);
    setBackendResult(null);
    setBackendError("");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================
          INPUT
          ====================================================== */}

      <Card className="p-6">
        <CardHeader
          icon="terminal"
          title="Submit raw headers"
          subtitle="Parsed locally first, then enriched by the ThreatDetect analysis engine"
          level={2}
          actions={
            <Badge tone="safe" size="sm" icon="lock">
              Hybrid analysis
            </Badge>
          }
        />

        <div className="mt-5">
          <label htmlFor="raw-headers" className="sr-only">
            Raw email headers
          </label>

          <Textarea
            id="raw-headers"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={10}
            spellCheck={false}
            disabled={loading}
            placeholder={`Received: from mail.example.com (mail.example.com [203.0.113.10])\nFrom: "Sender" <sender@example.com>\nSubject: …`}
            className="ioc leading-6"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => analyze()} icon="search" disabled={loading}>
            {loading ? "Analysing..." : "Analyze headers"}
          </Button>

          <Button
            onClick={loadSample}
            variant="secondary"
            icon="file"
            disabled={loading}
          >
            Load sample
          </Button>

          {(raw || result) && (
            <Button
              onClick={reset}
              variant="ghost"
              icon="refresh"
              disabled={loading}
            >
              Clear
            </Button>
          )}

          <p className="ml-auto hidden text-[11px] text-ink-faint sm:block">
            In most clients:{" "}
            <em className="not-italic text-ink-soft">Show original</em> or{" "}
            <em className="not-italic text-ink-soft">View source</em>
          </p>
        </div>

        <details className="group mt-5 rounded-lg border border-line bg-raise">
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-xs font-medium text-ink-soft">
            Where do I find the raw headers?
            <Icon
              name="chevron-down"
              className="text-[10px] text-ink-faint transition-transform group-open:rotate-180"
            />
          </summary>

          <dl className="space-y-2.5 border-t border-line px-4 py-4">
            {[
              {
                client: "Gmail",
                path: "Open the message → ⋮ → Show original",
              },
              {
                client: "Outlook (web)",
                path: "Open the message → ⋯ → View → View message source",
              },
              {
                client: "Apple Mail",
                path: "View → Message → All Headers",
              },
              {
                client: "Thunderbird",
                path: "View → Message Source (Ctrl+U)",
              },
            ].map((item) => (
              <div
                key={item.client}
                className="flex flex-wrap gap-x-3 text-[11px]"
              >
                <dt className="w-28 shrink-0 font-medium text-ink-soft">
                  {item.client}
                </dt>

                <dd className="text-ink-muted">{item.path}</dd>
              </div>
            ))}
          </dl>
        </details>
      </Card>

      {/* ======================================================
          BACKEND ERROR
          ====================================================== */}

      {backendError && (
        <Card tone="warn" className="p-5">
          <p className="flex items-start gap-3 text-xs leading-6 text-ink-soft">
            <Icon name="warning" className="mt-0.5 shrink-0 text-warn" />

            <span>
              <strong className="font-semibold text-ink">
                Deep analysis unavailable.
              </strong>{" "}
              Local header analysis is still available. {backendError}
            </span>
          </p>
        </Card>
      )}

      {/* ======================================================
          RESULTS
          ====================================================== */}

      {result && !result.ok && (
        <Card tone="warn" className="p-5">
          <p className="flex items-start gap-3 text-xs leading-6 text-ink-soft">
            <Icon name="warning" className="mt-0.5 shrink-0 text-warn" />

            {result.error}
          </p>
        </Card>
      )}

      {result?.ok && (
        <div className="space-y-6 motion-safe:animate-rise">
          {/* ==================================================
              VERDICT
              ================================================== */}

          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <RiskMeter score={result.score} />

            <Card className="p-5">
              <CardHeader
                icon="brain"
                title="Why this score"
                subtitle={`${result.signals.length} contributing signal${
                  result.signals.length === 1 ? "" : "s"
                }`}
                level={2}
              />

              {result.signals.length === 0 ? (
                <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-ink-soft">
                  <Icon
                    name="check-circle"
                    className="mt-0.5 shrink-0 text-safe"
                  />
                  No header-level risk signals fired. Headers alone cannot prove
                  a message is safe — content and payload analysis still apply.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {result.signals.map((signal, index) => (
                    <li key={`${signal.name}-${index}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-medium text-ink">
                          {signal.name}
                        </span>

                        <span className="shrink-0 font-mono text-[11px] font-semibold text-warn">
                          +{signal.weight}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                        {signal.detail}
                      </p>

                      <Meter
                        value={signal.weight}
                        max={25}
                        tone="warn"
                        size="xs"
                        label={`${signal.name}: weight ${signal.weight}`}
                        className="mt-2"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* ==================================================
              MESSAGE IDENTITY
              ================================================== */}

          <Card className="p-5">
            <CardHeader
              icon="fingerprint"
              title="Message identity"
              subtitle={`${result.headerCount} headers parsed`}
              level={2}
            />

            <dl className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <KeyValue
                label="From"
                value={result.from ?? "Not present"}
                mono
              />

              <KeyValue
                label="Subject"
                value={result.subject ?? "Not present"}
              />

              <KeyValue
                label="Date"
                value={result.date ?? "Not present"}
                mono
              />

              <KeyValue
                label="Message ID"
                value={result.messageId ?? "Not present"}
                mono
              />
            </dl>
          </Card>

          {/* ==================================================
              AUTHENTICATION
              ================================================== */}

          <Card className="p-5">
            <CardHeader
              icon="lock"
              title="Authentication results"
              subtitle="SPF, DKIM, DMARC and sender alignment"
              level={2}
            />

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                ["spf", "SPF"],
                ["dkim", "DKIM"],
                ["dmarc", "DMARC"],
                ["alignment", "Alignment"],
              ].map(([key, label]) => {
                const entry = result.authentication?.[key] || {
                  result: "unknown",
                  detail: "No result available.",
                };

                const toneName = AUTH_TONES[entry.result] ?? "neutral";

                const t = resolveTone(toneName);

                return (
                  <div
                    key={key}
                    className={cn("rounded-lg border bg-raise p-3", t.border)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                        {label}
                      </span>

                      <Badge tone={toneName} size="xs" uppercase>
                        {entry.result}
                      </Badge>
                    </div>

                    <p className="ioc mt-2 leading-5 text-ink-muted">
                      {entry.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ==================================================
              ROUTING PATH
              ================================================== */}

          <Card className="p-5">
            <CardHeader
              icon="sitemap"
              title="Routing path"
              subtitle="Reconstructed from Received headers, origin first"
              level={2}
            />

            {result.hops.length === 0 ? (
              <EmptyState
                icon="sitemap"
                title="No routing path available"
                description="The submitted headers contained no Received entries."
                className="py-10"
              />
            ) : (
              <ol className="mt-5 space-y-2.5">
                {result.hops.map((hop) => (
                  <li
                    key={hop.hop}
                    className="rounded-lg border border-line bg-raise p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-[10px] font-bold text-accent">
                        {hop.hop}
                      </span>

                      <span className="ioc font-medium text-ink">
                        {hop.from ?? "unknown origin"}
                      </span>

                      <Icon
                        name="arrow-right"
                        className="text-[9px] text-ink-faint"
                      />

                      <span className="ioc text-ink-soft">
                        {hop.by ?? "unknown relay"}
                      </span>

                      {hop.protocol && (
                        <Badge tone="neutral" size="xs">
                          {hop.protocol}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-ink-faint">
                      {hop.timestamp && (
                        <span className="flex items-center gap-1.5">
                          <Icon name="clock" />
                          {hop.timestamp}
                        </span>
                      )}

                      {hop.ips.map((ip) => (
                        <span key={ip} className="flex items-center gap-1">
                          <Icon name="server" />

                          <span className="ioc text-ink-muted">{ip}</span>

                          <CopyButton value={ip} label={`Copy ${ip}`} />
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* ==================================================
              INDICATORS
              ================================================== */}

          <Card className="p-5">
            <CardHeader
              icon="tag"
              title="Extracted indicators"
              subtitle={`${result.indicators.length} candidate${
                result.indicators.length === 1 ? "" : "s"
              }`}
              level={2}
            />

            {result.indicators.length === 0 ? (
              <EmptyState
                icon="tag"
                title="No indicators extracted"
                className="py-10"
              />
            ) : (
              <ul className="mt-5 space-y-2">
                {result.indicators.map((indicator) => (
                  <li key={`${indicator.type}-${indicator.value}`}>
                    <IndicatorRow
                      indicator={indicator}
                      verdictTone={
                        VERDICT_TONES[indicator.verdict] ?? "neutral"
                      }
                    />

                    {indicator.note && (
                      <p className="mt-1 pl-[4.75rem] text-[10px] text-ink-faint">
                        {indicator.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 flex items-start gap-2 rounded-lg border border-info/20 bg-info/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
              <Icon name="info" className="mt-0.5 shrink-0 text-info" />
              Backend enrichment can correlate indicators with DNS, RDAP,
              reputation and other threat-intelligence sources.
            </p>
          </Card>

          {/* ==================================================
              FINDINGS
              ================================================== */}

          {result.findings?.length > 0 && (
            <Card className="p-5">
              <CardHeader
                icon="warning"
                title="Forensic findings"
                subtitle={`${result.findings.length} finding${
                  result.findings.length === 1 ? "" : "s"
                } returned by the analysis engine`}
                level={2}
              />

              <ul className="mt-5 space-y-3">
                {result.findings.map((finding) => (
                  <li
                    key={finding.id}
                    className="rounded-lg border border-line bg-raise p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ink">
                        {finding.type}
                      </span>

                      <Badge
                        tone={
                          finding.severity === "critical"
                            ? "critical"
                            : finding.severity === "high"
                              ? "high"
                              : finding.severity === "medium"
                                ? "warn"
                                : "neutral"
                        }
                        size="xs"
                        uppercase
                      >
                        {finding.severity}
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs leading-6 text-ink-soft">
                      {finding.description}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* ==================================================
              ALL HEADERS
              ================================================== */}

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-5">
              <CardHeader
                icon="code"
                title="All parsed headers"
                subtitle="Unfolded per RFC 5322, in the order received"
                level={2}
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Every header parsed from the submitted message
                </caption>

                <thead className="sticky top-0 bg-elevated">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint"
                    >
                      Header
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint"
                    >
                      Value
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {result.headers.map((header, index) => (
                    <tr
                      key={`${header.key}-${index}`}
                      className="align-top transition duration-150 hover:bg-raise"
                    >
                      <th
                        scope="row"
                        className="w-48 px-5 py-2.5 text-left font-mono text-[11px] font-semibold text-accent"
                      >
                        {header.name}
                      </th>

                      <td className="ioc px-5 py-2.5 leading-5 text-ink-muted">
                        {header.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================
          READY STATE
          ======================================================== */}

      {!result && (
        <Card className="p-6">
          <Eyebrow icon="info">Ready</Eyebrow>

          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Paste headers above, or{" "}
            <button
              type="button"
              onClick={loadSample}
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
              disabled={loading}
            >
              load the sample message
            </button>{" "}
            to see a full analysis of a business email compromise attempt.
          </p>
        </Card>
      )}
    </div>
  );
}

export default HeaderAnalyzer;
