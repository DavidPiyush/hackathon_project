import { requireUser } from "@/lib/auth/dal";

import { helpTopics, faqs } from "@/lib/data/dashboard";
import { site } from "@/lib/data/site";

import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Interactive";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "Help & Documentation",
  description:
    "Guides, keyboard shortcuts and answers to the questions analysts ask most.",
};

const SHORTCUTS = [
  { keys: ["Esc"], action: "Close the open dialog or menu" },
  {
    keys: ["Tab"],
    action: "Move through controls; focus stays inside a dialog",
  },
  {
    keys: ["←", "→"],
    action: "Move between inbox category tabs",
  },
  {
    keys: ["Home", "End"],
    action: "Jump to the first or last category tab",
  },
  {
    keys: ["Enter", "Space"],
    action: "Activate the focused control",
  },
];

const INCIDENT_STEPS = [
  "Contain the account before investigating — rotate credentials and revoke sessions.",
  "Preserve the original message; do not forward it as an attachment-stripped copy.",
  "Record the message ID so the routing path can be reconstructed later.",
  "Then open a case and attach the evidence.",
];

const PLATFORM_INFO = [
  { label: "Product", getValue: (platform) => platform.name },
  { label: "Detection engine", value: "v4.2" },
  { label: "Evidence schema", value: "2026.09" },
  {
    label: "Support",
    getValue: (platform) => platform.contactEmail,
  },
];

export default async function HelpPage() {
  await requireUser("/dashboard/help");

  return (
    <>
      <PageHeader
        eyebrow="Support"
        eyebrowIcon="help"
        title="Help & Documentation"
        description="How to read what the platform tells you — including the places where a confident-looking signal proves less than it appears to."
        actions={
          <>
            {" "}
            <Button href="/docs" icon="book">
              Full documentation{" "}
            </Button>
            ```
            <Button href="/#contact" variant="secondary" icon="envelope">
              Contact the team
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <section aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="text-lg font-semibold text-ink">
            Start here
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {helpTopics.map((topic) => (
              <Card key={topic.title} href={topic.href} className="p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/40">
                  <Icon name={topic.icon} className="text-lg" />
                </span>

                <h3 className="mt-5 text-sm font-semibold text-ink">
                  {topic.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-ink-muted">
                  {topic.detail}
                </p>

                <span className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-accent">
                  Read more
                  <Icon
                    name="arrow-right"
                    className="text-[9px] transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-lg font-semibold text-ink">
              Frequently asked
            </h2>

            <Accordion items={faqs} className="mt-4" />
          </section>

          <div className="space-y-5">
            <Card className="p-6">
              <CardHeader
                icon="key"
                title="Keyboard shortcuts"
                subtitle="Supported throughout the console"
                level={2}
              />

              <dl className="mt-5 space-y-3">
                {SHORTCUTS.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt className="flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded border border-line bg-raise-md px-1.5 py-1 font-mono text-[10px] text-ink-soft"
                        >
                          {key}
                        </kbd>
                      ))}
                    </dt>

                    <dd className="text-right text-[11px] leading-5 text-ink-muted">
                      {shortcut.action}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card tone="critical" className="p-6">
              <CardHeader
                icon="warning"
                iconTone="critical"
                title="Active incident"
                subtitle="What to do first"
                level={2}
              />

              <ol className="mt-5 space-y-3">
                {INCIDENT_STEPS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-critical/25 bg-critical/10 font-mono text-[10px] font-bold text-critical">
                      {index + 1}
                    </span>

                    <p className="text-xs leading-5 text-ink-soft">{step}</p>
                  </li>
                ))}
              </ol>

              <Button
                href="/#contact"
                variant="secondary"
                size="sm"
                icon="headset"
                className="mt-5 w-full"
              >
                Reach an analyst
              </Button>
            </Card>

            <Card className="p-6">
              <CardHeader
                icon="info"
                title="Platform"
                subtitle="Build information"
                level={2}
              />

              <dl className="mt-5 space-y-2.5">
                {PLATFORM_INFO.map((item) => {
                  const value = item.getValue?.(site) ?? item.value;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-raise px-3 py-2"
                    >
                      <dt className="text-[11px] text-ink-faint">
                        {item.label}
                      </dt>

                      <dd className="ioc truncate text-ink-soft">{value}</dd>
                    </div>
                  );
                })}
              </dl>

              <p className="mt-4 flex items-center gap-2">
                <Badge tone="safe" size="xs" dot>
                  All services operational
                </Badge>
              </p>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
