/**
 * Theme preference as an external store.
 *
 * `localStorage` and `prefers-color-scheme` are external systems, not React
 * state, so they are read through `useSyncExternalStore` rather than copied
 * into state inside an effect. That gets three things right for free:
 *
 * - hydration uses the server snapshot and then re-renders with the client
 *   value, with no mismatch warning and no wrong-theme flash
 * - a change in another tab, or in the OS setting, propagates immediately
 * - there is no cascading render from `setState` inside an effect
 */

export const THEME_KEY = "threatdetect:theme";

const listeners = new Set();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function lightQuery() {
  return typeof window === "undefined"
    ? null
    : window.matchMedia("(prefers-color-scheme: light)");
}

/** Subscribe to preference and OS-setting changes. */
export function subscribe(onStoreChange) {
  listeners.add(onStoreChange);

  const query = lightQuery();

  // `storage` fires for changes made in *other* tabs, which is exactly when
  // this tab needs to catch up.
  window.addEventListener("storage", onStoreChange);
  query?.addEventListener("change", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    query?.removeEventListener("change", onStoreChange);
  };
}

/** The stored preference: "light", "dark", or "system" when unset. */
export function getPreference() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);

    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private browsing or blocked storage: follow the OS.
    return "system";
  }
}

/**
 * Server snapshot. "system" is the genuine default for a first-time visitor,
 * so the server renders the same thing the client will conclude.
 */
export function getServerPreference() {
  return "system";
}

/** What the OS currently asks for. */
export function getSystemTheme() {
  return lightQuery()?.matches ? "light" : "dark";
}

/**
 * Dark is the server-side assumption for the OS setting, matching the
 * product's dark-first design. Only ever used for the pre-hydration render.
 */
export function getServerSystemTheme() {
  return "dark";
}

/** Persist a preference and notify subscribers in this tab. */
export function writePreference(next) {
  const value = next === "light" || next === "dark" ? next : "system";

  try {
    if (value === "system") {
      window.localStorage.removeItem(THEME_KEY);
    } else {
      window.localStorage.setItem(THEME_KEY, value);
    }
  } catch {
    // The choice will not survive a reload, but the session still applies it.
  }

  emit();
}

/** Resolve a preference plus the OS setting into the theme actually applied. */
export function resolveTheme(preference, systemTheme) {
  return preference === "system" ? systemTheme : preference;
}
