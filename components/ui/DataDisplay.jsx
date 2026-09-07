import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { clampScore, riskLabel, riskTone } from "@/lib/utils/risk";
import { formatNumber } from "@/lib/utils/format";

/**
 * Accessible progress bar. Every bar in the app goes through here so they all
 * expose the same ARIA semantics instead of being decorative divs.
 */
export function Meter({
  value,
  max = 100,
  tone = "accent",
  size = "md",
  label,
  className,
}) {
  const t = resolveTone(tone);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { xs: "h-1", sm: "h-1.5", md: "h-2", lg: "h-2.5" };

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn(
        "w-full overflow-hidden rounded-full bg-raise-md",
        heights[size] ?? heights.md,
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", t.fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * The headline risk readout: score out of 100, derived severity label and a
 * matching meter. Used on the hero panel, the inbox detail and the analysis page.
 */
export function RiskMeter({ score, size = "md", className }) {
  const value = clampScore(score);
  const t = resolveTone(riskTone(value));

  if (size === "sm") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Meter
          value={value}
          tone={riskTone(value)}
          size="sm"
          label={`Risk score ${value} of 100`}
          className="w-16"
        />
        <span className={cn("font-mono text-[11px] font-semibold", t.text)}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        t.border,
        t.bg,
        className,
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
            Overall risk score
          </p>

          <p className="mt-1 font-mono text-3xl font-bold leading-none text-ink">
            {value}
            <span className="text-sm font-normal text-ink-faint">/100</span>
          </p>
        </div>

        <div className="text-right">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", t.text)}>
            {riskLabel(value)}
          </p>

          <p className="mt-1 text-[10px] text-ink-muted">
            {value >= 40 ? "Investigation recommended" : "No action required"}
          </p>
        </div>
      </div>

      <Meter
        value={value}
        tone={riskTone(value)}
        label={`Risk score ${value} of 100`}
        className="mt-4"
      />
    </div>
  );
}

/** Compact metric tile for the dashboard stat rows. */
export function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "accent",
  delta,
  className,
}) {
  const t = resolveTone(tone);
  const deltaTone =
    delta === undefined ? null : delta >= 0 ? "critical" : "safe";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border text-sm",
            t.bg,
            t.border,
            t.text,
          )}
        >
          <Icon name={icon} />
        </span>

        {delta !== undefined && (
          <Badge tone={deltaTone} size="xs">
            <span aria-hidden="true">{delta >= 0 ? "▲" : "▼"}</span>
            {Math.abs(delta)}%
            <span className="sr-only">
              {delta >= 0 ? "increase" : "decrease"} versus last period
            </span>
          </Badge>
        )}
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </p>

      <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-ink">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>

      {detail && <p className="mt-1.5 text-[11px] text-ink-muted">{detail}</p>}
    </Card>
  );
}

/**
 * Seven-day trend chart, hand-drawn as inline SVG.
 *
 * A charting library would be ~50 KB of JavaScript for two polylines, and this
 * renders on the server with no client bundle at all. The series is also
 * exposed as a table for screen readers.
 */
export function TrendChart({ data, className }) {
  const width = 620;
  const height = 180;
  const pad = { top: 12, right: 4, bottom: 24, left: 4 };

  const peak = Math.max(...data.map((d) => d.total));
  const step = (width - pad.left - pad.right) / (data.length - 1);

  const pointAt = (index, value) => {
    const x = pad.left + index * step;
    const usable = height - pad.top - pad.bottom;
    const y = pad.top + usable - (value / peak) * usable;

    return [x, y];
  };

  const line = (key) =>
    data.map((d, i) => pointAt(i, d[key]).join(",")).join(" ");

  const area = `${line("total")} ${width - pad.right},${height - pad.bottom} ${pad.left},${height - pad.bottom}`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full overflow-visible"
        role="img"
        aria-label={`Detections over the last seven days, peaking at ${peak} on ${data.reduce((a, b) => (a.total > b.total ? a : b)).day}`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y =
            pad.top + (height - pad.top - pad.bottom) * ratio;

          return (
            <line
              key={ratio}
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke="var(--color-line)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          );
        })}

        <polygon points={area} fill="url(#trend-fill)" />

        <polyline
          points={line("total")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={line("high")}
          fill="none"
          stroke="var(--color-critical)"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {data.map((d, i) => {
          const [x, y] = pointAt(i, d.total);

          return (
            <g key={d.day}>
              <circle cx={x} cy={y} r="3.5" fill="var(--color-base)" stroke="var(--color-accent)" strokeWidth="2" />

              <text
                x={x}
                y={height - 6}
                textAnchor="middle"
                className="fill-[var(--color-ink-faint)] font-mono text-[10px]"
              >
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-ink-muted">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded bg-accent" />
          Total analysed
        </span>

        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-critical" />
          High risk
        </span>
      </div>
    </div>
  );
}

/** Horizontal distribution list — threat categories, indicator types, etc. */
export function DistributionBar({ data, total, className }) {
  const sum = total ?? data.reduce((acc, d) => acc + d.value, 0);

  return (
    <ul className={cn("space-y-4", className)}>
      {data.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-xs text-ink-soft">{item.label}</span>

            <span className="shrink-0 font-mono text-xs font-semibold text-ink">
              {Math.round((item.value / sum) * 100)}
              <span className="font-normal text-ink-faint">%</span>
            </span>
          </div>

          <Meter
            value={item.value}
            max={sum}
            tone={item.tone}
            size="sm"
            label={`${item.label}: ${item.value} of ${sum}`}
            className="mt-2"
          />
        </li>
      ))}
    </ul>
  );
}

/** Vertical timeline. Used for chain of custody and the pipeline walkthrough. */
export function Timeline({ items, className }) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {items.map((item, index) => (
        <li key={`${item.time}-${item.action}`} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Connector line, stopped before the final node */}
          {index < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[7px] top-4 h-full w-px bg-line"
            />
          )}

          <span
            className={cn(
              "relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
              index === items.length - 1
                ? "border-accent bg-accent/30"
                : "border-line-strong bg-canvas",
            )}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[11px] font-semibold text-accent">
                {item.time}
              </span>

              <span className="text-xs font-medium text-ink">{item.action}</span>

              <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                {item.actor}
              </span>
            </div>

            {item.detail && (
              <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
                {item.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
