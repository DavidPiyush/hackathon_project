import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider, ThemeScript } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  THEME_KEY,
  getPreference,
  getServerPreference,
  writePreference,
  resolveTheme,
} from "@/lib/store/theme-store";

/** Point `prefers-color-scheme: light` at a fixed answer. */
function mockSystemTheme(theme) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes("light") ? theme === "light" : theme === "dark",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const renderToggle = (props) =>
  render(
    <ThemeProvider>
      <ThemeToggle {...props} />
    </ThemeProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  mockSystemTheme("dark");
});

describe("theme store", () => {
  it("defaults to following the system when nothing is stored", () => {
    expect(getPreference()).toBe("system");
  });

  it("reads back an explicit preference", () => {
    writePreference("light");
    expect(getPreference()).toBe("light");

    writePreference("dark");
    expect(getPreference()).toBe("dark");
  });

  it("clears the stored value when returning to system", () => {
    writePreference("light");
    writePreference("system");

    expect(window.localStorage.getItem(THEME_KEY)).toBeNull();
    expect(getPreference()).toBe("system");
  });

  it("treats an unrecognised stored value as system", () => {
    window.localStorage.setItem(THEME_KEY, "chartreuse");

    expect(getPreference()).toBe("system");
  });

  it("renders the same default on the server as a first-time client", () => {
    expect(getServerPreference()).toBe("system");
  });

  it("resolves system to whatever the OS reports", () => {
    expect(resolveTheme("system", "light")).toBe("light");
    expect(resolveTheme("system", "dark")).toBe("dark");
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
  });
});

describe("ThemeProvider", () => {
  it("stamps the resolved theme onto the document", () => {
    mockSystemTheme("light");

    render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("prefers an explicit choice over the system setting", () => {
    mockSystemTheme("light");
    window.localStorage.setItem(THEME_KEY, "dark");

    render(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("throws a useful error when used outside the provider", () => {
    // Silence the boundary-less render error React logs.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ThemeToggle />)).toThrow(
      /useTheme must be used inside a ThemeProvider/,
    );

    spy.mockRestore();
  });
});

describe("ThemeToggle — segmented control", () => {
  it("renders all three options, including on the server-side pass", () => {
    renderToggle();

    const group = screen.getByRole("radiogroup", { name: "Colour theme" });

    expect(group).toBeInTheDocument();

    for (const label of ["Light", "Dark", "System"]) {
      expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
    }
  });

  it("marks System as active by default", () => {
    renderToggle();

    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("switches to light and applies it to the document", async () => {
    renderToggle();

    await userEvent.click(screen.getByRole("radio", { name: "Light" }));

    expect(screen.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("switches to dark and applies it to the document", async () => {
    mockSystemTheme("light");
    renderToggle();

    await userEvent.click(screen.getByRole("radio", { name: "Dark" }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists an explicit choice", async () => {
    renderToggle();

    await userEvent.click(screen.getByRole("radio", { name: "Light" }));

    expect(window.localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("returns to following the system and forgets the stored choice", async () => {
    renderToggle();

    await userEvent.click(screen.getByRole("radio", { name: "Light" }));
    await userEvent.click(screen.getByRole("radio", { name: "System" }));

    expect(window.localStorage.getItem(THEME_KEY)).toBeNull();
    expect(screen.getByRole("radio", { name: "System" })).toBeChecked();
  });

  it("explains what System means", () => {
    renderToggle();

    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute(
      "title",
      "Follow your system setting",
    );
  });
});

describe("ThemeToggle — compact control", () => {
  it("names the theme it will switch to", () => {
    renderToggle({ compact: true });

    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeInTheDocument();
  });

  it("toggles between light and dark", async () => {
    renderToggle({ compact: true });

    await userEvent.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    await userEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

describe("ThemeScript", () => {
  /**
   * This runs before paint to prevent a flash of the wrong theme, so what it
   * contains matters more than most inline scripts.
   */
  it("reads the stored key and falls back to the system setting", () => {
    const { container } = render(<ThemeScript />);
    const source = container.querySelector("script").innerHTML;

    expect(source).toContain(THEME_KEY);
    expect(source).toContain("prefers-color-scheme: light");
    expect(source).toContain("data-theme");
  });

  it("survives storage access throwing, as in private browsing", () => {
    const source = render(<ThemeScript />).container.querySelector("script")
      .innerHTML;

    // Both the storage read and the whole body are guarded.
    expect(source.match(/try\s*\{/g).length).toBeGreaterThanOrEqual(2);
    expect(source).toContain('setAttribute("data-theme", "dark")');
  });

  it("contains no interpolated user input", () => {
    const source = render(<ThemeScript />).container.querySelector("script")
      .innerHTML;

    expect(source).not.toContain("${");
  });
});
