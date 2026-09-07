/**
 * Site-wide configuration.
 *
 * Every link in the product resolves from this file. That is deliberate: the
 * previous iteration hardcoded hrefs in a dozen components and drifted out of
 * sync with the real routes, so `__tests__/routes.test.js` now walks these
 * tables and fails the build if any of them points at a page that
 * does not exist.
 */

export const site = {
  name: "ThreatDetect",
  tagline: "AI-Powered Email Security",
  description:
    "An AI-assisted email threat detection and forensic intelligence platform for analyzing suspicious emails, infrastructure, authentication signals and threat indicators.",
  url: "https://threatdetect.example.com",
  contactEmail: "contact@threatdetect.com",
  github: "https://github.com/DavidPiyush",
  linkedin: "https://www.linkedin.com/",
};

/** Landing-page sections. `href` doubles as the section's DOM id. */
export const marketingNav = [
  { name: "Home", href: "/#home", icon: "home" },
  { name: "Features", href: "/#features", icon: "puzzle" },
  { name: "How It Works", href: "/#how-it-works", icon: "shield" },
  { name: "About", href: "/#about", icon: "info" },
  { name: "Contact", href: "/#contact", icon: "envelope" },
];

/** Primary dashboard navigation. */
export const dashboardNav = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: "gauge",
    description: "Platform health and threat activity at a glance",
  },
  {
    name: "Email Inbox",
    href: "/dashboard/inbox",
    icon: "inbox",
    description: "Triage incoming messages by risk",
  },
  {
    name: "Email Analysis",
    href: "/dashboard/analysis",
    icon: "search",
    description: "Full forensic breakdown of a single message",
  },
  {
    name: "Investigations",
    href: "/dashboard/investigations",
    icon: "folder",
    description: "Open cases and their current state",
  },
  {
    name: "Threat Intelligence",
    href: "/dashboard/threat-intelligence",
    icon: "network",
    description: "Indicator registry and infrastructure context",
  },
  {
    name: "GeoIP Intelligence",
    href: "/dashboard/geoip",
    icon: "map",
    description: "Network and location context for observed origins",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: "file",
    description: "Defensible, audit-ready investigation output",
  },
];

/** Secondary dashboard navigation, pinned to the bottom of the sidebar. */
export const dashboardUtilityNav = [
  { name: "Settings", href: "/dashboard/settings", icon: "gear" },
  { name: "Help & Documentation", href: "/dashboard/help", icon: "help" },
];

/** Footer link groups. */
export const footerNav = [
  {
    title: "Platform",
    links: [
      { name: "Overview", href: "/dashboard" },
      { name: "Email Analysis", href: "/dashboard/analysis" },
      { name: "Threat Intelligence", href: "/dashboard/threat-intelligence" },
      { name: "Investigation Reports", href: "/dashboard/reports" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/docs/api" },
      { name: "Security", href: "/security" },
      { name: "Privacy", href: "/privacy" },
    ],
  },
];

/** External social links, rendered as icon-only buttons in the footer. */
export const socialLinks = [
  { name: "GitHub", href: site.github, icon: "github", external: true },
  { name: "LinkedIn", href: site.linkedin, icon: "linkedin", external: true },
  {
    name: "Email",
    href: `mailto:${site.contactEmail}`,
    icon: "envelope",
    external: true,
  },
];
