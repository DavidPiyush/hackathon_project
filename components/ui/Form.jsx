import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";

const CONTROL = [
  "w-full rounded-lg border bg-canvas px-4 text-sm text-ink transition duration-200",
  "placeholder:text-ink-faint",
  "focus:border-accent/50 focus:ring-2 focus:ring-accent/15 focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

/**
 * Field wrapper: label, optional hint, the control itself and an error message
 * that is wired to the input with `aria-describedby`.
 *
 * Errors are announced politely rather than shown as colour alone, so the
 * failure is available to assistive tech and to anyone who cannot distinguish
 * the red border.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline gap-1.5 text-xs font-medium text-ink-soft"
      >
        {label}

        {required && (
          <span className="text-critical" aria-hidden="true">
            *
          </span>
        )}

        {required && <span className="sr-only">(required)</span>}
      </label>

      {children({
        id,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[11px] text-ink-faint">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[11px] text-critical"
        >
          <Icon name="warning" className="mt-0.5 shrink-0 text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ error, className, ...props }) {
  return (
    <input
      className={cn(
        CONTROL,
        "h-11",
        error ? "border-critical/50" : "border-line",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ error, className, rows = 6, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        CONTROL,
        "resize-y py-3 leading-6",
        error ? "border-critical/50" : "border-line",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ error, className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          CONTROL,
          "h-11 appearance-none pr-10",
          error ? "border-critical/50" : "border-line",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint"
      />
    </div>
  );
}

/** Search box with a leading icon. Used in the inbox and the IOC registry. */
export function SearchInput({ className, ...props }) {
  return (
    <div className={cn("relative", className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-faint"
      />

      <input
        type="search"
        className={cn(CONTROL, "h-11 border-line pl-10")}
        {...props}
      />
    </div>
  );
}
