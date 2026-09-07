import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InboxClient } from "@/components/dashboard/InboxClient";
import { emails, emailCategories } from "@/lib/data/emails";
import { renderWithProviders } from "./helpers/render";

/** Every seeded message in a category. */
const inCategory = (category) =>
  emails.filter((email) => email.category === category);

const selectAllCheckbox = () =>
  screen.getByRole("checkbox", { name: /select all visible messages/i });

const deselectAllCheckbox = () =>
  screen.getByRole("checkbox", { name: /deselect all visible messages/i });

const rowCheckboxes = () =>
  screen
    .getAllByRole("checkbox")
    .filter((box) => box.getAttribute("aria-label")?.startsWith('Select "'));

describe("inbox filtering", () => {
  it("shows only the active category on first render", () => {
    renderWithProviders(<InboxClient />);

    for (const email of inCategory("Primary")) {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
    }

    for (const email of inCategory("Threat Alerts")) {
      expect(screen.queryByText(email.subject)).not.toBeInTheDocument();
    }
  });

  it("labels each tab with a count derived from the data, not a fixed number", () => {
    renderWithProviders(<InboxClient />);

    for (const category of emailCategories) {
      const tab = screen.getByRole("tab", { name: new RegExp(category) });

      expect(tab).toHaveTextContent(String(inCategory(category).length));
    }
  });

  it("switches category when another tab is selected", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));

    for (const email of inCategory("Threat Alerts")) {
      expect(screen.getByText(email.subject)).toBeInTheDocument();
    }
  });

  it("moves between tabs with arrow keys", async () => {
    renderWithProviders(<InboxClient />);

    screen.getByRole("tab", { name: /Primary/ }).focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: /Threat Alerts/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("filters by search across subject, sender and message id", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "EM-2039",
    );

    expect(
      screen.getByText("New suspicious message detected"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Investigation IR-2026-018 requires review"),
    ).not.toBeInTheDocument();
  });

  it("finds a message by its case id", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "IR-2026-016",
    );

    expect(
      screen.getByText("New suspicious message detected"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "zzzzz-no-match",
    );

    expect(
      screen.getByText("No messages match these filters"),
    ).toBeInTheDocument();
  });

  it("recovers from an empty state via the reset action", async () => {
    renderWithProviders(<InboxClient />);

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
    renderWithProviders(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByRole("button", { name: "High Risk" }));

    const shown = inCategory("Threat Alerts").filter((e) => e.risk >= 75);
    const hidden = inCategory("Threat Alerts").filter((e) => e.risk < 75);

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
   * The original implementation compared `selected.length` to
   * `filtered.length`, so selecting two messages in one tab made the header
   * checkbox read as checked in any other tab that also held two — and
   * "select all" would then clear instead of select.
   */
  it("selects every visible message and nothing else", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());

    expect(rowCheckboxes().length).toBe(inCategory("Primary").length);
    expect(rowCheckboxes().every((box) => box.checked)).toBe(true);
  });

  it("reports the number selected", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());

    expect(
      screen.getByText(`${inCategory("Primary").length} selected`),
    ).toBeInTheDocument();
  });

  it("deselects everything when toggled a second time", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(deselectAllCheckbox());

    expect(rowCheckboxes().every((box) => !box.checked)).toBe(true);
  });

  it("does not report select-all as checked when a different tab has an equal count", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    expect(deselectAllCheckbox()).toBeChecked();

    await userEvent.click(screen.getByRole("tab", { name: /Updates/ }));

    expect(selectAllCheckbox()).not.toBeChecked();
  });

  it("clears the selection when the category changes", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(screen.getByRole("tab", { name: /Updates/ }));
    await userEvent.click(screen.getByRole("tab", { name: /Primary/ }));

    expect(rowCheckboxes().every((box) => !box.checked)).toBe(true);
  });

  it("clears the selection when a risk filter changes", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(selectAllCheckbox());
    await userEvent.click(screen.getByRole("button", { name: "Unread" }));

    expect(screen.queryByText(/\d+ selected/)).not.toBeInTheDocument();
  });

  it("shows bulk actions only once something is selected", async () => {
    renderWithProviders(<InboxClient />);

    expect(
      screen.queryByRole("button", { name: /^Archive \d/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(selectAllCheckbox());

    expect(
      screen.getByRole("button", { name: /^Archive \d+ selected/ }),
    ).toBeInTheDocument();
  });

  it("toggles a single row independently", async () => {
    renderWithProviders(<InboxClient />);

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
    renderWithProviders(<InboxClient />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /search messages/i }),
      "zzzzz-no-match",
    );

    expect(selectAllCheckbox()).toBeDisabled();
  });
});

