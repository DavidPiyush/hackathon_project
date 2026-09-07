"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  THEME_KEY,
  subscribe,
  getPreference,
  getServerPreference,
  getSystemTheme,
  getServerSystemTheme,
  writePreference,
  resolveTheme,
} from "@/lib/store/theme-store";

const ThemeContext = createContext(null);

/**
 * Theme state.
 *
 * Three settings, not two: `light`, `dark`, and `system` — which follows the
 * OS and keeps following it if the user changes it mid-session. Only an
 * explicit choice is persisted, so someone on `system` is never silently
 * pinned to whatever their OS happened to be on their first visit.
 *
 * The preference lives in `localStorage`, read through `useSyncExternalStore`
 * rather than mirrored into React state. The `data-theme` attribute on
 * `<html>` is the single switch every colour resolves from, and `ThemeScript`
 * sets it before first paint — so this provider only keeps it in sync and can
 * never cause a flash of the wrong theme.
 */
export function ThemeProvider({ children }) {
  const preference = useSyncExternalStore(
    subscribe,
    getPreference,
    getServerPreference,
  );

  const systemTheme = useSyncExternalStore(
    subscribe,
    getSystemTheme,
    getServerSystemTheme,
  );

  const theme = resolveTheme(preference, systemTheme);

  /** Writing to the document is an external side effect, which is what effects are for. */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next) => writePreference(next), []);

  const toggleTheme = useCallback(() => {
    writePreference(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const value = useMemo(
    () => ({ preference, theme, systemTheme, setTheme, toggleTheme }),
    [preference, theme, systemTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}

/**
 * Sets `data-theme` before the first paint.
 *
 * This has to be a blocking inline script: any React-driven approach runs
 * after hydration, by which point a dark-mode user has already been shown a
 * white page. Kept deliberately tiny, and wrapped so a storage exception
 * (private browsing) still leaves a usable theme rather than throwing during
 * document parse.
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var stored = null;
    try { stored = localStorage.getItem("${THEME_KEY}"); } catch (e) {}
    var system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", stored === "light" || stored === "dark" ? stored : system);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`.trim();

  return (
    <script
      // Fixed literal with no interpolated user input.
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

export default ThemeProvider;
