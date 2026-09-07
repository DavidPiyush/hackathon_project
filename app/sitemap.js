import { site, dashboardNav, dashboardUtilityNav } from "@/lib/data/site";

/**
 * Sitemap.
 *
 * Built from the same navigation tables the interface uses, so a new page
 * cannot be added to the nav and forgotten here.
 */
export default function sitemap() {
  const now = new Date();

  const staticRoutes = ["/", "/docs", "/docs/api", "/security", "/privacy"];

  const consoleRoutes = [...dashboardNav, ...dashboardUtilityNav].map(
    (item) => item.href,
  );

  return [...staticRoutes, ...consoleRoutes].map((route) => ({
    url: new URL(route, site.url).toString(),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/dashboard") ? 0.6 : 0.8,
  }));
}
