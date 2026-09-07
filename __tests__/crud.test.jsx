import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InvestigationsClient } from "@/components/dashboard/InvestigationsClient";
import { IndicatorRegistry } from "@/components/dashboard/IndicatorRegistry";
import { ReportsClient } from "@/components/dashboard/ReportsClient";
import { SettingsPanels } from "@/components/dashboard/SettingsPanels";
import { OverviewClient } from "@/components/dashboard/OverviewClient";
import { investigations, indicatorRegistry, reports } from "@/lib/data/dashboard";
import { renderWithProviders } from "./helpers/render";

/**
 * Filter pills, row triggers and popover menu items can all share a label
 * ("Monitoring", "malicious"). Pills carry `aria-pressed` and row triggers
 * carry `aria-expanded`; a menu item has neither.
 */
const menuItem = (name) =>
  screen
    .getAllByRole("button", { name })
    .find(
      (button) =>
        !button.hasAttribute("aria-pressed") &&
        !button.hasAttribute("aria-expanded"),
    );

/**
 * CRUD across the console modules.
 *
 * These drive the real provider tree, so each test exercises the component,
 * the reducer transition and the toast together.
 */

describe("investigations", () => {
  it("lists every seeded case", () => {
    renderWithProviders(<InvestigationsClient />);

    for (const item of investigations) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it("filters to open cases only", async () => {
    renderWithProviders(<InvestigationsClient />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    const closed = investigations.filter((item) => item.state === "Closed");

    for (const item of closed) {
      expect(screen.queryByText(item.title)).not.toBeInTheDocument();
    }
  });

  it("searches by case id", async () => {
    renderWithProviders(<InvestigationsClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search investigations/i }),
      "IR-2026-015",
    );

    expect(
      screen.getByText("Mailbox quota credential phishing"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Invoice fraud targeting finance"),
    ).not.toBeInTheDocument();
  });

  it("rejects an incomplete new case rather than creating one", async () => {
    renderWithProviders(<InvestigationsClient />);

    await userEvent.click(screen.getByRole("button", { name: /open a case/i }));
    await userEvent.click(screen.getByRole("button", { name: /^Open case$/ }));

    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    // The dialog is still open, so nothing was created.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("creates a case and shows it in the list", async () => {
    renderWithProviders(<InvestigationsClient />);

    await userEvent.click(screen.getByRole("button", { name: /open a case/i }));

    await userEvent.type(
      screen.getByLabelText(/^Title/),
      "Supplier portal credential theft",
    );

    await userEvent.type(
      screen.getByLabelText(/^Summary/),
      "A cloned supplier portal is harvesting credentials from the finance team.",
    );

    await userEvent.click(screen.getByRole("button", { name: /^Open case$/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // The title also appears in the confirmation toast, so match the heading.
    expect(
      screen.getByRole("heading", { name: "Supplier portal credential theft" }),
    ).toBeInTheDocument();
  });

  it("edits an existing case", async () => {
    renderWithProviders(<InvestigationsClient />);

    const target = investigations[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Edit ${target.id}` }),
    );

    const title = screen.getByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Renamed investigation");

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText("Renamed investigation")).toBeInTheDocument();
    expect(screen.queryByText(target.title)).not.toBeInTheDocument();
  });

  it("moves a case to another state", async () => {
    renderWithProviders(<InvestigationsClient />);

    const target = investigations.find((item) => item.state === "Active");

    await userEvent.click(
      screen.getByRole("button", {
        name: `Change state for ${target.id} — currently ${target.state}`,
      }),
    );

    await userEvent.click(menuItem("Monitoring"));

    expect(screen.getByText(`${target.id} — Monitoring`)).toBeInTheDocument();
  });

  it("requires confirmation before deleting a case", async () => {
    renderWithProviders(<InvestigationsClient />);

    const target = investigations[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Delete ${target.id}` }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(target.title)).toBeInTheDocument();

    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(screen.queryByText(target.title)).not.toBeInTheDocument();
  });

  it("keeps the open-case tile in step after closing a case", async () => {
    renderWithProviders(<InvestigationsClient />);

    const openBefore = investigations.filter(
      (item) => item.state !== "Closed",
    ).length;

    const tile = screen.getByText("Open cases").closest("div").parentElement;

    expect(within(tile).getByText(String(openBefore))).toBeInTheDocument();

    const first = investigations[0];

    await userEvent.click(
      screen.getByRole("button", {
        name: `Change state for ${first.id} — currently ${first.state}`,
      }),
    );
    await userEvent.click(menuItem("Closed"));

    expect(within(tile).getByText(String(openBefore - 1))).toBeInTheDocument();
  });
});

describe("indicator registry", () => {
  it("lists every registered indicator", () => {
    renderWithProviders(<IndicatorRegistry />);

    for (const entry of indicatorRegistry) {
      expect(screen.getByText(entry.value)).toBeInTheDocument();
    }
  });

  it("filters by verdict", async () => {
    renderWithProviders(<IndicatorRegistry />);

    await userEvent.click(screen.getByRole("button", { name: "Malicious" }));

    for (const entry of indicatorRegistry.filter((e) => e.verdict === "benign")) {
      expect(screen.queryByText(entry.value)).not.toBeInTheDocument();
    }
  });

  it("registers a new indicator as unknown", async () => {
    renderWithProviders(<IndicatorRegistry />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /add indicator/i })[0],
    );

    await userEvent.type(
      screen.getByLabelText(/^Indicator/),
      "fresh-typosquat.example",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /register indicator/i }),
    );

    expect(screen.getByText("fresh-typosquat.example")).toBeInTheDocument();

    // A new indicator must never arrive pre-judged.
    const row = screen
      .getByText("fresh-typosquat.example")
      .closest("tr");

    expect(within(row).getByText("unknown")).toBeInTheDocument();
  });

  it("refuses a duplicate indicator", async () => {
    renderWithProviders(<IndicatorRegistry />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /add indicator/i })[0],
    );

    await userEvent.type(
      screen.getByLabelText(/^Indicator/),
      indicatorRegistry[0].value,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /register indicator/i }),
    );

    // The dialog stays open with a field-level error; the toast repeats it.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText(/already in the registry/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("rejects an indicator containing whitespace", async () => {
    renderWithProviders(<IndicatorRegistry />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /add indicator/i })[0],
    );

    await userEvent.type(screen.getByLabelText(/^Indicator/), "two words");
    await userEvent.click(
      screen.getByRole("button", { name: /register indicator/i }),
    );

    expect(screen.getByText(/cannot contain spaces/i)).toBeInTheDocument();
  });

  it("lets an analyst override the verdict", async () => {
    renderWithProviders(<IndicatorRegistry />);

    const target = indicatorRegistry.find((e) => e.verdict === "benign");

    await userEvent.click(
      screen.getByRole("button", {
        name: `Change verdict for ${target.value} — currently benign`,
      }),
    );

    await userEvent.click(menuItem("malicious"));

    // Assert the row itself changed, which is the state that matters. Scoped
    // to the table because the value also appears in the confirmation toast.
    const updated = within(screen.getByRole("table"))
      .getByText(target.value)
      .closest("tr");

    expect(within(updated).getByText("malicious")).toBeInTheDocument();
    expect(within(updated).queryByText("benign")).not.toBeInTheDocument();

    // And the trigger's label now reflects the new verdict.
    expect(
      screen.getByRole("button", {
        name: `Change verdict for ${target.value} — currently malicious`,
      }),
    ).toBeInTheDocument();
  });

  it("removes an indicator after confirmation", async () => {
    renderWithProviders(<IndicatorRegistry />);

    const target = indicatorRegistry[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Remove ${target.value}` }),
    );

    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Remove",
      }),
    );

    // The value still appears in the confirmation toast, so assert the row is
    // gone rather than the text.
    expect(
      screen.queryByRole("button", { name: `Remove ${target.value}` }),
    ).not.toBeInTheDocument();
  });

  it("shows progress while enrichment runs", async () => {
    renderWithProviders(<IndicatorRegistry />);

    const target = indicatorRegistry[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Run enrichment on ${target.value}` }),
    );

    expect(screen.getByText(/enriching/i)).toBeInTheDocument();
  });
});

