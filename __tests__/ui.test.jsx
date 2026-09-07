import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, IconButton } from "@/components/ui/Button";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { Meter, RiskMeter } from "@/components/ui/DataDisplay";
import { Icon, icons } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Form";
import { Toggle, Accordion, CopyButton } from "@/components/ui/Interactive";
import { cn } from "@/lib/utils/cn";
import { initials, truncateMiddle, formatNumber } from "@/lib/utils/format";

describe("Button", () => {
  it("renders a button element by default", () => {
    render(<Button>Analyze</Button>);

    expect(screen.getByRole("button", { name: "Analyze" })).toBeInTheDocument();
  });

  it("renders a link when given an internal href", () => {
    render(<Button href="/dashboard">Console</Button>);

    const link = screen.getByRole("link", { name: "Console" });

    expect(link).toHaveAttribute("href", "/dashboard");
    // Internal links must not open a new tab.
    expect(link).not.toHaveAttribute("target");
  });

  it("adds safe rel attributes to an external link", () => {
    render(<Button href="https://example.com">Docs</Button>);

    const link = screen.getByRole("link", { name: "Docs" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add target to a mailto link", () => {
    render(<Button href="mailto:a@b.com">Email</Button>);

    expect(screen.getByRole("link", { name: "Email" })).not.toHaveAttribute(
      "target",
    );
  });

  it("renders a disabled button rather than a link when disabled", () => {
    // An anchor cannot be disabled, so a disabled Button must never be one.
    render(
      <Button href="/dashboard" disabled>
        Console
      </Button>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Console" })).toBeDisabled();
  });

  it("marks itself busy and disabled while loading", () => {
    render(<Button loading>Sending</Button>);

    const button = screen.getByRole("button", { name: "Sending" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("fires onClick when activated", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Go</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("lets a caller override classes without losing the variant", () => {
    render(<Button className="w-full">Go</Button>);

    expect(screen.getByRole("button")).toHaveClass("w-full");
  });
});

describe("IconButton", () => {
  it("exposes its label as the accessible name", () => {
    // The original dashboard shipped 34 icon-only buttons with no name at all.
    render(<IconButton icon="archive" label="Archive message" />);

    expect(
      screen.getByRole("button", { name: "Archive message" }),
    ).toBeInTheDocument();
  });

  it("also sets a title so pointer users get a tooltip", () => {
    render(<IconButton icon="trash" label="Delete" />);

    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "title",
      "Delete",
    );
  });

  it("renders a link with the label when given an href", () => {
    render(<IconButton icon="search" label="Search" href="/dashboard/inbox" />);

    expect(screen.getByRole("link", { name: "Search" })).toHaveAttribute(
      "href",
      "/dashboard/inbox",
    );
  });
});

describe("Icon", () => {
  it("hides a decorative icon from assistive tech", () => {
    const { container } = render(<Icon name="shield" />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an icon that carries meaning as an image with a label", () => {
    render(<Icon name="shield" label="Protected" />);

    expect(screen.getByRole("img", { name: "Protected" })).toBeInTheDocument();
  });

  it("renders nothing for an unregistered name instead of crashing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container } = render(<Icon name="does-not-exist" />);

    expect(container).toBeEmptyDOMElement();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("registers a usable component for every name", () => {
    for (const [name, glyph] of Object.entries(icons)) {
      expect(typeof glyph, `icon "${name}"`).toBe("function");
    }
  });
});

describe("Badge and RiskBadge", () => {
  it("renders its content", () => {
    render(<Badge tone="critical">Malicious</Badge>);

    expect(screen.getByText("Malicious")).toBeInTheDocument();
  });

  it("falls back to the neutral tone for an unknown tone", () => {
    // A typo must not throw; it degrades to neutral.
    expect(() => render(<Badge tone="chartreuse">Odd</Badge>)).not.toThrow();
  });

  it("derives the RiskBadge label from the score", () => {
    render(<RiskBadge score={92} />);

    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  it("shows the numeric score when asked", () => {
    render(<RiskBadge score={81} showScore />);

    expect(screen.getByText("High Risk")).toBeInTheDocument();
    expect(screen.getByText("81")).toBeInTheDocument();
  });

  it("clamps an out-of-range score before labelling it", () => {
    render(<RiskBadge score={999} showScore />);

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders a status dot without breaking", () => {
    const { container } = render(<StatusDot tone="safe" />);

    expect(container.firstChild).toBeInTheDocument();
  });
});

describe("Meter and RiskMeter", () => {
  it("exposes progressbar semantics with the real values", () => {
    render(<Meter value={72} label="Risk score 72 of 100" />);

    const meter = screen.getByRole("progressbar", {
      name: "Risk score 72 of 100",
    });

    expect(meter).toHaveAttribute("aria-valuenow", "72");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("supports a custom maximum", () => {
    render(<Meter value={3} max={7} label="Three of seven" />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "7");
  });

  it("shows the score, the derived label and a meter together", () => {
    render(<RiskMeter score={92} />);

    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("recommends investigation only above the review threshold", () => {
    const { unmount } = render(<RiskMeter score={80} />);
    expect(screen.getByText("Investigation recommended")).toBeInTheDocument();
    unmount();

    render(<RiskMeter score={10} />);
    expect(screen.getByText("No action required")).toBeInTheDocument();
  });
});

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field id="email" label="Email address">
        {(field) => <Input {...field} name="email" />}
      </Field>,
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("wires an error message to the control and announces it", () => {
    render(
      <Field id="email" label="Email address" error="Please enter a valid email address.">
        {(field) => <Input {...field} name="email" />}
      </Field>,
    );

    const input = screen.getByLabelText("Email address");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Please enter a valid email address.",
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("marks a required field for assistive tech, not just with an asterisk", () => {
    render(
      <Field id="name" label="Full name" required>
        {(field) => <Input {...field} name="name" />}
      </Field>,
    );

    expect(screen.getByLabelText(/Full name/)).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByText("(required)")).toBeInTheDocument();
  });

  it("hides the hint once an error replaces it", () => {
    render(
      <Field id="msg" label="Message" hint="Add detail" error="Too short">
        {(field) => <Input {...field} name="msg" />}
      </Field>,
    );

    expect(screen.queryByText("Add detail")).not.toBeInTheDocument();
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });
});

describe("Toggle", () => {
  it("uses switch semantics rather than a checkbox", () => {
    render(<Toggle label="Explainable scoring" checked onChange={() => {}} />);

    const toggle = screen.getByRole("switch", { name: /Explainable scoring/ });

    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("reports the new value when activated", async () => {
    const onChange = vi.fn();
    render(<Toggle label="Quarantine" checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByRole("switch"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("Accordion", () => {
  const items = [
    { question: "First question", answer: "First answer" },
    { question: "Second question", answer: "Second answer" },
  ];

  it("opens the first panel and collapses the rest", () => {
    render(<Accordion items={items} />);

    expect(
      screen.getByRole("button", { name: "First question" }),
    ).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("button", { name: "Second question" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("switches panels on click, keeping only one open", async () => {
    render(<Accordion items={items} />);

    await userEvent.click(screen.getByRole("button", { name: "Second question" }));

    expect(
      screen.getByRole("button", { name: "Second question" }),
    ).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("button", { name: "First question" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses an open panel when its header is clicked again", async () => {
    render(<Accordion items={items} />);

    await userEvent.click(screen.getByRole("button", { name: "First question" }));

    expect(
      screen.getByRole("button", { name: "First question" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});

describe("CopyButton", () => {
  it("writes the value to the clipboard and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    navigator.clipboard.writeText = writeText;

    render(<CopyButton value="185.203.116.42" label="Copy address" />);

    await userEvent.click(screen.getByRole("button", { name: "Copy address" }));

    expect(writeText).toHaveBeenCalledWith("185.203.116.42");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("leaves the label unchanged when the clipboard is unavailable", async () => {
    navigator.clipboard.writeText = vi
      .fn()
      .mockRejectedValue(new Error("denied"));

    render(<CopyButton value="1.2.3.4" label="Copy address" />);

    await userEvent.click(screen.getByRole("button", { name: "Copy address" }));

    // It must not claim a copy that did not happen.
    expect(
      screen.getByRole("button", { name: "Copy address" }),
    ).toBeInTheDocument();
  });
});

describe("utility helpers", () => {
  it("cn merges classes with later ones winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-ink", false && "hidden", "font-bold")).toBe(
      "text-ink font-bold",
    );
  });

  it("initials builds a two-letter fallback", () => {
    expect(initials("Security Operations")).toBe("SO");
    expect(initials("Finance")).toBe("F");
    expect(initials("")).toBe("?");
    expect(initials(undefined)).toBe("?");
  });

  it("truncateMiddle leaves a short value untouched", () => {
    expect(truncateMiddle("short", 20)).toBe("short");
    expect(truncateMiddle("", 20)).toBe("");
    expect(truncateMiddle(undefined, 20)).toBe("");
  });

  it("truncateMiddle keeps both ends of a long value", () => {
    const value = "a-very-long-indicator-value-here";
    const result = truncateMiddle(value, 11);

    expect(result).toBe("a-ver…-here");
    expect(result.length).toBeLessThanOrEqual(11);
    // Both ends survive, which is what matters for comparing indicators.
    expect(value.startsWith(result.split("…")[0])).toBe(true);
    expect(value.endsWith(result.split("…")[1])).toBe(true);
  });

  it("formatNumber groups thousands", () => {
    expect(formatNumber(1284)).toBe("1,284");
  });
});
