import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InboxClient } from "@/components/dashboard/InboxClient";
import { emails, emailCategories } from "@/lib/data/emails";

/** Every message in a given category, straight from the shared dataset. */
const inCategory = (category) =>
  emails.filter((email) => email.category === category);

const selectAllCheckbox = () =>
  screen.getByRole("checkbox", { name: /select all visible messages/i });

const deselectAllCheckbox = () =>
  screen.getByRole("checkbox", { name: /deselect all visible messages/i });

describe("inbox filtering", () => {
  it("shows only the active category on first render", () => {
    render(<InboxClient />);

    const primary = inCategory("Primary");

    for (const email of primary) {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
    }

    for (const email of inCategory("Threat Alerts")) {
      expect(screen.queryByText(email.subject)).not.toBeInTheDocument();
    }
  });

  it("labels each tab with a count derived from the data, not a fixed number", () => {
    render(<InboxClient />);

    for (const category of emailCategories) {
      const tab = screen.getByRole("tab", { name: new RegExp(category) });

      expect(tab).toHaveTextContent(String(inCategory(category).length));
    }
  });

  it("reports the visible and total counts accurately", () => {
    // The original toolbar read "1–n of 24" against a six-message dataset.
    render(<InboxClient />);

    expect(
      screen.getByText(String(inCategory("Primary").length), {
        selector: "strong",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(String(emails.length), { selector: "strong" }),
    ).toBeInTheDocument();
  });

  it("switches category when another tab is selected", async () => {
    render(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));

    for (const email of inCategory("Threat Alerts")) {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
    }
  });

  it("moves between tabs with arrow keys", async () => {
    render(<InboxClient />);

    const first = screen.getByRole("tab", { name: /Primary/ });

    first.focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: /Threat Alerts/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("filters by search across subject, sender and message id", async () => {
    render(<InboxClient />);

    const search = screen.getByRole("searchbox", { name: /search messages/i });

    await userEvent.type(search, "EM-2039");

    expect(
      screen.getByText("New suspicious message detected"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Investigation IR-2026-018 requires review"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    render(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "zzzzz-no-match",
    );

    expect(
      screen.getByText("No messages match these filters"),
    ).toBeInTheDocument();
  });

  it("recovers from an empty state via the reset action", async () => {
    render(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "zzzzz-no-match",
    );

    await userEvent.click(screen.getByRole("button", { name: /reset filters/i }));

    expect(
      screen.queryByText("No messages match these filters"),
    ).not.toBeInTheDocument();
  });

  it("applies the high-risk filter", async () => {
    render(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByRole("button", { name: "High Risk" }));

    const shown = inCategory("Threat Alerts").filter(
      (email) => email.risk >= 75,
    );
    const hidden = inCategory("Threat Alerts").filter(
      (email) => email.risk < 75,
    );

    for (const email of shown) {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
    }

    for (const email of hidden) {
      expect(screen.queryByText(email.subject)).not.toBeInTheDocument();
    }
  });
});

describe("inbox selection", () => {
  /**
   * This is the regression the audit found. The previous implementation
   * compared `selected.length === filtered.length`, so selecting two messages
   * in one tab made the header checkbox read as checked in any other tab that
   * also had two messages — and "select all" would then clear instead of
   * select.
   */
  it("selects every visible message and nothing else", async () => {
    render(<InboxClient />);

    await userEvent.click(selectAllCheckbox());

    const rowCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((box) => box.getAttribute("aria-label")?.startsWith("Select \""));

    expect(rowCheckboxes.length).toBe(inCategory("Primary").length);
    expect(rowCheckboxes.every((box) => box.checked)).toBe(true);
  });

  it("reports the number selected", async () => {
    render(<InboxClient />);

    await userEvent.click(selectAllCheckbox());

    expect(
      screen.getByText(`${inCategory("Primary").length} selected`),
    ).toBeInTheDocument();
  });

  it("deselects everything when toggled a second time", async () => {
    render(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(deselectAllCheckbox());

    const rowCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((box) => box.getAttribute("aria-label")?.startsWith("Select \""));

    expect(rowCheckboxes.every((box) => !box.checked)).toBe(true);
  });

  it("does not report select-all as checked when a different tab has an equal count", async () => {
    render(<InboxClient />);

    // Select everything in Primary…
    await userEvent.click(selectAllCheckbox());
    expect(deselectAllCheckbox()).toBeChecked();

    // …then move to another category. Selection is scoped to what is visible,
    // so the header must not read as checked here.
    await userEvent.click(screen.getByRole("tab", { name: /Updates/ }));

    expect(selectAllCheckbox()).not.toBeChecked();
  });

  it("clears the selection when the category changes", async () => {
    // Keeping hidden rows selected would let a bulk action silently affect
    // messages the analyst can no longer see.
    render(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(screen.getByRole("tab", { name: /Updates/ }));
    await userEvent.click(screen.getByRole("tab", { name: /Primary/ }));

    const rowCheckboxes = screen
      .getAllByRole("checkbox")
      .filter((box) => box.getAttribute("aria-label")?.startsWith("Select \""));

    expect(rowCheckboxes.every((box) => !box.checked)).toBe(true);
  });

  it("clears the selection when a risk filter changes", async () => {
    render(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(screen.getByRole("button", { name: "Unread" }));

    expect(screen.queryByText(/\d+ selected/)).not.toBeInTheDocument();
  });

  it("shows bulk actions only once something is selected", async () => {
    render(<InboxClient />);

    expect(
      screen.queryByRole("button", { name: /^Archive/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(selectAllCheckbox());

    expect(screen.getByRole("button", { name: /^Archive/ })).toBeInTheDocument();
  });

  it("toggles a single row independently", async () => {
    render(<InboxClient />);

    const target = inCategory("Primary")[0];
    const checkbox = screen.getByRole("checkbox", {
      name: `Select "${target.subject}"`,
    });

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("disables select-all when no rows are visible", async () => {
    render(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "zzzzz-no-match",
    );

    expect(selectAllCheckbox()).toBeDisabled();
  });
});

describe("inbox detail dialog", () => {
  it("opens the evidence dialog for the chosen message", async () => {
    render(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(screen.getByText(target.subject));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByRole("heading", { name: target.subject })).toBeInTheDocument();
  });

  it("shows the evidence panels for that message", async () => {
    render(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByText("Urgent Invoice Payment Required"));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Authentication")).toBeInTheDocument();
    expect(within(dialog).getByText("Infrastructure")).toBeInTheDocument();
    expect(within(dialog).getByText("Findings")).toBeInTheDocument();
    expect(within(dialog).getByText("Extracted indicators")).toBeInTheDocument();
  });

  it("shows the score and its derived severity together", async () => {
    render(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByText("Urgent Invoice Payment Required"));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("92")).toBeInTheDocument();
    expect(within(dialog).getByText("Critical")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<InboxClient />);

    await userEvent.click(screen.getByText(inCategory("Primary")[0].subject));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not toggle selection when a row is opened", async () => {
    render(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(screen.getByText(target.subject));

    expect(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    ).not.toBeChecked();
  });
});
