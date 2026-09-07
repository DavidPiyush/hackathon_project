import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { heroAnalysis, heroHighlights } from "@/lib/data/marketing";
import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Container, GlowBackdrop } from "@/components/ui/Layout";
import { RiskMeter } from "@/components/ui/DataDisplay";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden scroll-mt-20">
      <GlowBackdrop variant="top" />

      {/* Width comes from Container, not a second hardcoded max-width. */}
      <Container className="relative py-20 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* ---------------- Left: the pitch ---------------- */}
          <div className="motion-safe:animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.06] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              <StatusDot tone="safe" />
              {site.tagline}
            </span>

            <h1 className="mt-7 text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Detect.
              <span className="block text-gradient-accent">Investigate.</span>
              Defend.
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-ink-soft sm:text-lg">
              <strong className="font-semibold text-ink">{site.name}</strong> is
              an AI-assisted email threat detection and forensic intelligence
              platform. It analyses suspicious messages, identifies malicious
              indicators, and helps security teams investigate threats{" "}
              <em className="text-accent not-italic">faster</em> — without
              hiding the reasoning behind a single opaque score.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard/analysis" size="lg" iconEnd="arrow-right">
                Analyze an Email
              </Button>

              <Button href="/#features" size="lg" variant="secondary" icon="puzzle">
                Explore the Platform
              </Button>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {heroHighlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-ink-muted"
                >
                  <Icon name="check-circle" className="text-safe" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- Right: live analysis panel ---------------- */}
          <div className="relative motion-safe:animate-fade">
            {/* Ambient glow behind the panel */}
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-3xl bg-accent/10 blur-3xl"
            />

            <div className="panel relative overflow-hidden rounded-2xl p-5 shadow-2xl">
              {/* Scanning sweep, purely decorative */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent/10 to-transparent motion-safe:animate-sweep"
              />

              {/* Panel chrome */}
              <div className="relative flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <Icon name="shield" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Threat Analysis
                    </p>
                    <p className="font-mono text-[10px] text-ink-faint">
                      EM-2041 · detection engine v4.2
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-2 text-[11px] text-safe">
                  <StatusDot tone="safe" />
                  Active
                </span>
              </div>

              {/* Subject under analysis */}
              <div className="relative mt-4 rounded-xl border border-line bg-canvas p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-raise-md text-ink-muted">
                    <Icon name="envelope" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {heroAnalysis.subject}
                    </p>
                    <p className="ioc truncate text-ink-faint">
                      {heroAnalysis.sender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Check results */}
              <ul className="relative mt-4 space-y-2.5">
                {heroAnalysis.checks.map((check) => {
                  const t = resolveTone(check.tone);

                  return (
                    <li
                      key={check.title}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raise p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon
                          name={check.icon}
                          className={cn("shrink-0", t.text)}
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-ink">
                            {check.title}
                          </p>
                          <p className="truncate text-[10px] text-ink-muted">
                            {check.detail}
                          </p>
                        </div>
                      </div>

                      <Badge tone={check.tone} size="xs" uppercase>
                        {check.state}
                      </Badge>
                    </li>
                  );
                })}
              </ul>

              <RiskMeter score={heroAnalysis.score} className="relative mt-5" />
            </div>

            {/* Floating stat card, tucked under the panel */}
            <div className="panel absolute -bottom-7 -left-5 hidden rounded-xl p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-safe/10 text-safe">
                  <Icon name="checklist" />
                </span>

                <div>
                  <p className="font-mono text-sm font-bold text-ink">1,284</p>
                  <p className="text-[10px] text-ink-faint">
                    Messages analysed this month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Hero;
