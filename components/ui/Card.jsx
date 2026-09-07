import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";

/**
 * The surface primitive. Everything boxed in this app is a Card, so panel
 * borders, radii and hover behaviour stay identical across marketing pages and
 * the dashboard.
 *
 * Pass `href` to make the whole card a single navigable target — which is
 * better for both pointer and keyboard users than nesting a link inside it.
 */
export function Card({
  children,
  href,
  as: Tag = "div",
  interactive = false,
  padded = true,
  tone,
  className,
  ...props
}) {
  const t = tone ? resolveTone(tone) : null;
  const isLink = Boolean(href);
  const hoverable = interactive || isLink;

  const classes = cn(
    "relative rounded-xl border border-line bg-surface/70",
    padded && "p-5",
    hoverable &&
      "group transition duration-200 hover:border-accent/30 hover:bg-elevated/80",
    t && [t.border, t.bg],
    className,
  );

  if (isLink) {
    return (
      <Link href={href} className={cn(classes, "block")} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Card header with an optional tinted icon tile, title, subtitle and a slot for
 * actions on the right.
 */
export function CardHeader({
  icon,
  iconTone = "accent",
  title,
  subtitle,
  actions,
  level = 3,
  className,
}) {
  const t = resolveTone(iconTone);
  const Heading = `h${level}`;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
              t.bg,
              t.border,
              t.text,
            )}
          >
            <Icon name={icon} />
          </span>
        )}

        <div className="min-w-0">
          <Heading className="truncate text-sm font-semibold text-ink">
            {title}
          </Heading>

          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-ink-muted">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Feature card used across the marketing sections: a large ordinal, a tinted
 * icon, a title, prose and a checklist. Hover lifts the border and reveals a
 * faint accent wash.
 */
export function FeatureCard({
  number,
  category,
  icon,
  title,
  description,
  points = [],
  className,
}) {
  return (
    <Card interactive className={cn("overflow-hidden p-6", className)}>
      {/* Oversized ordinal, sunk into the corner as a watermark */}
      {number && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 right-3 select-none font-mono text-6xl font-bold text-ink/[0.04] transition duration-300 group-hover:text-accent/[0.07]"
        >
          {number}
        </span>
      )}

      <div className="relative">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/40 group-hover:bg-accent/15">
          <Icon name={icon} className="text-lg" />
        </span>

        {category && (
          <p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {category}
          </p>
        )}

        <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-ink-soft">{description}</p>

        {points.length > 0 && (
          <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2.5 text-xs text-ink-muted"
              >
                <Icon
                  name="check"
                  className="mt-0.5 shrink-0 text-[10px] text-accent"
                />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/** Label / value pair. The workhorse of every evidence panel. */
export function KeyValue({ label, value, mono = false, tone, className }) {
  const t = tone ? resolveTone(tone) : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-white/[0.02] px-3 py-2.5",
        className,
      )}
    >
      <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </dt>

      <dd
        className={cn(
          "mt-1 text-xs text-ink-soft",
          mono && "ioc",
          t && t.text,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/** Placeholder shown whenever a list, table or search has no results. */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn("px-6 py-16 text-center", className)}>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-ink-faint">
        <Icon name={icon} className="text-lg" />
      </span>

      <p className="mt-4 text-sm font-medium text-ink-soft">{title}</p>

      {description && (
        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-ink-muted">
          {description}
        </p>
      )}

      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export default Card;
