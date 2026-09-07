import { features, platformPrinciples } from "@/lib/data/marketing";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading, Divider } from "@/components/ui/Layout";
import { Card, FeatureCard } from "@/components/ui/Card";

export function Features() {
  return (
    <Section id="features" bordered glow="center" grid>
      <SectionHeading
        eyebrow="Platform Capabilities"
        eyebrowIcon="puzzle"
        title="Eight capabilities, one investigation."
        description="Each stage contributes evidence to the same case file. Nothing is discarded, and every finding stays traceable back to the message it came from."
        align="center"
      />

      {/* The eight capability cards */}
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.number} {...feature} />
        ))}
      </div>

      <Divider />

      {/* Cross-cutting principles */}
      <SectionHeading
        eyebrow="Design Principles"
        eyebrowIcon="scale"
        title="Why the platform is built this way."
        description="Detection alone is not an investigation. These four commitments shape every screen in the product."
        align="center"
        level={3}
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {platformPrinciples.map((principle) => (
          <Card
            key={principle.label}
            interactive
            className="flex flex-col gap-4 p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/40">
              <Icon name={principle.icon} className="text-lg" />
            </span>

            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                {principle.label}
              </p>

              <h4 className="mt-2 text-base font-semibold text-ink">
                {principle.title}
              </h4>

              <p className="mt-2.5 text-sm leading-6 text-ink-soft">
                {principle.text}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export default Features;