describe("inbox mutations", () => {
  it("archives a message out of the inbox and into the archived view", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Archive "${target.subject}"` }),
    );

    expect(screen.queryByText(target.subject)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Archived/ }));

    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("offers undo on archive and restores the message", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Archive "${target.subject}"` }),
    );

    await userEvent.click(screen.getByRole("button", { name: /undo/i }));

    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("moves an archived message back to the inbox", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Archive "${target.subject}"` }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^Archived/ }));

    await userEvent.click(
      screen.getByRole("button", {
        name: `Move "${target.subject}" back to the inbox`,
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^Inbox/ }));

    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("stars a message and surfaces it in the starred view", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("button", { name: `Star "${target.subject}"` }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^Starred/ }));

    // Assert on the row's own checkbox rather than the subject text, which
    // also appears in the confirmation toast.
    expect(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    ).toBeInTheDocument();

    // And the star is now a "remove star" control, so the state really changed.
    expect(
      screen.getByRole("button", {
        name: `Remove star from "${target.subject}"`,
      }),
    ).toBeInTheDocument();
  });

  it("requires confirmation before deleting, and can be cancelled", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /^Delete 1 selected/ }),
    );

    // Nothing is gone yet — the prompt is still open.
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(target.subject)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("deletes on confirmation and shows the message in trash", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /^Delete 1 selected/ }),
    );

    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    expect(screen.queryByText(target.subject)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Trash/ }));

    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("recovers a deleted message from trash", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /^Delete 1 selected/ }),
    );
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^Trash/ }));
    await userEvent.click(
      screen.getByRole("button", { name: `Recover "${target.subject}"` }),
    );

    await userEvent.click(screen.getByRole("button", { name: /^Inbox/ }));

    expect(screen.getByText(target.subject)).toBeInTheDocument();
  });

  it("marks a message read when it is opened", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary").find((email) => email.unread);

    // An unread row carries the unread indicator.
    expect(screen.getAllByLabelText("Unread").length).toBeGreaterThan(0);

    const before = screen.getAllByLabelText("Unread").length;

    await userEvent.click(screen.getByText(target.subject));
    await userEvent.keyboard("{Escape}");

    expect(screen.queryAllByLabelText("Unread").length).toBe(before - 1);
  });

  it("keeps the live stat tiles in step with the list", async () => {
    renderWithProviders(<InboxClient />);

    const inboxTile = screen
      .getByText("In the inbox")
      .closest("div").parentElement;

    expect(within(inboxTile).getByText(String(emails.length))).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: `Archive "${inCategory("Primary")[0].subject}"`,
      }),
    );

    expect(
      within(inboxTile).getByText(String(emails.length - 1)),
    ).toBeInTheDocument();
  });
});

describe("inbox detail dialog", () => {
  it("opens the evidence dialog for the chosen message", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(screen.getByText(target.subject));

    expect(
      within(screen.getByRole("dialog")).getByRole("heading", {
        name: target.subject,
      }),
    ).toBeInTheDocument();
  });

  it("shows the evidence panels for that message", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByText("Urgent Invoice Payment Required"));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("Authentication")).toBeInTheDocument();
    expect(within(dialog).getByText("Infrastructure")).toBeInTheDocument();
    expect(within(dialog).getByText("Findings")).toBeInTheDocument();
    expect(within(dialog).getByText("Extracted indicators")).toBeInTheDocument();
  });

  it("shows the score and its derived severity together", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(screen.getByRole("tab", { name: /Threat Alerts/ }));
    await userEvent.click(screen.getByText("Urgent Invoice Payment Required"));

    const dialog = screen.getByRole("dialog");

    expect(within(dialog).getByText("92")).toBeInTheDocument();
    expect(within(dialog).getByText("Critical")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    renderWithProviders(<InboxClient />);

    await userEvent.click(screen.getByText(inCategory("Primary")[0].subject));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not toggle selection when a row is opened", async () => {
    renderWithProviders(<InboxClient />);

    const target = inCategory("Primary")[0];

    await userEvent.click(screen.getByText(target.subject));

    expect(
      screen.getByRole("checkbox", { name: `Select "${target.subject}"` }),
    ).not.toBeChecked();
  });
});
