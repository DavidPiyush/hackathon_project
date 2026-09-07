import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";
import { Eyebrow } from "@/components/ui/Badge";

const ASSURANCES = [
  { icon: "eye", text: "Every finding traceable to its source" },
  { icon: "scale", text: "Confidence and uncertainty stated" },
  { icon: "lock", text: "Original evidence never mutated" },
];

/** Closing call to action, shared by the landing page and the docs pages. */
export function CtaBand({
  eyebrow = "Get Started",
  title = "Investigate your first email in minutes.",
  description = "Open the console to walk through a live investigation, from ingestion to a defensible report.",
  primaryHref = "/dashboard",
  primaryLabel = "Open the console",
  secondaryHref = "/docs",
  secondaryLabel = "Read the docs",
}) {
  return (
    <Section bordered glow="bottom" size="md" containerSize="md">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
          <Icon name="shield" className="text-xl" />
        </span>

        <Eyebrow className="mt-6 justify-center">{eyebrow}</Eyebrow>

        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-7 text-ink-soft">
          {description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={primaryHref} size="lg" iconEnd="arrow-right">
            {primaryLabel}
          </Button>

          <Button href={secondaryHref} size="lg" variant="secondary" icon="book">
            {secondaryLabel}
          </Button>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {ASSURANCES.map((item) => (
            <li
              key={item.text}
              className="flex items-center gap-2 text-xs text-ink-muted"
            >
              <Icon name={item.icon} className="text-accent" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export default CtaBand;
