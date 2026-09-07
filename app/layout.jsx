import { Geist, Geist_Mono } from "next/font/google";

import { site } from "@/lib/data/site";
import {
  ThemeProvider,
  ThemeScript,
} from "@/components/providers/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    // Every child page supplies only its own name; the brand is appended here.
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "email security",
    "phishing detection",
    "email forensics",
    "threat intelligence",
    "DFIR",
    "BEC detection",
    "SPF DKIM DMARC",
  ],
  authors: [{ name: `${site.name} Team` }],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  // One entry per theme, so the browser chrome matches the active palette
  // instead of always painting the dark surface colour.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#050b14" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      // `data-scroll-behavior` restores the Next 15 behaviour of suppressing
      // smooth scrolling during route transitions, which Next 16 no longer
      // does by default. Without it, every navigation animates its scroll.
      data-scroll-behavior="smooth"
      // ThemeScript stamps data-theme before paint, so the server HTML and the
      // first client render legitimately differ on this attribute.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>

      <body className="min-h-dvh">
        {/* Keyboard users can jump straight past the nav on any page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        >
          Skip to main content
        </a>

        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
