/** Formatting helpers shared by the dashboard widgets. */

/** 1284 -> "1,284" */
export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

/** 0.732 -> "73%" */
export function formatPercent(value, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** "Security Operations" -> "SO", for avatar fallbacks. */
export function initials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Trim a long technical string for display without losing both ends. */
export function truncateMiddle(value, max = 28) {
  if (!value || value.length <= max) {
    return value ?? "";
  }

  const half = Math.floor((max - 1) / 2);

  return `${value.slice(0, half)}…${value.slice(-half)}`;
}
