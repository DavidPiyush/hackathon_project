/**
 * The risk scale is the backbone of the product: a 0-100 score maps to exactly
 * one severity band, and every badge, meter and border colour derives from it.
 * Keeping the thresholds here means the inbox, analysis view and reports can
 * never disagree about what "high risk" means.
 */

export const RISK_BANDS = [
  { id: "critical", label: "Critical", min: 90, tone: "critical" },
  { id: "high", label: "High Risk", min: 75, tone: "high" },
  { id: "suspicious", label: "Suspicious", min: 40, tone: "warn" },
  { id: "low", label: "Low Risk", min: 20, tone: "info" },
  { id: "safe", label: "Safe", min: 0, tone: "safe" },
];

/** Clamp any incoming number into the 0-100 score range. */
export function clampScore(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Resolve a score to its severity band. */
export function riskBand(score) {
  const value = clampScore(score);

  return RISK_BANDS.find((band) => value >= band.min) ?? RISK_BANDS.at(-1);
}

/** Human-readable severity, e.g. 92 -> "Critical". */
export function riskLabel(score) {
  return riskBand(score).label;
}

/** Semantic tone token, e.g. 92 -> "critical". Feeds Badge / RiskMeter colours. */
export function riskTone(score) {
  return riskBand(score).tone;
}

/**
 * Whether a score warrants analyst action. Used to decide which rows are
 * highlighted in the inbox and which items reach the triage queue.
 */
export function needsReview(score) {
  return clampScore(score) >= 40;
}

/** Group a list of scored records into counts per band. */
export function summarizeRisk(records, getScore = (record) => record.risk) {
  const counts = Object.fromEntries(RISK_BANDS.map((band) => [band.id, 0]));

  for (const record of records) {
    counts[riskBand(getScore(record)).id] += 1;
  }

  return counts;
}
