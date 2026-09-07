import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomePage from "@/app/page";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { About } from "@/components/marketing/About";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { HeaderAnalyzer } from "@/components/dashboard/HeaderAnalyzer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { marketingNav, footerNav } from "@/lib/data/site";
import { features, workflow } from "@/lib/data/marketing";

/** The site header reads theme state, so marketing pages need the provider. */
const renderPage = (ui) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

/**
 * Document structure.
 *
 * The original landing page rendered four `<main>` landmarks and six `<h1>`
 * elements, because each marketing section had been written as a standalone
 * page and then composed. These tests pin the corrected outline.
 */
describe("landing page structure", () => {
  it("renders exactly one main landmark", () => {
    renderPage(<HomePage />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("renders exactly one level-one heading", () => {
    renderPage(<HomePage />);

    const h1s = screen
      .getAllByRole("heading")
      .filter((heading) => heading.tagName === "H1");

    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Detect/);
  });

  it("renders a section for every nav anchor", () => {
    const { container } = renderPage(<HomePage />);

    for (const item of marketingNav) {
      const id = item.href.split("#")[1];

      expect(
        container.querySelector(`#${id}`),
        `no element with id="${id}" for nav item "${item.name}"`,
      ).not.toBeNull();
    }
  });

  it("provides a skip link target", () => {
    const { container } = renderPage(<HomePage />);

    expect(container.querySelector("#main")).not.toBeNull();
  });
});

describe("SiteHeader", () => {
  it("renders a nav item for every entry in the nav table", () => {
    renderPage(<SiteHeader />);

    expect(
      screen.getByRole("navigation", { name: "Main" }),
    ).toBeInTheDocument();

    for (const item of marketingNav) {
      expect(
        screen.getAllByRole("link", { name: new RegExp(item.name) }).length,
      ).toBeGreaterThan(0);
    }
  });

  it("links to the console", () => {
    renderPage(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /Open Console/ })[0],
    ).toHaveAttribute("href", "/dashboard");
  });

  it("offers the theme switch without opening any menu", () => {
    renderPage(<SiteHeader />);

    // Desktop segmented control plus the compact mobile toggle; both are in
    // the DOM, visibility is handled by breakpoint classes.
    expect(
      screen.getByRole("radiogroup", { name: "Colour theme" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Switch to (light|dark) theme/ }),
    ).toBeInTheDocument();
  });

  it("opens and closes the mobile navigation", async () => {
    renderPage(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();

    await userEvent.click(trigger);

    expect(
      screen.getByRole("navigation", { name: "Mobile" }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Close navigation" }),
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
  });
});

describe("SiteFooter", () => {
  it("renders every footer link group", () => {
    render(<SiteFooter />);

    for (const group of footerNav) {
      expect(
        screen.getByRole("navigation", { name: group.title }),
      ).toBeInTheDocument();

      for (const link of group.links) {
        expect(screen.getByRole("link", { name: link.name })).toHaveAttribute(
          "href",
          link.href,
        );
      }
    }
  });

  it("gives every social icon link an accessible name", () => {
    render(<SiteFooter />);

    for (const name of ["GitHub", "LinkedIn", "Email"]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });
});

describe("marketing sections", () => {
  it("Hero shows the analysis panel with a score and severity", () => {
    render(<Hero />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Suspicious")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("Features renders every capability from the data", () => {
    render(<Features />);

    for (const feature of features) {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
    }
  });

  it("HowItWorks renders every pipeline stage", () => {
    render(<HowItWorks />);

    for (const stage of workflow) {
      expect(screen.getByText(stage.title)).toBeInTheDocument();
    }
  });

  it("marketing sections use h2, never h1", () => {
    for (const Section of [Features, HowItWorks, About]) {
      const { unmount } = render(<Section />);

      const h1s = screen
        .getAllByRole("heading")
        .filter((heading) => heading.tagName === "H1");

      expect(h1s).toHaveLength(0);

      unmount();
    }
  });
});

describe("HeaderAnalyzer", () => {
  it("prompts for input before anything is submitted", () => {
    render(<HeaderAnalyzer />);

    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("reports an error for empty input rather than failing silently", async () => {
    render(<HeaderAnalyzer />);

    await userEvent.click(
      screen.getByRole("button", { name: /analyze headers/i }),
    );

    expect(screen.getByText(/paste the raw headers/i)).toBeInTheDocument();
  });

  it("reports an error for input that is not an email", async () => {
    render(<HeaderAnalyzer />);

    await userEvent.type(
      screen.getByLabelText(/raw email headers/i),
      "just some prose",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /analyze headers/i }),
    );

    expect(screen.getByText(/no headers found/i)).toBeInTheDocument();
  });

  it("analyses the sample message end to end", async () => {
    render(<HeaderAnalyzer />);

    await userEvent.click(screen.getByRole("button", { name: /load sample/i }));

    // The subject shows twice: once in the summary, once in the header table.
    expect(
      screen.getAllByText("Urgent Invoice Payment Required").length,
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByText("finance@secure-payments.com", { selector: "dd" }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("softfail").length).toBeGreaterThan(0);

    expect(screen.getByText("Routing path")).toBeInTheDocument();
    expect(screen.getAllByText("185.203.116.42").length).toBeGreaterThan(0);

    expect(screen.getByText("Why this score")).toBeInTheDocument();
    expect(screen.getByText("SPF did not pass")).toBeInTheDocument();
  });

  it("clears the analysis on reset", async () => {
    render(<HeaderAnalyzer />);

    await userEvent.click(screen.getByRole("button", { name: /load sample/i }));
    expect(screen.getByText("Why this score")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Clear$/ }));

    expect(screen.queryByText("Why this score")).not.toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("states that header-only analysis cannot assign verdicts", async () => {
    render(<HeaderAnalyzer />);

    await userEvent.click(screen.getByRole("button", { name: /load sample/i }));

    expect(screen.getByText(/header-only/i)).toBeInTheDocument();
  });
});
