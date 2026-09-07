import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { describe, expect, it } from "vitest";

import {
  marketingNav,
  dashboardNav,
  dashboardUtilityNav,
  footerNav,
  socialLinks,
} from "@/lib/data/site";
import { helpTopics } from "@/lib/data/dashboard";
import { icons } from "@/components/ui/Icon";

/**
 * Route and link integrity.
 *
 * The original codebase shipped with 21 broken links: the app directory was
 * `app/Dashboard` while every nav item pointed at `/dashboard`, and nine more
 * targets had no page at all. Those were invisible to the build, the linter and
 * the type checker.
 *
 * These tests walk the real `app/` tree and assert that every internal link in
 * the app resolves to a page that exists. Adding a nav item without its page
 * now fails the suite.
 */

const APP_DIR = join(process.cwd(), "app");
const COMPONENTS_DIR = join(process.cwd(), "components");

/** Every route the App Router will actually serve, derived from the filesystem. */
function collectRoutes(dir = APP_DIR, segments = []) {
  const routes = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      // Route groups `(name)` and private folders `_name` do not add segments.
      if (entry.startsWith("_")) {
        continue;
      }

      const nested = entry.startsWith("(")
        ? segments
        : [...segments, entry];

      routes.push(...collectRoutes(full, nested));
    } else if (/^page\.(js|jsx|ts|tsx)$/.test(entry)) {
      routes.push(`/${segments.join("/")}`.replace(/\/+$/, "") || "/");
    }
  }

  return routes;
}

/** Recursively list source files under a directory. */
function sourceFiles(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      files.push(...sourceFiles(full));
    } else if (/\.(js|jsx)$/.test(entry)) {
      files.push(full);
    }
  }

  return files;
}

const ROUTES = collectRoutes();

/** Strip a hash fragment to get the underlying path. */
const pathOf = (href) => href.split("#")[0] || "/";

/** A link is internal if it is a site-relative path. */
const isInternal = (href) =>
  href.startsWith("/") && !href.startsWith("//");

describe("app router routes", () => {
  it("serves the pages the product needs", () => {
    expect(ROUTES).toEqual(
      expect.arrayContaining([
        "/",
        "/dashboard",
        "/dashboard/inbox",
        "/dashboard/analysis",
        "/dashboard/investigations",
        "/dashboard/threat-intelligence",
        "/dashboard/geoip",
        "/dashboard/reports",
        "/dashboard/settings",
        "/dashboard/help",
        "/docs",
        "/docs/api",
        "/security",
        "/privacy",
        // Auth screens live in an (auth) route group, which adds no segment.
        "/login",
        "/signup",
      ]),
    );
  });

  it("does not leak the route group name into a URL", () => {
    for (const route of ROUTES) {
      expect(route).not.toContain("(");
    }
  });

  it("uses only lowercase route segments", () => {
    // `app/Dashboard` produced `/Dashboard`, which silently 404'd every
    // lowercase link pointing at it. Routes are case-sensitive.
    for (const route of ROUTES) {
      expect(route).toBe(route.toLowerCase());
    }
  });
});

describe("navigation tables resolve to real routes", () => {
  const tables = [
    ["marketingNav", marketingNav],
    ["dashboardNav", dashboardNav],
    ["dashboardUtilityNav", dashboardUtilityNav],
    ["helpTopics", helpTopics],
  ];

  for (const [name, items] of tables) {
    it(`${name} points only at pages that exist`, () => {
      for (const item of items) {
        expect(isInternal(item.href), `${name}: ${item.href} is not internal`).toBe(
          true,
        );

        expect(
          ROUTES,
          `${name}: "${item.href}" has no page in app/`,
        ).toContain(pathOf(item.href));
      }
    });
  }

  it("footerNav points only at pages that exist", () => {
    for (const group of footerNav) {
      for (const link of group.links) {
        expect(
          ROUTES,
          `footerNav "${group.title}" → "${link.href}" has no page in app/`,
        ).toContain(pathOf(link.href));
      }
    }
  });

  it("social links are absolute or mailto, never internal paths", () => {
    for (const link of socialLinks) {
      expect(link.href).toMatch(/^(https?:\/\/|mailto:)/);
    }
  });
});

