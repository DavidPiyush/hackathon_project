import { afterEach, vi } from "vitest";

/**
 * Test setup.
 *
 * This runs for every suite, including the ones that opt into the `node`
 * environment to test server modules. So each DOM-specific step is guarded on
 * `window` existing rather than assumed — an unguarded reference here fails
 * those suites before a single test runs.
 */

const isBrowserLike = typeof window !== "undefined";

if (isBrowserLike) {
  await import("@testing-library/jest-dom/vitest");

  const { cleanup } = await import("@testing-library/react");

  // Unmount between tests so queries never see a previous render's DOM, and
  // clear persisted console state so one test cannot seed the next.
  afterEach(() => {
    cleanup();

    try {
      window.localStorage.clear();
    } catch {
      // Storage unavailable in this environment.
    }
  });

  /**
   * jsdom implements neither of these, and both are used by real components:
   * SiteHeader observes sections for its active-link state, and the header
   * closes its mobile sheet on a media-query change.
   */
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };

  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  // Clipboard is used by CopyButton; jsdom provides no implementation.
  if (!navigator.clipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });
  }
}
