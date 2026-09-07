import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Colour contrast, both themes.
 *
 * Adding a light theme doubled the number of colour pairs that have to stay
 * legible, and a palette tweak can quietly break one. This parses the token
 * blocks straight out of `globals.css` and computes real WCAG ratios, so a
 * regression fails the suite rather than shipping.
 */

const css = readFileSync(
  join(process.cwd(), "app", "globals.css"),
  "utf8",
);

/** Read the `--td-*` declarations from a selector block. */
function tokens(selector) {
  const start = css.indexOf(`${selector} {`);

  expect(start, `token block "${selector}" not found`).toBeGreaterThan(-1);

  const body = css.slice(start, css.indexOf("\n}", start));

  return Object.fromEntries(
    [...body.matchAll(/--(td-[a-z-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

const LIGHT = tokens(":root");
const DARK = tokens('[data-theme="dark"]');

function parseColor(value) {
  const short = value.match(/^#([0-9a-f]{3})$/i);

  if (short) {
    return short[1].split("").map((c) => parseInt(c + c, 16));
  }

  const long = value.match(/^#([0-9a-f]{6})$/i);

  if (long) {
    const n = parseInt(long[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  const rgb = value.match(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)/);

  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }

  return null;
}

/** Relative luminance, per WCAG 2.1. */
function luminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map((channel) => {
    const s = channel / 255;

    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrast(foreground, background) {
  const [lighter, darker] = [
    luminance(foreground),
    luminance(background),
  ].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Body-copy tokens need 4.5:1. The rest carry small labels, badges, icons and
 * meter fills, where 3:1 is the applicable threshold for non-text and large
 * text contrast.
 */
const BODY_TEXT = ["td-ink", "td-ink-soft"];

const FOREGROUNDS = [
  "td-ink",
  "td-ink-soft",
  "td-ink-muted",
  "td-ink-faint",
  "td-accent",
  "td-critical",
  "td-high",
  "td-warn",
  "td-safe",
  "td-info",
];

const BACKGROUNDS = ["td-surface", "td-canvas", "td-elevated"];

describe.each([
  ["light", LIGHT],
  ["dark", DARK],
])("%s theme contrast", (themeName, palette) => {
  it("defines every token the app relies on", () => {
    for (const key of [...FOREGROUNDS, ...BACKGROUNDS, "td-line", "td-on-accent"]) {
      expect(palette[key], `${themeName}: --${key} is missing`).toBeTruthy();
    }
  });

  for (const background of BACKGROUNDS) {
    for (const foreground of FOREGROUNDS) {
      const needed = BODY_TEXT.includes(foreground) ? 4.5 : 3;

      it(`${foreground} on ${background} meets ${needed}:1`, () => {
        const fg = parseColor(palette[foreground]);
        const bg = parseColor(palette[background]);

        expect(fg, `${foreground} is not a parseable colour`).not.toBeNull();
        expect(bg, `${background} is not a parseable colour`).not.toBeNull();

        const ratio = contrast(fg, bg);

        expect(
          ratio,
          `${themeName}: ${palette[foreground]} on ${palette[background]} is ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(needed);
      });
    }
  }

  it("uses a readable colour on top of the accent fill", () => {
    // Primary buttons paint --td-on-accent over --td-accent.
    const ratio = contrast(
      parseColor(palette["td-on-accent"]),
      parseColor(palette["td-accent"]),
    );

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe("theme parity", () => {
  it("defines the same token set in both themes", () => {
    // A token present in one theme but not the other renders as an invalid
    // value, which is silent and easy to miss.
    expect(Object.keys(DARK).sort()).toEqual(Object.keys(LIGHT).sort());
  });

  it("inverts the surface ramp between themes", () => {
    const lightCanvas = luminance(parseColor(LIGHT["td-canvas"]));
    const darkCanvas = luminance(parseColor(DARK["td-canvas"]));

    expect(lightCanvas).toBeGreaterThan(darkCanvas);
  });

  it("keeps the sunken surface deeper than the canvas in both themes", () => {
    expect(luminance(parseColor(LIGHT["td-sunken"]))).toBeLessThan(
      luminance(parseColor(LIGHT["td-canvas"])),
    );

    expect(luminance(parseColor(DARK["td-sunken"]))).toBeLessThan(
      luminance(parseColor(DARK["td-canvas"])),
    );
  });

  it("declares a colour-scheme for each theme so native controls follow", () => {
    expect(css).toMatch(/:root\s*\{[^}]*color-scheme:\s*light/);
    expect(css).toMatch(/\[data-theme="dark"\]\s*\{[^}]*color-scheme:\s*dark/);
  });
});

describe("cursor affordances", () => {
  /**
   * Tailwind's preflight sets `cursor: default` on buttons, which made every
   * control in the app feel inert. The fix is one base rule rather than a
   * `cursor-pointer` class on each component, so it is asserted centrally.
   */
  it("restores the pointer cursor on interactive elements", () => {
    const base = css.slice(css.indexOf("@layer base"));

    for (const selector of [
      "button:not(:disabled)",
      '[role="button"]',
      '[role="switch"]',
      '[role="tab"]',
      "a[href]",
      "summary",
      "label[for]",
    ]) {
      expect(base, `no cursor rule for ${selector}`).toContain(selector);
    }

    expect(base).toMatch(/cursor:\s*pointer/);
  });

  it("marks disabled controls as unavailable", () => {
    const base = css.slice(css.indexOf("@layer base"));

    expect(base).toContain("button:disabled");
    expect(base).toMatch(/cursor:\s*not-allowed/);
  });
});
