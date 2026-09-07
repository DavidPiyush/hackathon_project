import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";

/**
 * Loading and progress affordances.
 *
 * Anything that takes long enough to notice gets one of these. The rule the
 * app follows: instant local work (starring, marking read) updates
 * optimistically with no spinner, while work that genuinely takes time
 * (generating a report, enriching an indicator) shows real progress.
 */

const SPINNER_SIZES = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-2",
};

/**
 * Spinner drawn as a bordered circle rather than an icon, so it stays
 * perfectly round at any size and needs no glyph to load.
 */
export function Spinner({ size = "sm", label, className }) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent align-[-0.125em]",
        SPINNER_SIZES[size] ?? SPINNER_SIZES.sm,
        className,
      )}
    />
  );
}

/** Full-width indeterminate bar for work with no measurable progress. */
export function IndeterminateBar({ tone = "accent", className }) {
  const t = resolveTone(tone);

  return (
    <div
      role="progressbar"
      aria-label="Working"
      className={cn(
        "h-1 w-full overflow-hidden rounded-full bg-raise-md",
        className,
      )}
    >
      <div
        className={cn("h-full w-full origin-left rounded-full motion-safe:animate-progress", t.fill)}
      />
    </div>
  );
}

/**
 * Multi-step progress readout, used while a report is generated so the wait
 * shows what is actually happening rather than an opaque spinner.
 */
export function StepProgress({ steps, activeIndex, className }) {
  return (
    <ol className={cn("space-y-2.5", className)}>
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;

        return (
          <li key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] transition duration-300",
                done && "border-safe/30 bg-safe/10 text-safe",
                active && "border-accent/40 bg-accent/10 text-accent",
                !done && !active && "border-line text-ink-faint",
              )}
            >
              {done ? (
                <Icon name="check" />
              ) : active ? (
                <Spinner size="xs" />
              ) : (
                index + 1
              )}
            </span>

            <span
              className={cn(
                "text-xs transition duration-300",
                done && "text-ink-muted",
                active && "font-medium text-ink",
                !done && !active && "text-ink-faint",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Shimmering placeholder block. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

/** Skeleton shaped like a list row, for suspense fallbacks. */
export function SkeletonRows({ rows = 4, className }) {
  return (
    <div className={cn("divide-y divide-line", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>

          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}

      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}

/**
 * Inline confirmation prompt for destructive actions.
 *
 * Preferred over `window.confirm`, which cannot be styled, blocks the thread,
 * and is suppressed entirely in some embedded contexts.
 */
export function ConfirmInline({
  question,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  pending = false,
  className,
}) {
  return (
    <div
      role="alertdialog"
      aria-label={question}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-critical/25 bg-critical/[0.06] px-3 py-2.5",
        className,
      )}
    >
      <Icon name="warning" className="shrink-0 text-critical" />

      <p className="min-w-0 flex-1 text-[11px] text-ink-soft">{question}</p>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-ink-muted transition duration-200 hover:bg-raise-md hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-critical px-2.5 py-1.5 text-[11px] font-semibold text-white transition duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {pending && <Spinner size="xs" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
