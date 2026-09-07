import { site } from "@/lib/data/site";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The console is a live demo with no data worth indexing, and its
        // pages would dilute search results for the product pages.
        disallow: ["/dashboard/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
  };
}
