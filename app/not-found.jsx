import { dashboardNav, marketingNav } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container, GlowBackdrop } from "@/components/ui/Layout";
import { Eyebrow } from "@/components/ui/Badge";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const metadata = {
  title: "Page not found",
};

/**
 * 404 page.
 *
 * Rather than a dead end, it offers the real destinations — which is also a
 * hedge against exactly the class of broken link this rebuild fixed.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="relative overflow-hidden">
        <GlowBackdrop variant="center" />

        <Container size="md" className="relative py-24 lg:py-32">
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-warn/25 bg-warn/10 text-warn">
              <Icon name="search" className="text-2xl" />
            </span>

            <Eyebrow tone="warn" className="mt-7 justify-center">
              Error 404
            </Eyebrow>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              We could not find that page.
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-7 text-ink-soft">
              The address may be mistyped, or the page may have moved. Everything
              the platform offers is linked below.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/" size="lg" icon="home">
                Back to home
              </Button>

              <Button href="/dashboard" size="lg" variant="secondary" icon="gauge">
                Open the console
              </Button>
            </div>
          </div>

          {/* Full site map */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-ink">The site</h2>

              <ul className="mt-4 space-y-1">
                {marketingNav.map((item) => (
                  <li key={item.name}>
                    <Button
                      href={item.href}
                      variant="ghost"
                      size="sm"
                      icon={item.icon}
                      className="w-full justify-start"
                    >
                      {item.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold text-ink">The console</h2>

              <ul className="mt-4 space-y-1">
                {dashboardNav.map((item) => (
                  <li key={item.name}>
                    <Button
                      href={item.href}
                      variant="ghost"
                      size="sm"
                      icon={item.icon}
                      className="w-full justify-start"
                    >
                      {item.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
