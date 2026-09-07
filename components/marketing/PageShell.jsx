import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Container, GlowBackdrop } from "@/components/ui/Layout";
import { Eyebrow } from "@/components/ui/Badge";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * Shell for standalone content pages (docs, security, privacy).
 *
 * Provides the site chrome, one `<main>` landmark, one `<h1>` and a breadcrumb,
 * so each content page only has to supply its body.
 */
export function PageShell({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  breadcrumb = [],
  meta,
  children,
}) {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ---- Page head ---- */}
        <section className="relative overflow-hidden border-b border-line">
          <GlowBackdrop variant="top" />

          <Container className="relative py-16 lg:py-20">
            {breadcrumb.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                  <li>
                    <Link
                      href="/"
                      className="transition hover:text-accent"
                    >
                      Home
                    </Link>
                  </li>

                  {breadcrumb.map((crumb, index) => (
                    <li key={crumb.name} className="flex items-center gap-2">
                      <Icon
                        name="chevron-right"
                        className="text-[8px] text-ink-faint"
                      />

                      {crumb.href && index < breadcrumb.length - 1 ? (
                        <Link
                          href={crumb.href}
                          className="transition hover:text-accent"
                        >
                          {crumb.name}
                        </Link>
                      ) : (
                        <span aria-current="page" className="text-ink-soft">
                          {crumb.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}

            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {title}
            </h1>

            {description && (
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-ink-soft">
                {description}
              </p>
            )}

            {meta && meta.length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                {meta.map((item) => (
                  <div key={item.label}>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-mono text-xs font-semibold text-ink-soft">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Container>
        </section>

        {children}
      </main>

      <SiteFooter />
    </>
  );
}

/**
 * Readable long-form column.
 *
 * Styles descendants rather than requiring a class on every element, so the
 * page bodies stay plain semantic HTML.
 */
export function Prose({ children, className }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-sm leading-7 text-ink-soft",
        // Headings
        "[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink",
        "[&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
        // Blocks
        "[&_p]:mt-4",
        "[&_ul]:mt-4 [&_ul]:space-y-2.5 [&_ol]:mt-4 [&_ol]:space-y-2.5",
        "[&_li]:relative [&_li]:pl-5",
        // Custom bullet in the accent colour
        "[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.6em] [&_ul>li]:before:h-1.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-accent/60",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:pl-1 [&_ol>li]:marker:font-mono [&_ol>li]:marker:text-xs [&_ol>li]:marker:text-accent",
        // Inline
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_em]:not-italic [&_em]:text-accent",
        "[&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-2 [&_a:hover]:decoration-accent",
        "[&_code]:rounded [&_code]:border [&_code]:border-line [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em] [&_code]:text-ink",
        // Preformatted blocks scroll rather than widening the page
        "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-line [&_pre]:bg-abyss [&_pre]:p-4",
        "[&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[11px] [&_pre_code]:leading-6 [&_pre_code]:text-ink-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default PageShell;