describe("hardcoded links in source resolve to real routes", () => {
  /**
   * Catches links written directly into JSX rather than sourced from the nav
   * tables — which is how most of the original broken links got in.
   */
  const files = [...sourceFiles(APP_DIR), ...sourceFiles(COMPONENTS_DIR)];

  it("every internal href in app/ and components/ has a page", () => {
    const broken = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");

      // Matches href="/…" in JSX attributes.
      for (const match of source.matchAll(/href="(\/[^"]*)"/g)) {
        const href = match[1];
        const path = pathOf(href);

        // Anchor-only links (href="/#contact") resolve to the home page.
        if (!ROUTES.includes(path)) {
          broken.push(`${relative(process.cwd(), file).split(sep).join("/")}: ${href}`);
        }
      }
    }

    expect(broken, `broken internal links:\n${broken.join("\n")}`).toEqual([]);
  });

  it("no source file links to the old capitalised /Dashboard path", () => {
    const offenders = files.filter((file) =>
      /["'`]\/Dashboard/.test(readFileSync(file, "utf8")),
    );

    expect(offenders).toEqual([]);
  });
});

describe("in-page anchors have matching section ids", () => {
  it("every marketing nav anchor targets a section that exists", () => {
    const componentSource = sourceFiles(COMPONENTS_DIR)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    const anchors = marketingNav
      .map((item) => item.href.split("#")[1])
      .filter(Boolean);

    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      // Either `id="home"` on an element, or passed as Section's `id` prop.
      const hasId =
        componentSource.includes(`id="${anchor}"`) ||
        componentSource.includes(`id="${anchor}"`);

      expect(hasId, `no element renders id="${anchor}"`).toBe(true);
    }
  });
});

describe("icon references resolve", () => {
  /**
   * Data modules name icons as strings so they stay free of UI imports. That
   * indirection means a typo would silently render nothing, so it is checked.
   */
  const named = [
    ...marketingNav,
    ...dashboardNav,
    ...dashboardUtilityNav,
    ...helpTopics,
    ...socialLinks,
  ];

  it("every icon name used in navigation data is registered", () => {
    for (const item of named) {
      expect(
        icons,
        `icon "${item.icon}" is not in the registry`,
      ).toHaveProperty(item.icon);
    }
  });

  it("the registry has no undefined entries", () => {
    for (const [name, glyph] of Object.entries(icons)) {
      expect(glyph, `icon "${name}" resolved to undefined`).toBeTruthy();
    }
  });
});

describe("route protection", () => {
  const proxy = readFileSync(join(process.cwd(), "proxy.js"), "utf8");

  /**
   * The proxy is an optimistic gate; the DAL is authoritative. Both must be
   * present, because either one alone leaves a hole the Next.js auth guidance
   * warns about.
   */
  it("guards the console in the proxy", () => {
    expect(proxy).toContain("/dashboard");
    expect(proxy).toMatch(/redirect/);
    // It must read the cookie only — no data access on every request.
    expect(proxy).toContain("decryptSession");
  });

  it("uses the Next 16 proxy convention, not the deprecated middleware name", () => {
    expect(proxy).toMatch(/export (async )?function proxy/);
    expect(proxy).not.toMatch(/export (async )?function middleware/);
  });

  it("has no middleware.js left behind", () => {
    // Both files present would mean two conflicting gates.
    expect(existsSync(join(process.cwd(), "middleware.js"))).toBe(false);
    expect(existsSync(join(process.cwd(), "middleware.ts"))).toBe(false);
  });

  it("bounces signed-in users away from the auth screens", () => {
    expect(proxy).toContain("AUTH_ROUTES");
  });

  it("checks the session in every console page, not only the layout", () => {
    // A layout check is not sufficient: layouts do not re-render on
    // navigation and do not stop nested segments from rendering.
    const pages = sourceFiles(join(APP_DIR, "dashboard")).filter((file) =>
      /page\.jsx?$/.test(file),
    );

    expect(pages.length).toBeGreaterThan(0);

    for (const file of pages) {
      const source = readFileSync(file, "utf8");

      expect(
        source,
        `${relative(process.cwd(), file)} does not call requireUser()`,
      ).toContain("requireUser(");
    }
  });

  it("passes a real path to requireUser, not a mangled one", () => {
    const pages = sourceFiles(join(APP_DIR, "dashboard")).filter((file) =>
      /page\.jsx?$/.test(file),
    );

    for (const file of pages) {
      const source = readFileSync(file, "utf8");

      for (const match of source.matchAll(/requireUser\("([^"]*)"\)/g)) {
        expect(match[1], relative(process.cwd(), file)).toMatch(
          /^\/dashboard/,
        );
      }
    }
  });

  it("keeps the console and auth screens out of the sitemap", () => {
    const sitemap = readFileSync(join(APP_DIR, "sitemap.js"), "utf8");

    expect(sitemap).not.toContain("/dashboard");
    expect(sitemap).not.toContain("/login");
    expect(sitemap).not.toContain("/signup");
  });
});
