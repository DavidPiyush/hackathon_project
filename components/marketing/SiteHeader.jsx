"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { marketingNav, site } from "@/lib/data/site";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Layout";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Section ids observed for the active-link underline. */
const SECTION_IDS = marketingNav
  .map((item) => item.href.split("#")[1])
  .filter(Boolean);

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  /** Deepen the header background once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Highlight the nav item for whichever section is in view. An
   * IntersectionObserver is far cheaper than recomputing offsets on scroll.
   */
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean,
    );

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /** Close the mobile sheet whenever the viewport grows past the breakpoint. */
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const query = window.matchMedia("(min-width: 768px)");
    const close = () => setMenuOpen(false);

    query.addEventListener("change", close);

    return () => query.removeEventListener("change", close);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition duration-300",
        scrolled
          ? "border-line bg-canvas/90 backdrop-blur-xl"
          : "border-transparent bg-canvas/60 backdrop-blur",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        {/* Brand */}
        <Link
          href="/#home"
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/50 group-hover:bg-accent/15">
            <Icon name="shield" className="text-lg" />
          </span>

          <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight text-ink">
              {site.name}
            </span>

            <span className="hidden text-[10px] leading-tight text-ink-faint sm:block">
              {site.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => {
            const id = item.href.split("#")[1];
            const active = id === activeSection;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition duration-200",
                  active
                    ? "text-accent"
                    : "text-ink-muted hover:bg-raise-md hover:text-ink",
                )}
              >
                <Icon name={item.icon} className="text-[11px]" />

                {item.name}

                {active && (
                  <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <ThemeToggle />

          <span className="hidden items-center gap-2 rounded-lg border border-line bg-raise px-3 py-2 text-xs text-ink-muted lg:flex">
            <StatusDot tone="safe" />
            Operational
          </span>

          <Button href="/login" variant="ghost" size="sm">
            Sign in
          </Button>

          <Button href="/signup" variant="tinted" size="sm" iconEnd="arrow-right">
            Get started
          </Button>
        </div>

        {/* Mobile: theme switch stays visible outside the sheet */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact />

          <IconButton
            icon={menuOpen ? "close" : "bars"}
            label={menuOpen ? "Close navigation" : "Open navigation"}
            variant="secondary"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          />
        </div>
      </Container>

      {/* Mobile sheet */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          className="border-t border-line bg-canvas/95 backdrop-blur-xl md:hidden motion-safe:animate-fade"
        >
          <Container className="flex flex-col gap-1 py-4">
            {marketingNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-ink-muted transition duration-200 hover:bg-raise-md hover:text-accent"
              >
                <Icon name={item.icon} />
                {item.name}
              </Link>
            ))}

            <Button
              href="/login"
              variant="secondary"
              size="md"
              onClick={closeMenu}
              className="mt-3 w-full"
            >
              Sign in
            </Button>

            <Button
              href="/signup"
              variant="tinted"
              size="md"
              iconEnd="arrow-right"
              onClick={closeMenu}
              className="mt-2 w-full"
            >
              Get started
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}

export default SiteHeader;
