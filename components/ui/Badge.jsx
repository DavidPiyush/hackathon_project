import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";
import { riskLabel, riskTone, clampScore } from "@/lib/utils/risk";

const SIZES = {
  xs: "h-5 gap-1 px-2 text-[10px]",
  sm: "h-6 gap-1.5 px-2.5 text-[11px]",
  md: "h-7 gap-2 px-3 text-xs",
};

/**
 * Status pill. Colour comes from the shared tone table, never from the caller.
 */
export function Badge({
  children,
  tone = "neutral",
  size = "sm",
  icon,
  dot = false,
  uppercase = false,
  className,
  ...props
}) {
  const t = resolveTone(tone);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        SIZES[size] ?? SIZES.sm,
        t.bg,
        t.border,
        t.text,
        uppercase && "font-semibold uppercase tracking-wider",
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", t.fill)} />
      )}

      {icon && <Icon name={icon} className="shrink-0" />}

      {children}
    </span>
  );
}

/**
 * Badge whose label and colour are both derived from a numeric risk score, so
 * a score can never be shown with a mismatched severity label.
 */
export function RiskBadge({ score, size = "sm", showScore = false, className }) {
  const value = clampScore(score);

  return (
    <Badge
      tone={riskTone(value)}
      size={size}
      dot
      uppercase
      className={className}
    >
      {riskLabel(value)}
      {showScore && (
        <span className="font-mono opacity-70">{value}</span>
      )}
    </Badge>
  );
}

/**
 * Small uppercase kicker above a heading. Used to label every major section.
 */
export function Eyebrow({ children, tone = "accent", icon, className }) {
  const t = resolveTone(tone);

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]",
        t.text,
        className,
      )}
    >
      {icon && <Icon name={icon} />}
      {children}
    </p>
  );
}

/**
 * Live status indicator with a pulsing halo — used for "Operational" chips.
 */
export function StatusDot({ tone = "safe", className }) {
  const t = resolveTone(tone);

  return (
    <span className={cn("relative flex h-2 w-2 shrink-0", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping-slow",
          t.fill,
        )}
      />
      <span className={cn("relative inline-flex h-2 w-2 rounded-full", t.fill)} />
    </span>
  );
}

export default Badge;
