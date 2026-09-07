/**
 * Semantic tone tokens.
 *
 * Every coloured surface in the app — badges, meters, stat cards, evidence
 * chips — resolves its colours from this one table. Components take a `tone`
 * name and never a raw colour, so a severity looks identical everywhere it
 * appears and a palette change is a single edit here.
 */

export const TONES = {
  accent: {
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/25",
    ring: "ring-accent/20",
    fill: "bg-accent",
    glow: "shadow-[0_0_24px_-6px_var(--color-accent)]",
  },
  critical: {
    text: "text-critical",
    bg: "bg-critical/10",
    border: "border-critical/25",
    ring: "ring-critical/20",
    fill: "bg-critical",
    glow: "shadow-[0_0_24px_-6px_var(--color-critical)]",
  },
  high: {
    text: "text-high",
    bg: "bg-high/10",
    border: "border-high/25",
    ring: "ring-high/20",
    fill: "bg-high",
    glow: "shadow-[0_0_24px_-6px_var(--color-high)]",
  },
  warn: {
    text: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/25",
    ring: "ring-warn/20",
    fill: "bg-warn",
    glow: "shadow-[0_0_24px_-6px_var(--color-warn)]",
  },
  safe: {
    text: "text-safe",
    bg: "bg-safe/10",
    border: "border-safe/25",
    ring: "ring-safe/20",
    fill: "bg-safe",
    glow: "shadow-[0_0_24px_-6px_var(--color-safe)]",
  },
  info: {
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/25",
    ring: "ring-info/20",
    fill: "bg-info",
    glow: "shadow-[0_0_24px_-6px_var(--color-info)]",
  },
  neutral: {
    text: "text-ink-muted",
    bg: "bg-ink/5",
    border: "border-line",
    ring: "ring-ink/10",
    fill: "bg-ink-faint",
    glow: "",
  },
};

/** Resolve a tone name, falling back to neutral for anything unrecognised. */
export function tone(name) {
  return TONES[name] ?? TONES.neutral;
}

/** Verdict strings used across the indicator registry map onto tones. */
export const VERDICT_TONES = {
  malicious: "critical",
  suspicious: "warn",
  benign: "safe",
  unknown: "neutral",
};

/** Authentication results map onto tones. */
export const AUTH_TONES = {
  pass: "safe",
  fail: "critical",
  softfail: "warn",
  none: "warn",
  warn: "warn",
  neutral: "neutral",
};

/** Evidence classification map onto tones. */
export const EVIDENCE_TONES = {
  observed: "safe",
  derived: "info",
  inferred: "warn",
  unknown: "neutral",
};

/** Service health map onto tones. */
export const STATE_TONES = {
  operational: "safe",
  degraded: "warn",
  outage: "critical",
  maintenance: "info",
};
