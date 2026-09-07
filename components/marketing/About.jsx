import {
  capabilities,
  technologyStack,
  team,
  principles,
} from "@/lib/data/marketing";
import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading, Divider } from "@/components/ui/Layout";
import { Card } from "@/components/ui/Card";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function About() {
  return (
    <Section id="about" bordered glow="bottom">
      <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        {/* ---------------- Narrative ---------------- */}
        <div>
          <SectionHeading
            eyebrow="About the Platform"
            eyebrowIcon="info"
            title="Built for analysts who have to justify the answer."
            description="Most email security tools return a verdict. An investigation needs more than that — it needs the evidence, the reasoning, the confidence level and an honest account of what remains unknown."
          />

          <p className="mt-6 max-w-2xl text-sm leading-7 text-ink-soft">
            {site.name} was built around a single conviction:{" "}
            <strong className="font-semibold text-ink">
              a security decision is only as good as the evidence behind it
            </strong>
            . The platform starts from the original message, reconstructs the
            technical facts, enriches them with infrastructure intelligence, and
            presents the result in a form another analyst can independently
            follow and challenge.
          </p>

          {/* Guiding principles */}
          <ul className="mt-8 flex flex-wrap gap-2">
            {principles.map((principle) => (
              <li key={principle}>
                <Badge tone="accent" size="md" icon="check">
                  {principle}
                </Badge>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/docs" variant="secondary" icon="book">
              Read the documentation
            </Button>

            <Button href="/#contact" variant="ghost" iconEnd="arrow-right">
              Talk to the team
            </Button>
          </div>
        </div>

        {/* ---------------- Technology stack ---------------- */}
        <Card className="p-6">
          <Eyebrow icon="layers">Technology</Eyebrow>

          <h3 className="mt-3 text-lg font-semibold text-ink">
            What the platform runs on
          </h3>

          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Chosen for transparency and reproducibility rather than novelty —
            every layer can be inspected and its output explained.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {technologyStack.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-3 transition duration-200 hover:border-accent/25"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon name={item.icon} className="text-sm" />
                </span>

                <div className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                    {item.label}
                  </dt>
                  <dd className="truncate text-sm font-medium text-ink">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Divider />

      {/* ---------------- Core capabilities ---------------- */}
      <SectionHeading
        eyebrow="Core Capabilities"
        eyebrowIcon="bolt"
        title="Four disciplines, working on the same case."
        align="center"
        level={3}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((item) => (
          <Card key={item.number} interactive className="p-6">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                <Icon name={item.icon} className="text-lg" />
              </span>

              <span
                aria-hidden="true"
                className="font-mono text-2xl font-bold text-ink/[0.06]"
              >
                {item.number}
              </span>
            </div>

            <h4 className="mt-5 text-base font-semibold text-ink">
              {item.title}
            </h4>

            <p className="mt-2.5 text-sm leading-6 text-ink-soft">
              {item.description}
            </p>
          </Card>
        ))}
      </div>

      <Divider />

      {/* ---------------- Team ---------------- */}
      <SectionHeading
        eyebrow="The Team"
        eyebrowIcon="user"
        title="Five disciplines behind the build."
        description="Described by responsibility rather than by name — the split shows how the platform is put together."
        align="center"
        level={3}
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <li key={member.id}>
            <Card interactive className="h-full p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 font-mono text-xs font-bold text-accent">
                  {member.id}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {member.title}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    {member.role}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-ink-soft">
                {member.description}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default About;
