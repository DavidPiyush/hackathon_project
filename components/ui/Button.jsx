import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";

const VARIANTS = {
  /** The single most important action on a screen. */
  primary:
    "bg-accent text-on-accent font-semibold hover:bg-accent-bright shadow-[0_0_0_0_transparent] hover:shadow-[0_8px_28px_-10px_var(--color-accent)]",
  /** Secondary actions that sit beside a primary. */
  secondary:
    "border border-line bg-raise text-ink hover:border-accent/35 hover:bg-accent/[0.06] hover:text-accent",
  /** Low-emphasis actions inside dense UI. */
  ghost: "text-ink-muted hover:bg-raise-md hover:text-accent",
  /** Tinted variant used for the header call to action. */
  tinted:
    "border border-accent/25 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent/40",
  /** Destructive actions. Always pair with a confirmation. */
  danger:
    "border border-critical/25 bg-critical/10 text-critical hover:bg-critical/20",
};

const SIZES = {
  sm: "h-9 gap-1.5 px-3 text-xs rounded-lg",
  md: "h-11 gap-2 px-4 text-sm rounded-lg",
  lg: "h-13 gap-2.5 px-6 text-sm rounded-xl",
};

/**
 * The one button in the system.
 *
 * Renders a `next/link` when given `href` and a `<button>` otherwise, so
 * internal navigation is always client-side and prefetched — no more raw
 * anchors triggering full page reloads. External links get the safe
 * `target`/`rel` pair automatically.
 */
export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  external = false,
  loading = false,
  disabled = false,
  className,
  type = "button",
  ...props
}) {
  const classes = cn(
    "group inline-flex shrink-0 items-center justify-center whitespace-nowrap transition duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    SIZES[size] ?? SIZES.md,
    VARIANTS[variant] ?? VARIANTS.primary,
    className,
  );

  const content = (
    <>
      {loading ? (
        <Icon name="refresh" className="animate-spin" />
      ) : (
        icon && <Icon name={icon} />
      )}

      {children}

      {iconEnd && (
        <Icon
          name={iconEnd}
          className={cn(
            "transition-transform duration-200",
            iconEnd === "arrow-right" && "group-hover:translate-x-0.5",
          )}
        />
      )}
    </>
  );

  if (href && !disabled) {
    // Anchors cannot be disabled, so a disabled Button always renders a button.
    const isExternal = external || /^(https?:|mailto:|tel:)/.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          {...(external || href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * Icon-only button.
 *
 * `label` is required and becomes the accessible name plus the tooltip. The
 * previous dashboard shipped 34 unlabelled icon buttons; making the label a
 * required prop is what stops that from recurring.
 */
export function IconButton({
  icon,
  label,
  href,
  variant = "ghost",
  size = "md",
  className,
  badge = false,
  ...props
}) {
  const sizes = {
    sm: "h-8 w-8 rounded-lg text-xs",
    md: "h-10 w-10 rounded-lg text-sm",
  };

  const classes = cn(
    "relative inline-flex shrink-0 items-center justify-center transition duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    sizes[size] ?? sizes.md,
    VARIANTS[variant] ?? VARIANTS.ghost,
    className,
  );

  const content = (
    <>
      <Icon name={icon} />

      {badge && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-canvas" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label} title={label} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      title={label}
      {...props}
    >
      {content}
    </button>
  );
}

export default Button;
