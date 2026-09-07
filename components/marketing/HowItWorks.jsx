import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import {
  workflow,
  evidenceClasses,
  intelligenceSignals,
} from "@/lib/data/marketing";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading, Divider } from "@/components/ui/Layout";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Badge";

export function HowItWorks() {
  return (
    <Section id="how-it-works" bordered>
      <SectionHeading
        eyebrow="The Investigation Pipeline"
        eyebrowIcon="sitemap"
        title="From a suspicious email to a defensible conclusion."
        description="Six stages, each one adding evidence the next can build on. The original message is preserved at ingestion and never overwritten."
        align="center"
      />

      {/* ---------------- Six-stage pipeline ---------------- */}
      <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {workflow.map((stage, index) => (
          <li key={stage.id} className="relative">
            <Card interactive className="h-full p-6">
              {/* Stage connector arrow, hidden on the last item of each row */}
              {index < workflow.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas text-[9px] text-ink-faint lg:flex"
                >
                  <Icon name="arrow-right" />
                </span>
              )}

              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon name={stage.icon} className="text-lg" />
                </span>

                <span
                  aria-hidden="true"
                  className="font-mono text-3xl font-bold text-watermark transition duration-300 group-hover:text-accent/20"
                >
                  {stage.id}
                </span>
              </div>

              <Eyebrow className="mt-5 text-[10px]">{stage.label}</Eyebrow>

              <h3 className="mt-2 text-lg font-semibold text-ink">
                {stage.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {stage.description}
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-line pt-5">
                {stage.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs text-ink-muted"
                  >
                    <Icon
                      name="check"
                      className="mt-0.5 shrink-0 text-[10px] text-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>

      <Divider />

      {/* ---------------- Evidence classification model ---------------- */}
      <SectionHeading
        eyebrow="Evidence Model"
        eyebrowIcon="scale"
        title="Every finding is labelled with how it was established."
        description="This is the difference between an analysis and a guess. A conclusion the platform cannot support from evidence stays marked unknown rather than being rounded into certainty."
        align="center"
        level={3}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {evidenceClasses.map((item) => {
          const t = resolveTone(item.tone);

          return (
            <Card
              key={item.number}
              interactive
              className={cn("relative overflow-hidden p-6", t.border)}
            >
              {/* Tone stripe along the top edge */}
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-0 h-0.5", t.fill)}
              />

              <div className="flex items-baseline gap-3">
                <span
                  className={cn("font-mono text-2xl font-bold", t.text)}
                >
                  {item.number}
                </span>

                <h4 className="text-base font-semibold text-ink">
                  {item.title}
                </h4>
              </div>

              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {item.text}
              </p>
            </Card>
          );
        })}
      </div>

      <Divider />

      {/* ---------------- Signal families ---------------- */}
      <div className="grid gap-5 md:grid-cols-3">
        {intelligenceSignals.map((signal) => (
          <Card key={signal.label} interactive className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raise text-accent">
                <Icon name={signal.icon} />
              </span>

              <Eyebrow className="text-[10px]">{signal.label}</Eyebrow>
            </div>

            <h4 className="mt-4 text-base font-semibold text-ink">
              {signal.title}
            </h4>

            <p className="mt-2.5 text-sm leading-6 text-ink-soft">
              {signal.text}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default HowItWorks;
