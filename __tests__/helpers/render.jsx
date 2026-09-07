import { render } from "@testing-library/react";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { DataProvider } from "@/components/providers/DataProvider";
import { STORAGE_KEY } from "@/lib/store/reducer";
import { THEME_KEY } from "@/lib/store/theme-store";

/**
 * Render a component inside the real provider tree.
 *
 * Console components read live state from the store, so testing them against
 * the actual providers (rather than mocks) is what makes the assertions worth
 * anything — a broken reducer transition fails the component test too.
 */
export function renderWithProviders(ui, options = {}) {
  function Wrapper({ children }) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <DataProvider>{children}</DataProvider>
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Clear persisted state between tests.
 *
 * The store writes to localStorage, which jsdom shares across tests in a
 * file. Without this, archiving a message in one test would leak into the
 * next one's starting state.
 */
export function clearPersistedState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(THEME_KEY);
  } catch {
    // Nothing stored.
  }
}
