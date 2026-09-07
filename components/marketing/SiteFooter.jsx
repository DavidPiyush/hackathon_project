import Link from "next/link";

import { site, footerNav, socialLinks } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Layout";
import { StatusDot } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-line bg-abyss">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* ---------------- Brand ---------------- */}
          <div className="lg:col-span-2">
            <Link href="/#home" className="group inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/50">
                <Icon name="shield" />
              </span>

              <span>
                <span className="block text-base font-semibold text-ink">
                  {site.name}
                </span>
                <span className="block text-[10px] text-ink-faint">
                  {site.tagline}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-ink-soft">
              {site.description}
            </p>

            <p className="mt-6 flex items-center gap-2 text-xs text-safe">
              <StatusDot tone="safe" />
              All systems operational
            </p>
          </div>

          {/* ---------------- Link groups ---------------- */}
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-ink">{group.title}</h2>

              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted underline-offset-4 transition duration-200 hover:text-accent hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---------------- Positioning strip ---------------- */}
        <div className="mt-12 flex flex-col gap-4 rounded-xl border border-line bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon name="lock" />
            </span>

            <div>
              <p className="text-xs font-semibold text-ink">
                Evidence-first analysis
              </p>
              <p className="text-[11px] text-ink-faint">
                Built for security investigation workflows
              </p>
            </div>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            AI · DFIR · Threat Intelligence
          </p>
        </div>

        {/* ---------------- Legal ---------------- */}
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>

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

            <Link
              href="/docs"
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 transition duration-200 hover:bg-white/5 hover:text-accent"
            >
              Docs
              <Icon name="external" className="text-[9px]" />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default SiteFooter;
