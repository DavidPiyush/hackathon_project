import Link from "next/link";

import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Layout";
import { PageShell, Prose } from "@/components/marketing/PageShell";
import { CtaBand } from "@/components/marketing/CtaBand";

export const metadata = {
  title: "Privacy",
  description:
    "What ThreatDetect collects, what it does not, and where your data goes.",
  alternates: { canonical: "/privacy" },
};

/** The honest summary, up front, before the prose. */
const SUMMARY = [
  {
    icon: "ban",
    tone: "safe",
    claim: "No accounts",
    detail: "There is no sign-up, no login and no user record.",
  },
  {
    icon: "ban",
    tone: "safe",
    claim: "No analytics",
    detail: "No tracking scripts, no cookies, no third-party pixels.",
  },
  {
    icon: "ban",
    tone: "safe",
    claim: "No database",
    detail: "This build has no persistence layer of any kind.",
  },
  {
    icon: "lock",
    tone: "info",
    claim: "Local parsing",
    detail: "Pasted headers stay in your browser and are never uploaded.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      eyebrowIcon="lock"
      title="What we collect, and what we do not"
      description="A security tool asking for your suspicious emails owes you a straight answer about where they go. Here it is."
      breadcrumb={[{ name: "Privacy" }]}
      meta={[
        { label: "Effective", value: "2026-09-07" },
        { label: "Applies to", value: "This build" },
        { label: "Contact", value: site.contactEmail },
      ]}
    >
      <Section size="md">
        {/* ---- Summary cards ---- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((item) => (
            <Card key={item.claim} tone={item.tone} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                <Icon name={item.icon} className="text-ink-soft" />
              </span>

              <p className="mt-4 text-sm font-semibold text-ink">
                {item.claim}
              </p>

              <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
                {item.detail}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <Prose>
            <h2 id="scope">Scope of this notice</h2>

            <p>
              This notice describes the{" "}
              <strong>current build of this application</strong>: a front-end
              platform with no deployed backend, no user accounts and no
              persistence layer. It is deliberately narrow rather than a
              template for a service that does not exist yet.
            </p>

            <h2 id="analyzer">Email headers you paste</h2>

            <p>
              The <Link href="/dashboard/analysis">header analyzer</Link> parses
              entirely in your browser using JavaScript that ships with the
              page. Pasted content is held in browser memory for the lifetime of
              the tab and is <em>never transmitted anywhere</em> — not to us,
              not to a third party.
            </p>

            <p>
              Clearing the field, navigating away or closing the tab discards
              it. Nothing is written to local storage, session storage or a
              cookie.
            </p>

            <p>
              This matters beyond privacy: a suspicious email is evidence, and
              forwarding it through additional systems creates copies you then
              have to account for.
            </p>

            <h2 id="contact-form">The contact form</h2>

            <p>
              Submitting the <Link href="/#contact">contact form</Link> sends the
              fields you filled in to the server, where they are validated. In
              this build the submission is{" "}
              <strong>logged and then discarded</strong> — there is no mail
              backend, no queue and no database, so nothing is stored or
              emailed to anyone.
            </p>

            <p>
              The success message on the form says exactly this rather than
              implying a human received it.
            </p>

            <p>
              The form also rejects credential-shaped content — private keys,
              anything matching a password or API-key pattern — before it is
              processed. Please still never send secrets.
            </p>

            <h2 id="cookies">Cookies and tracking</h2>

            <p>
              None. This application sets no cookies, loads no analytics or
              advertising scripts, and embeds no third-party tracking. There is
              no consent banner because there is nothing to consent to.
            </p>

            <h2 id="third-parties">Third parties</h2>

            <p>
              Fonts are <strong>self-hosted</strong>. The application uses
              Next.js font optimisation, which downloads the typefaces at build
              time and serves them from the same origin as the page — so your
              browser makes no request to Google Fonts, and no third party sees
              your IP address as a result of visiting.
            </p>

            <p>
              If this application is deployed to a hosting provider, that
              provider will process request logs (including IP addresses) as
              part of serving the site. That is outside this application&rsquo;s
              control and governed by the host&rsquo;s own terms.
            </p>

            <h2 id="rights">Your rights</h2>

            <p>
              Because no personal data is retained, there is nothing for us to
              retrieve, correct or erase on request. If a future deployment adds
              accounts or storage, this notice will be updated{" "}
              <em>before</em> that change ships, not after.
            </p>

            <h2 id="changes">Changes</h2>

            <p>
              The effective date at the top of this page changes whenever this
              notice does. Material changes to what is collected will be stated
              plainly rather than absorbed into a general revision.
            </p>

            <h2 id="contact">Contact</h2>

            <p>
              Questions about this notice:{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
              Security issues belong on the{" "}
              <Link href="/security">security page</Link> instead.
            </p>
          </Prose>

          {/* ---- Sidebar ---- */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <CardHeader
                icon="checklist"
                title="At a glance"
                subtitle="What leaves your browser"
                level={2}
              />

              <ul className="mt-5 space-y-2.5">
                {[
                  { text: "Pasted email headers", leaves: false },
                  { text: "Contact form fields", leaves: true },
                  { text: "Analytics events", leaves: false },
                  { text: "Cookies", leaves: false },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2"
                  >
                    <span className="text-[11px] text-ink-soft">
                      {item.text}
                    </span>

                    <Badge
                      tone={item.leaves ? "warn" : "safe"}
                      size="xs"
                      uppercase
                    >
                      {item.leaves ? "Sent" : "Never"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>

            <Card tone="info" className="p-5">
              <CardHeader
                icon="info"
                iconTone="info"
                title="Why this is short"
                level={2}
              />

              <p className="mt-5 text-[11px] leading-5 text-ink-soft">
                A privacy notice should describe what actually happens. This
                build collects almost nothing, so claiming otherwise — or
                padding the page with clauses about data flows that do not
                exist — would make it less useful, not more thorough.
              </p>
            </Card>
          </aside>
        </div>
      </Section>

      <CtaBand
        eyebrow="Related"
        title="How we handle hostile evidence."
        description="The security page covers evidence isolation, our disclosure process and what is in scope."
        primaryHref="/security"
        primaryLabel="Security"
        secondaryHref="/docs"
        secondaryLabel="Documentation"
      />
    </PageShell>
  );
}
