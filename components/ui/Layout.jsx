import { cn } from "@/lib/utils/cn";

import { Eyebrow } from "@/components/ui/Badge";

/** Consistent horizontal gutters and max width for every page region. */
export function Container({ children, size = "lg", className, ...props }) {
  const sizes = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-6 lg:px-8",
        sizes[size] ?? sizes.lg,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * The layered background used behind hero and CTA regions: two soft colour
 * blooms over a faint blueprint grid. Purely decorative and pointer-inert.
 */
export function GlowBackdrop({ variant = "top", grid = true, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "top" && (
        <>
          <div className="absolute left-1/2 top-[-18rem] h-[32rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl motion-safe:animate-drift" />
          <div className="absolute right-[-10rem] top-1/3 h-[25rem] w-[25rem] rounded-full bg-info/10 blur-3xl" />
        </>
      )}

      {variant === "center" && (
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-3xl" />
      )}

      {variant === "bottom" && (
        <div className="absolute bottom-[-14rem] left-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl" />
      )}

      {grid && (
        <div className="absolute inset-0 bg-blueprint opacity-[0.035]" />
      )}
    </div>
  );
}

/**
 * A landing-page section.
 *
 * Renders a real `<section>` with the `id` that the nav anchors target. The
 * previous version rendered a `<main>` per section, which put four `<main>`
 * landmarks on one page.
 */
export function Section({
  children,
  id,
  glow,
  grid = false,
  bordered = false,
  size = "lg",
  containerSize = "lg",
  className,
  containerClassName,
  ...props
}) {
  const padding = {
    sm: "py-14",
    md: "py-16 lg:py-20",
    lg: "py-20 lg:py-28",
  };

  return (
    <section
      id={id}
      // Anchored sections need the sticky header cleared when jumped to.
      className={cn(
        "relative scroll-mt-20",
        bordered && "border-t border-line",
        padding[size] ?? padding.lg,
        className,
      )}
      {...props}
    >
      {(glow || grid) && <GlowBackdrop variant={glow ?? "center"} grid={grid} />}

      <Container size={containerSize} className={cn("relative", containerClassName)}>
        {children}
      </Container>
    </section>
  );
}

/**
 * Standard section heading block: eyebrow, title, description.
 *
 * `level` keeps the document outline correct — landing sections use `h2`, and
 * only the hero uses `h1`.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "left",
  level = 2,
  className,
  children,
}) {
  const Heading = `h${level}`;

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}

      <Heading
        className={cn(
          "mt-4 text-balance font-semibold tracking-tight text-ink",
          level === 2 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </Heading>

      {description && (
        <p className="mt-4 text-pretty text-base leading-7 text-ink-soft">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}

/** Hairline divider that fades at both ends. */
export function Divider({ className }) {
  return <div aria-hidden="true" className={cn("rule-fade my-12", className)} />;
}

export default Section;
