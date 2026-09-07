import Link from "next/link";

import { site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { GlowBackdrop } from "@/components/ui/Layout";
import { Eyebrow, StatusDot } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Reassurances shown beside the form, specific to what this product does. */
const ASSURANCES = [
  {
    icon: "lock",
    title: "Passwords are never stored",
    text: "Only a salted scrypt hash. We could not tell you your password if we wanted to.",
  },
  {
    icon: "shield",
    title: "Sessions are server-signed",
    text: "An httpOnly, same-site cookie your browser cannot read from JavaScript.",
  },
  {
    icon: "eye",
    title: "Evidence stays local",
    text: "The header analyzer runs in your browser. Pasted messages are never uploaded.",
  },
];

/**
 * Split layout for the login and signup screens.
 *
 * The left column carries the form; the right explains what signing in gets
 * you and how credentials are handled — which matters more than usual for a
 * security product asking you to trust it with a password.
 */
export function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <GlowBackdrop variant="top" />

      {/* Minimal chrome: back to the site, and the theme switch */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/50">
            <Icon name="shield" className="text-lg" />
          </span>

          <span>
            <span className="block text-base font-semibold leading-tight text-ink">
              {site.name}
            </span>
            <span className="block text-[10px] leading-tight text-ink-faint">
              {site.tagline}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <ThemeToggle compact className="sm:hidden" />

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-ink-muted transition duration-200 hover:border-accent/30 hover:bg-raise-md hover:text-accent"
          >
            <Icon name="arrow-left" className="text-[10px]" />
            <span className="hidden sm:inline">Back to site</span>
          </Link>
        </div>
      </header>

      <main
        id="main"
        className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 lg:px-10"
      >
        <div className="grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* ---------------- Form ---------------- */}
          <div className="mx-auto w-full max-w-md motion-safe:animate-rise">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 text-pretty text-sm leading-6 text-ink-soft">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-7 border-t border-line pt-6 text-center text-xs text-ink-muted">
                {footer}
              </div>
            )}
          </div>

          {/* ---------------- Assurances ---------------- */}
          <aside className="hidden lg:block motion-safe:animate-fade">
            <div className="panel rounded-2xl p-7">
              <p className="flex items-center gap-2 text-xs text-safe">
                <StatusDot tone="safe" />
                Console operational
              </p>

              <h2 className="mt-5 text-lg font-semibold text-ink">
                How your credentials are handled
              </h2>

              <ul className="mt-6 space-y-5">
                {ASSURANCES.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                      <Icon name={item.icon} />
                    </span>

                    <div>
                      <p className="text-sm font-medium text-ink">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-7 flex items-start gap-2 rounded-lg border border-warn/20 bg-warn/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
                <Icon name="info" className="mt-0.5 shrink-0 text-warn" />
                <span>
                  <strong className="font-semibold text-warn">
                    Demo build.
                  </strong>{" "}
                  Accounts live in the server&rsquo;s memory and are cleared
                  when it restarts. Do not reuse a real password here.
                </span>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
