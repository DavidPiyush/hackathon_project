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

/**
 * Live header analyzer.
 *
 * This is the working core of the analysis page. Paste raw headers and the
 * routing path, authentication results, indicators and a scored, explained
 * assessment are produced in the browser — the message never leaves the
 * machine, which is the correct handling for potentially hostile evidence.
 */
export function HeaderAnalyzer() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);

  const analyze = (input) => {
    const value = input ?? raw;

    if (!value.trim()) {
      setResult({
        ok: false,
        error: "Paste the raw headers of the message you want to analyse.",
      });

      return;
    }

    setResult(parseEmailHeaders(value));
  };

  const loadSample = () => {
    setRaw(SAMPLE_HEADERS);
    setResult(parseEmailHeaders(SAMPLE_HEADERS));
  };

  const reset = () => {
    setRaw("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* ================= INPUT ================= */}
      <Card className="p-6">
        <CardHeader
          icon="terminal"
          title="Submit raw headers"
          subtitle="Parsed locally in your browser — nothing is uploaded"
          level={2}
          actions={
            <Badge tone="safe" size="sm" icon="lock">
              Client-side
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
            placeholder={`Received: from mail.example.com (mail.example.com [203.0.113.10])\nFrom: "Sender" <sender@example.com>\nSubject: …`}
            className="ioc leading-6"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => analyze()} icon="search">
            Analyze headers
          </Button>

          <Button onClick={loadSample} variant="secondary" icon="file">
            Load sample
          </Button>

          {(raw || result) && (
            <Button onClick={reset} variant="ghost" icon="refresh">
              Clear
            </Button>
          )}

          <p className="ml-auto hidden text-[11px] text-ink-faint sm:block">
            In most clients: <em className="not-italic text-ink-soft">Show original</em>{" "}
            or <em className="not-italic text-ink-soft">View source</em>
          </p>
        </div>

        {/* How to obtain headers — genuinely useful, and cheap to include */}
        <details className="group mt-5 rounded-lg border border-line bg-white/[0.02]">
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-xs font-medium text-ink-soft">
            Where do I find the raw headers?
            <Icon
              name="chevron-down"
              className="text-[10px] text-ink-faint transition-transform group-open:rotate-180"
            />
          </summary>

          <dl className="space-y-2.5 border-t border-line px-4 py-4">
            {[
              { client: "Gmail", path: "Open the message → ⋮ → Show original" },
              { client: "Outlook (web)", path: "Open the message → ⋯ → View → View message source" },
              { client: "Apple Mail", path: "View → Message → All Headers" },
              { client: "Thunderbird", path: "View → Message Source (Ctrl+U)" },
            ].map((item) => (
              <div key={item.client} className="flex flex-wrap gap-x-3 text-[11px]">
                <dt className="w-28 shrink-0 font-medium text-ink-soft">
                  {item.client}
                </dt>
                <dd className="text-ink-muted">{item.path}</dd>
              </div>
            ))}
          </dl>
        </details>
      </Card>

      {/* ================= RESULTS ================= */}
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
          {/* ---- Verdict ---- */}
          <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <RiskMeter score={result.score} />

            <Card className="p-5">
              <CardHeader
                icon="brain"
                title="Why this score"
                subtitle={`${result.signals.length} contributing signal${result.signals.length === 1 ? "" : "s"}`}
                level={2}
              />

              {result.signals.length === 0 ? (
                <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-ink-soft">
                  <Icon name="check-circle" className="mt-0.5 shrink-0 text-safe" />
                  No header-level risk signals fired. Headers alone cannot prove
                  a message is safe — content and payload analysis still apply.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {result.signals.map((signal) => (
                    <li key={signal.name}>
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

          {/* ---- Message identity ---- */}
          <Card className="p-5">
            <CardHeader
              icon="fingerprint"
              title="Message identity"
              subtitle={`${result.headerCount} headers parsed`}
              level={2}
            />

            <dl className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <KeyValue label="From" value={result.from ?? "Not present"} mono />
              <KeyValue label="Subject" value={result.subject ?? "Not present"} />
              <KeyValue label="Date" value={result.date ?? "Not present"} mono />
              <KeyValue
                label="Message ID"
                value={result.messageId ?? "Not present"}
                mono
              />
            </dl>
          </Card>

          {/* ---- Authentication ---- */}
          <Card className="p-5">
            <CardHeader
              icon="lock"
              title="Authentication results"
              subtitle="Read from Authentication-Results and Received-SPF"
              level={2}
            />

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                ["spf", "SPF"],
                ["dkim", "DKIM"],
                ["dmarc", "DMARC"],
                ["alignment", "Alignment"],
              ].map(([key, label]) => {
                const entry = result.authentication[key];
                const toneName = AUTH_TONES[entry.result] ?? "neutral";
                const t = resolveTone(toneName);

                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border bg-white/[0.02] p-3",
                      t.border,
                    )}
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

          {/* ---- Routing path ---- */}
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
                description="The pasted headers contained no Received entries, so the path the message took cannot be reconstructed."
                className="py-10"
              />
            ) : (
              <ol className="mt-5 space-y-2.5">
                {result.hops.map((hop) => (
                  <li
                    key={hop.hop}
                    className="rounded-lg border border-line bg-white/[0.02] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-[10px] font-bold text-accent">
                        {hop.hop}
                      </span>

                      <span className="ioc font-medium text-ink">
                        {hop.from ?? "unknown origin"}
                      </span>

                      <Icon name="arrow-right" className="text-[9px] text-ink-faint" />

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

          {/* ---- Indicators ---- */}
          <Card className="p-5">
            <CardHeader
              icon="tag"
              title="Extracted indicators"
              subtitle={`${result.indicators.length} candidate${result.indicators.length === 1 ? "" : "s"} — verdicts require enrichment`}
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
                      verdictTone={VERDICT_TONES[indicator.verdict] ?? "neutral"}
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
              Every verdict reads{" "}
              <strong className="font-semibold text-ink">unknown</strong> because
              this pass is header-only. Assigning a verdict needs DNS, RDAP and
              reputation enrichment, which a browser cannot perform.
            </p>
          </Card>

          {/* ---- All headers ---- */}
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
                      className="align-top transition duration-150 hover:bg-white/[0.02]"
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

      {!result && (
        <Card className="p-6">
          <Eyebrow icon="info">Ready</Eyebrow>

          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Paste headers above, or{" "}
            <button
              type="button"
              onClick={loadSample}
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
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
