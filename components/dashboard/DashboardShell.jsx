"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import {
  site,
  dashboardNav,
  dashboardUtilityNav,
} from "@/lib/data/site";
import { emails } from "@/lib/data/emails";
import { riskTone } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { IconButton, Button } from "@/components/ui/Button";
import { Badge, StatusDot } from "@/components/ui/Badge";
import { Popover } from "@/components/ui/Popover";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Header height, shared by the sticky sidebar offset so the two stay aligned. */
const HEADER_H = "h-16";
const HEADER_PX = 64;

/**
 * Dashboard chrome: top header, sidebar, mobile drawer.
 *
 * The mobile drawer is why this is one client component rather than two — the
 * hamburger lives in the header and the drawer is the sidebar, so a single
 * owner of the open state is simpler than lifting it through context. Page
 * content is passed straight through as `children`, so pages themselves stay
 * server components.
 */
export function DashboardShell({ children }) {
  const pathname = usePathname();

  /**
   * The drawer records which route it was opened on, so navigating away closes
   * it as a derived value. Resetting it from an effect on `pathname` would
   * work, but it costs a second render pass on every navigation — and React
   * warns against synchronous setState inside an effect for exactly that
   * reason.
   */
  const [drawer, setDrawer] = useState({ open: false, path: pathname });

  const drawerOpen = drawer.open && drawer.path === pathname;

  const setDrawerOpen = (open) => setDrawer({ open, path: pathname });

  /** Lock background scroll while the drawer covers the screen. */
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        // A functional update keeps the recorded path and avoids depending on
        // the `setDrawerOpen` closure, which changes on every render.
        setDrawer((previousDrawer) => ({ ...previousDrawer, open: false }));
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  /**
   * A nav item is active on an exact match, or when the current path is nested
   * beneath it. `/dashboard` is excluded from the prefix rule, otherwise it
   * would stay highlighted on every child page.
   */
  const isActive = (href) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const alerts = emails
    .filter((email) => email.risk >= 75)
    .slice(0, 4);

  return (
    <div className="min-h-dvh bg-canvas">
      {/* ================= TOP HEADER ================= */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-xl",
          HEADER_H,
        )}
      >
        <div className="flex h-full items-center gap-3 px-4 lg:px-6">
          <IconButton
            icon="bars"
            label="Open navigation"
            variant="secondary"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="lg:hidden"
          />

          {/* Brand */}
          <Link href="/dashboard" className="group flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition duration-200 group-hover:border-accent/50">
              <Icon name="shield" />
            </span>

            <span className="hidden sm:block">
              <span className="block text-sm font-semibold leading-tight text-ink">
                {site.name}
              </span>
              <span className="block text-[10px] leading-tight text-ink-faint">
                Security Intelligence Platform
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {/* Environment status */}
            <span className="hidden items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-ink-muted md:flex">
              <StatusDot tone="safe" />
              Operational
            </span>

            {/* Theme: segmented on wide screens, single toggle on narrow */}
            <ThemeToggle className="hidden lg:inline-flex" />
            <ThemeToggle compact className="lg:hidden" />

            {/* Quick jump to triage */}
            <IconButton
              icon="search"
              label="Search the inbox"
              href="/dashboard/inbox"
            />

            {/* Notifications */}
            <Popover
              trigger={(props) => (
                <IconButton
                  icon="bell"
                  label={`Notifications (${alerts.length} high risk)`}
                  badge={alerts.length > 0}
                  {...props}
                />
              )}
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-xs font-semibold text-ink">
                  High-risk detections
                </p>
                <p className="mt-0.5 text-[10px] text-ink-faint">
                  Messages scoring 75 or above
                </p>
              </div>

              <ul className="max-h-72 divide-y divide-line overflow-y-auto">
                {alerts.map((alert) => (
                  <li key={alert.id}>
                    <Link
                      href="/dashboard/inbox"
                      className="block px-4 py-3 transition duration-200 hover:bg-elevated"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-medium text-ink">
                          {alert.subject}
                        </p>

                        <Badge tone={riskTone(alert.risk)} size="xs">
                          {alert.risk}
                        </Badge>
                      </div>

                      <p className="ioc mt-1 truncate text-ink-faint">
                        {alert.senderEmail}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line p-3">
                <Button
                  href="/dashboard/inbox"
                  variant="secondary"
                  size="sm"
                  iconEnd="arrow-right"
                  className="w-full"
                >
                  Open the inbox
                </Button>
              </div>
            </Popover>

            {/* Account */}
            <Popover
              trigger={(props) => (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2 transition duration-200 hover:bg-raise-md"
                  {...props}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 font-mono text-[10px] font-bold text-accent">
                    AR
                  </span>

                  <span className="hidden text-xs text-ink-soft sm:block">
                    Analyst
                  </span>

                  <Icon
                    name="chevron-down"
                    className="hidden text-[9px] text-ink-faint sm:block"
                  />
                </button>
              )}
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-xs font-semibold text-ink">A. Rahman</p>
                <p className="mt-0.5 text-[10px] text-ink-faint">
                  Tier 2 Analyst · Read/write
                </p>
              </div>

              <nav className="p-2" aria-label="Account">
                {dashboardUtilityNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-ink-muted transition duration-200 hover:bg-raise-md hover:text-accent"
                  >
                    <Icon name={item.icon} />
                    {item.name}
                  </Link>
                ))}

                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-ink-muted transition duration-200 hover:bg-raise-md hover:text-accent"
                >
                  <Icon name="arrow-left" />
                  Back to site
                </Link>
              </nav>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ================= SIDEBAR (desktop) ================= */}
        <aside
          className="sticky hidden w-64 shrink-0 border-r border-line bg-canvas lg:block"
          style={{
            top: `${HEADER_PX}px`,
            height: `calc(100dvh - ${HEADER_PX}px)`,
          }}
        >
          <SidebarBody isActive={isActive} />
        </aside>

        {/* ================= SIDEBAR (mobile drawer) ================= */}
        {drawerOpen && (
          <div className="fixed inset-0 z-60 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-scrim backdrop-blur-sm motion-safe:animate-fade"
            />

            <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line-strong bg-canvas shadow-2xl motion-safe:animate-rise">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <Icon name="shield" className="text-xs" />
                  </span>

                  <span className="text-sm font-semibold text-ink">
                    {site.name}
                  </span>
                </span>

                <IconButton
                  icon="close"
                  label="Close navigation"
                  onClick={() => setDrawerOpen(false)}
                />
              </div>

              <SidebarBody isActive={isActive} />
            </div>
          </div>
        )}

        {/* ================= PAGE ================= */}
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Sidebar contents, shared by the desktop rail and the mobile drawer. */
function SidebarBody({ isActive }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4">
      <p className="mb-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        Workspace
      </p>

      <nav aria-label="Dashboard" className="space-y-1">
        {dashboardNav.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.description}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-200",
                active
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-ink-muted hover:bg-raise-md hover:text-ink",
              )}
            >
              {/* Active indicator rail */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent" />
              )}

              <Icon
                name={item.icon}
                className={cn(
                  "w-4 shrink-0 transition duration-200",
                  active ? "text-accent" : "text-ink-faint group-hover:text-accent",
                )}
              />

              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-line pt-4">
        {dashboardUtilityNav.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition duration-200",
                active
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-ink-muted hover:bg-raise-md hover:text-accent",
              )}
            >
              <Icon name={item.icon} className="w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}

        {/* Workspace assurance */}
        <div className="mt-4 rounded-lg border border-accent/10 bg-accent/[0.03] p-3">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            <Icon name="shield" className="text-accent" />
            Secure workspace
          </p>

          <p className="mt-2 text-[10px] leading-5 text-ink-muted">
            Evidence-first investigation environment. Every action is written to
            an immutable audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardShell;
