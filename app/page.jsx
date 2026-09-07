import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { About } from "@/components/marketing/About";
import { Contact } from "@/components/marketing/Contact";
import { CtaBand } from "@/components/marketing/CtaBand";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const metadata = {
  alternates: { canonical: "/" },
};

/**
 * Landing page.
 *
 * One `<main>` landmark and exactly one `<h1>` (in the Hero) — the sections
 * below it are `<section>` elements with `<h2>` headings, so the document
 * outline is valid and the in-page nav anchors resolve.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <Contact />
        <CtaBand />
      </main>

      <SiteFooter />
    </>
  );
}
