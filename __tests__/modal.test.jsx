import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/**
 * Modal accessibility.
 *
 * The modal this replaced could only be dismissed by clicking one small
 * button — no Escape, no backdrop click, no focus management, no scroll lock
 * and no dialog semantics. Each of those is asserted here.
 */

function Harness({ onClose = () => {}, ...props }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Urgent Invoice Payment Required"
      subtitle="EM-2041 · BEC / Phishing"
      {...props}
    >
      <p>Evidence body</p>
      <button type="button">Inner action</button>
    </Modal>
  );
}

describe("Modal semantics", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Hidden">
        <p>Body</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes dialog semantics with its title as the accessible name", () => {
    render(<Harness />);

    const dialog = screen.getByRole("dialog", {
      name: "Urgent Invoice Payment Required",
    });

    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders the title as a heading", () => {
    render(<Harness />);

    expect(
      screen.getByRole("heading", { name: "Urgent Invoice Payment Required" }),
    ).toBeInTheDocument();
  });

  it("provides a labelled close control", () => {
    render(<Harness />);

    expect(
      screen.getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  });
});

describe("Modal dismissal", () => {
  it("closes when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const { container } = render(<Harness onClose={onClose} />);

    const backdrop = container.firstChild;

    await userEvent.pointer([
      { target: backdrop, keys: "[MouseLeft>]" },
      { target: backdrop, keys: "[/MouseLeft]" },
    ]);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when the click starts inside the dialog", async () => {
    // Selecting text inside the dialog and releasing over the backdrop must
    // not dismiss it.
    const onClose = vi.fn();
    const { container } = render(<Harness onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    const backdrop = container.firstChild;

    await userEvent.pointer([
      { target: dialog, keys: "[MouseLeft>]" },
      { target: backdrop, keys: "[/MouseLeft]" },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not close when a click lands on the dialog body", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.click(screen.getByText("Evidence body"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Modal focus and scroll management", () => {
  it("moves focus into the dialog on open", () => {
    render(<Harness />);

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("locks background scrolling while open", () => {
    const { unmount } = render(<Harness />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("returns focus to the trigger when closed", async () => {
    function Toggleable() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Open evidence</Button>

          <Modal open={open} onClose={() => setOpen(false)} title="Evidence">
            <p>Body</p>
          </Modal>
        </>
      );
    }

    render(<Toggleable />);

    const trigger = screen.getByRole("button", { name: "Open evidence" });

    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps Tab inside the dialog", async () => {
    render(<Harness footer={<Button>Footer action</Button>} />);

    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    const innerButton = screen.getByRole("button", { name: "Inner action" });
    const footerButton = screen.getByRole("button", { name: "Footer action" });

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    await userEvent.tab();
    expect(innerButton).toHaveFocus();

    await userEvent.tab();
    expect(footerButton).toHaveFocus();

    // Wrapping from the last control returns to the first, never escaping.
    await userEvent.tab();
    expect(closeButton).toHaveFocus();
  });

  it("wraps backwards from the first control to the last", async () => {
    render(<Harness footer={<Button>Footer action</Button>} />);

    const closeButton = screen.getByRole("button", { name: "Close dialog" });

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(
      screen.getByRole("button", { name: "Footer action" }),
    ).toHaveFocus();
  });
});
