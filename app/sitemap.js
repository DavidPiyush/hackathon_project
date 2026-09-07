import { site } from "@/lib/data/site";

/**
 * Sitemap.
 *
 * Only public, indexable pages. The console is disallowed in `robots.js`, so
 * listing its routes here would hand crawlers contradictory instructions —
 * advertising URLs it has just been told not to fetch.
 */
export default function sitemap() {
  const now = new Date();

  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/docs", priority: 0.8, changeFrequency: "monthly" },
    { path: "/docs/api", priority: 0.7, changeFrequency: "monthly" },
    { path: "/security", priority: 0.6, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: new URL(route.path, site.url).toString(),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
