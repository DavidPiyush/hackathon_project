import Link from "next/link";

import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Layout";
import { PageShell, Prose } from "@/components/marketing/PageShell";
import { CtaBand } from "@/components/marketing/CtaBand";

export const metadata = {
  title: "Security",
  description:
    "How ThreatDetect handles hostile evidence, what it stores, and how to report a vulnerability.",
  alternates: { canonical: "/security" },
};

const CONTROLS = [
  {
    icon: "lock",
    title: "Evidence isolation",
    detail:
      "Submitted messages are treated as hostile input. Attachments are never opened, remote content is never fetched, and rendering strips scripts and external references.",
  },
  {
    icon: "eye",
    title: "Client-side parsing",
    detail:
      "The header analyzer runs entirely in the browser. A message pasted there is never transmitted, so an analyst can triage without introducing the message to another system.",
  },
  {
    icon: "key",
    title: "Least privilege",
    detail:
      "Roles are workspace-scoped, and API tokens inherit the permissions of the analyst who issued them. No token can read beyond its holder's access.",
  },
  {
    icon: "checklist",
    title: "Immutable audit trail",
    detail:
      "Every analyst action against evidence is appended to a tamper-evident log. Finalised reports are content-addressed and superseded rather than edited.",
  },
];

export default function SecurityPage() {
  return (
    <PageShell
      eyebrow="Security"
      eyebrowIcon="shield"
      title="How we handle hostile evidence"
      description="A tool that analyses phishing is itself a target. This page states what the platform does with the messages you give it, and how to report a problem you find in it."
      breadcrumb={[{ name: "Security" }]}
      meta={[
        { label: "Contact", value: "security@threatdetect.com" },
        { label: "Response target", value: "72 hours" },
        { label: "Updated", value: "2026-09-07" },
      ]}
    >
      <Section size="md">
        {/* ---- Controls ---- */}
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTROLS.map((control) => (
            <Card key={control.title} interactive className="p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                <Icon name={control.icon} className="text-lg" />
              </span>

              <h2 className="mt-5 text-base font-semibold text-ink">
                {control.title}
              </h2>

              <p className="mt-2.5 text-sm leading-6 text-ink-soft">
                {control.detail}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <Prose>
            <h2 id="disclosure">Reporting a vulnerability</h2>

            <p>
              If you have found a security issue in this platform, we want to
              hear about it. Email{" "}
              <a href="mailto:security@threatdetect.com">
                security@threatdetect.com
              </a>{" "}
              with enough detail to reproduce the problem.
            </p>

            <p>
              We will acknowledge your report within{" "}
              <strong>72 hours</strong>, keep you updated while we investigate,
              and credit you when a fix ships — unless you would rather stay
              anonymous.
            </p>

            <h3>What helps</h3>

            <ul>
              <li>A clear description of the issue and its impact</li>
              <li>Steps to reproduce, or a proof of concept</li>
              <li>The affected URL, endpoint or component</li>
              <li>Your assessment of severity, and why</li>
            </ul>

            <h3>What we ask</h3>

            <ul>
              <li>
                Give us reasonable time to fix the issue before disclosing it
                publicly
              </li>
              <li>
                Do not access, modify or exfiltrate data that is not yours
              </li>
              <li>
                Do not run denial-of-service tests or automated scans against
                production
              </li>
              <li>
                Stop at the point where you have demonstrated the issue — there
                is no need to go further
              </li>
            </ul>

            <h2 id="in-scope">Scope</h2>

            <p>
              This build is a front-end application with no deployed backend and
              no user accounts, which narrows the surface considerably. Issues
              we are particularly interested in:
            </p>

            <ul>
              <li>
                Cross-site scripting reachable through pasted header content
              </li>
              <li>
                Any path by which pasted evidence leaves the browser
                unexpectedly
              </li>
              <li>
                Content-injection or clickjacking against the console interface
              </li>
              <li>
                Dependency vulnerabilities with a demonstrable path to
                exploitation here
              </li>
            </ul>

            <p>
              Out of scope: missing headers with no demonstrated impact,
              theoretical findings from automated scanners, and reports about
              the absence of features this build does not claim to have (such as
              authentication).
            </p>

            <h2 id="data">What the platform stores</h2>

            <p>
              In this build, <strong>nothing</strong>. There is no database, no
              analytics and no session storage. The header analyzer holds your
              pasted content in browser memory until you clear it or close the
              tab. The contact form validates and logs a submission
              server-side but does not persist or forward it.
            </p>

            <p>
              See the <Link href="/privacy">privacy policy</Link> for the full
              account.
            </p>
          </Prose>

          {/* ---- Sidebar ---- */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <CardHeader
                icon="headset"
                title="Security contact"
                subtitle="Monitored continuously"
                level={2}
              />

              <a
                href="mailto:security@threatdetect.com"
                className="ioc mt-5 block rounded-lg border border-accent/25 bg-accent/10 px-3 py-2.5 text-center font-medium text-accent transition duration-200 hover:bg-accent/20"
              >
                security@threatdetect.com
              </a>

              <p className="mt-4 text-[11px] leading-5 text-ink-muted">
                For non-security enquiries, use{" "}
                <Link
                  href="/#contact"
                  className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  the contact form
                </Link>{" "}
                or{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                >
                  {site.contactEmail}
                </a>
                .
              </p>
            </Card>

            <Card tone="warn" className="p-5">
              <CardHeader
                icon="warning"
                iconTone="warn"
                title="Never send us secrets"
                subtitle="Including in a bug report"
                level={2}
              />

              <p className="mt-5 text-[11px] leading-5 text-ink-soft">
                Do not include passwords, private keys, session tokens or API
                keys in a report or in the contact form. Describe the
                credential&rsquo;s role instead. The contact form rejects
                credential-shaped content automatically.
              </p>
            </Card>

            <Card className="p-5">
              <CardHeader
                icon="scale"
                title="Our commitments"
                level={2}
              />

              <ul className="mt-5 space-y-2.5">
                {[
                  "Acknowledge within 72 hours",
                  "No legal action for good-faith research",
                  "Credit for reporters who want it",
                  "Public note when a fix ships",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[11px] leading-5 text-ink-muted"
                  >
                    <Icon
                      name="check"
                      className="mt-0.5 shrink-0 text-[10px] text-safe"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-4">
                <Badge tone="safe" size="xs" dot>
                  Good-faith research welcome
                </Badge>
              </p>
            </Card>
          </aside>
        </div>
      </Section>

      <CtaBand
        eyebrow="Transparency"
        title="Read what we do with your data."
        description="Short version: in this build, we do not keep it. The long version is on the privacy page."
        primaryHref="/privacy"
        primaryLabel="Privacy policy"
        secondaryHref="/docs"
        secondaryLabel="Documentation"
      />
    </PageShell>
  );
}