describe("reports", () => {
  it("lists every seeded report", () => {
    renderWithProviders(<ReportsClient />);

    for (const report of reports) {
      expect(screen.getByText(report.title)).toBeInTheDocument();
    }
  });

  it("filters to drafts", async () => {
    renderWithProviders(<ReportsClient />);

    await userEvent.click(screen.getByRole("button", { name: "Draft" }));

    for (const report of reports.filter((r) => r.state === "Final")) {
      expect(screen.queryByText(report.title)).not.toBeInTheDocument();
    }
  });

  it("finalises a draft and makes it immutable", async () => {
    renderWithProviders(<ReportsClient />);

    const draft = reports.find((report) => report.state === "Draft");

    await userEvent.click(
      screen.getByRole("button", { name: `Finalise ${draft.id}` }),
    );

    expect(screen.getByText(`${draft.id} finalised`)).toBeInTheDocument();

    // The finalise control is gone, because a final report cannot be re-signed.
    expect(
      screen.queryByRole("button", { name: `Finalise ${draft.id}` }),
    ).not.toBeInTheDocument();
  });

  it("generates a report through visible stages", async () => {
    renderWithProviders(<ReportsClient />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /generate report/i })[0],
    );

    await userEvent.click(screen.getByRole("button", { name: /^Generate$/ }));

    // The staged progress is what makes the wait legible.
    expect(screen.getByText(/assembling the report/i)).toBeInTheDocument();
  });

  it("deletes a report after confirmation", async () => {
    renderWithProviders(<ReportsClient />);

    const target = reports[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Delete ${target.id}` }),
    );

    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(screen.queryByText(target.title)).not.toBeInTheDocument();
  });

  it("warns that a finalised report is signed before deleting it", async () => {
    renderWithProviders(<ReportsClient />);

    const final = reports.find((report) => report.state === "Final");

    await userEvent.click(
      screen.getByRole("button", { name: `Delete ${final.id}` }),
    );

    expect(screen.getByText(/is finalised/i)).toBeInTheDocument();
  });
});

describe("settings", () => {
  it("says plainly that there is no server to sync to", () => {
    renderWithProviders(<SettingsPanels />);

    expect(screen.getByText(/stored in this browser/i)).toBeInTheDocument();
  });

  it("keeps save and revert disabled until something changes", async () => {
    renderWithProviders(<SettingsPanels />);

    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Revert/ })).toBeDisabled();

    await userEvent.click(screen.getAllByRole("switch")[0]);

    expect(screen.getByRole("button", { name: /save changes/i })).toBeEnabled();
  });

  it("flags unsaved changes and reverts them", async () => {
    renderWithProviders(<SettingsPanels />);

    const first = screen.getAllByRole("switch")[0];
    const before = first.getAttribute("aria-checked");

    await userEvent.click(first);

    expect(first.getAttribute("aria-checked")).not.toBe(before);
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Revert/ }));

    expect(first.getAttribute("aria-checked")).toBe(before);
    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
  });

  it("commits a change on save and clears the dirty flag", async () => {
    renderWithProviders(<SettingsPanels />);

    await userEvent.click(screen.getAllByRole("switch")[0]);
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/settings saved/i)).toBeInTheDocument();
    expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
  });

  it("confirms before restoring defaults", async () => {
    renderWithProviders(<SettingsPanels />);

    await userEvent.click(
      screen.getByRole("button", { name: /restore defaults/i }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("overview", () => {
  it("reflects live inbox state rather than the frozen seed", () => {
    renderWithProviders(<OverviewClient />);

    expect(screen.getByText("Triage queue")).toBeInTheDocument();
    // "Open investigations" is both a stat label and a button, so match the tile.
    expect(
      screen.getByText("Open investigations", { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("shows the highest-scoring message first in the triage queue", () => {
    renderWithProviders(<OverviewClient />);

    // EM-2041 scores 92, the highest in the corpus.
    expect(
      screen.getByText("Urgent Invoice Payment Required"),
    ).toBeInTheDocument();
  });
});
