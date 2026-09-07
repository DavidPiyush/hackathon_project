import { Geist, Geist_Mono } from "next/font/google";

import { site } from "@/lib/data/site";

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
  themeColor: "#050b14",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      // `data-scroll-behavior` restores the Next 15 behaviour of suppressing
      // smooth scrolling during route transitions, which Next 16 no longer
      // does by default. Without it, every navigation animates its scroll.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh">
        {/* Keyboard users can jump straight past the nav on any page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
