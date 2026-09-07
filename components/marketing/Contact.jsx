import { contactChannels } from "@/lib/data/marketing";
import { site, socialLinks } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Layout";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { ContactForm } from "@/components/marketing/ContactForm";

export function Contact() {
  return (
    <Section id="contact" bordered glow="top" grid>
      <SectionHeading
        eyebrow="Contact"
        eyebrowIcon="headset"
        title="Talk to the security team."
        description="Questions about email threat detection, forensic analysis or the platform itself — we read every message."
        align="center"
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        {/* ---------------- Channels ---------------- */}
        <div className="space-y-4">
          {contactChannels.map((channel) => (
            <Card key={channel.label} interactive className="p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon name={channel.icon} />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                    {channel.label}
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-ink">
                    {channel.value}
                  </p>

                  <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
                    {channel.detail}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* Escalation note */}
          <Card tone="critical" className="p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-critical/25 bg-critical/10 text-critical">
                <Icon name="warning" />
              </span>

              <div>
                <p className="text-sm font-semibold text-ink">
                  Active incident?
                </p>

                <p className="mt-1.5 text-[11px] leading-5 text-ink-soft">
                  If credentials may already be compromised, rotate them first
                  and contain the account. Then send us the message ID so we can
                  reconstruct the timeline.
                </p>
              </div>
            </div>
          </Card>

          {/* Social */}
          <div className="flex items-center gap-3 pt-2">
            <Eyebrow tone="neutral" className="tracking-[0.16em]">
              Elsewhere
            </Eyebrow>

            <div className="flex items-center gap-1">
              {socialLinks.map((link) => (
                <IconButton
                  key={link.name}
                  icon={link.icon}
                  label={link.name}
                  href={link.href}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---------------- Form ---------------- */}
        <Card className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-line pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <Icon name="send" />
            </span>

            <div>
              <h3 className="text-base font-semibold text-ink">
                Send a message
              </h3>
              <p className="text-[11px] text-ink-faint">
                Reaches {site.contactEmail}
              </p>
            </div>
          </div>

          <ContactForm />
        </Card>
      </div>
    </Section>
  );
}

export default Contact;
