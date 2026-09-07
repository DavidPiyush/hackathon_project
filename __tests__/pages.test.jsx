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
import { SettingsPanels } from "@/components/dashboard/SettingsPanels";
import { IndicatorRegistry } from "@/components/dashboard/IndicatorRegistry";
import { marketingNav, footerNav } from "@/lib/data/site";
import { features, workflow } from "@/lib/data/marketing";
import { indicatorRegistry } from "@/lib/data/dashboard";

/**
 * Document structure.
 *
 * The original landing page rendered four `<main>` landmarks and six `<h1>`
 * elements, because each marketing section had been written as a standalone
 * page and then composed. These tests pin the corrected outline.
 */
describe("landing page structure", () => {
  it("renders exactly one main landmark", () => {
    render(<HomePage />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("renders exactly one level-one heading", () => {
    render(<HomePage />);

    const h1s = screen
      .getAllByRole("heading")
      .filter((heading) => heading.tagName === "H1");

    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Detect/);
  });

  it("renders a section for every nav anchor", () => {
    const { container } = render(<HomePage />);

    for (const item of marketingNav) {
      const id = item.href.split("#")[1];

      expect(
        container.querySelector(`#${id}`),
        `no element with id="${id}" for nav item "${item.name}"`,
      ).not.toBeNull();
    }
  });

  it("provides a skip link target", () => {
    const { container } = render(<HomePage />);

    expect(container.querySelector("#main")).not.toBeNull();
  });
});

describe("SiteHeader", () => {
  it("renders a nav item for every entry in the nav table", () => {
    render(<SiteHeader />);

    const nav = screen.getByRole("navigation", { name: "Main" });

    for (const item of marketingNav) {
      expect(
        screen.getAllByRole("link", { name: new RegExp(item.name) }).length,
      ).toBeGreaterThan(0);
    }

    expect(nav).toBeInTheDocument();
  });

  it("links to the console", () => {
    render(<SiteHeader />);

    expect(
      screen.getAllByRole("link", { name: /Open Console/ })[0],
    ).toHaveAttribute("href", "/dashboard");
  });

  it("opens and closes the mobile navigation", async () => {
    render(<SiteHeader />);

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

  it("HowItWorks renders the pipeline as an ordered list", () => {
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

    // Identity. The subject shows twice: once in the summary, once in the
    // full header table below it.
    expect(
      screen.getAllByText("Urgent Invoice Payment Required").length,
    ).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByText("finance@secure-payments.com", { selector: "dd" }),
    ).toBeInTheDocument();

    // Authentication verdicts read from the headers
    expect(screen.getAllByText("softfail").length).toBeGreaterThan(0);

    // Routing path, origin first
    expect(screen.getByText("Routing path")).toBeInTheDocument();
    expect(screen.getAllByText("185.203.116.42").length).toBeGreaterThan(0);

    // Explained score
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

describe("SettingsPanels", () => {
  it("says that changes are not persisted in this build", () => {
    render(<SettingsPanels />);

    expect(screen.getByText(/no persistence layer/i)).toBeInTheDocument();
  });

  it("keeps save and revert disabled until something changes", async () => {
    render(<SettingsPanels />);

    const save = screen.getByRole("button", { name: /save changes/i });
    const revert = screen.getByRole("button", { name: /revert/i });

    expect(save).toBeDisabled();
    expect(revert).toBeDisabled();

    await userEvent.click(screen.getAllByRole("switch")[0]);

    expect(save).toBeEnabled();
    expect(revert).toBeEnabled();
  });

  it("toggles a switch and flags unsaved changes", async () => {
    render(<SettingsPanels />);

    const first = screen.getAllByRole("switch")[0];
    const before = first.getAttribute("aria-checked");

    await userEvent.click(first);

    expect(first.getAttribute("aria-checked")).not.toBe(before);
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  it("restores the original values on revert", async () => {
    render(<SettingsPanels />);

    const first = screen.getAllByRole("switch")[0];
    const before = first.getAttribute("aria-checked");

    await userEvent.click(first);
    await userEvent.click(screen.getByRole("button", { name: /revert/i }));

    expect(first.getAttribute("aria-checked")).toBe(before);
    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
  });
});

describe("IndicatorRegistry", () => {
  it("renders a captioned table of every indicator", () => {
    render(<IndicatorRegistry />);

    expect(screen.getByRole("table")).toBeInTheDocument();

    for (const entry of indicatorRegistry) {
      expect(screen.getByText(entry.value)).toBeInTheDocument();
    }
  });

  it("filters by verdict", async () => {
    render(<IndicatorRegistry />);

    await userEvent.click(screen.getByRole("button", { name: "Malicious" }));

    const malicious = indicatorRegistry.filter(
      (entry) => entry.verdict === "malicious",
    );
    const benign = indicatorRegistry.filter(
      (entry) => entry.verdict === "benign",
    );

    for (const entry of malicious) {
      expect(screen.getByText(entry.value)).toBeInTheDocument();
    }

    for (const entry of benign) {
      expect(screen.queryByText(entry.value)).not.toBeInTheDocument();
    }
  });

  it("filters by free-text search", async () => {
    render(<IndicatorRegistry />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search the indicator registry/i }),
      "micr0soft",
    );

    expect(screen.getByText("micr0soft-security.com")).toBeInTheDocument();
    expect(
      screen.queryByText("company-it-support.net"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state and can recover from it", async () => {
    render(<IndicatorRegistry />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search the indicator registry/i }),
      "zzzz-nothing",
    );

    expect(screen.getByText("No indicators match")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("gives every copy control an accessible name naming its value", () => {
    render(<IndicatorRegistry />);

    for (const entry of indicatorRegistry) {
      expect(
        screen.getByRole("button", { name: `Copy ${entry.value}` }),
      ).toBeInTheDocument();
    }
  });
});
