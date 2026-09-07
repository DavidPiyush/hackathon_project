import { requireUser } from "@/lib/auth/dal";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { DataProvider } from "@/components/providers/DataProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: {
    default: "Console",
    template: "%s — ThreatDetect Console",
  },
  // The console is behind auth; keep it out of search results.
  robots: { index: false, follow: false },
};

/**
 * Console layout.
 *
 * Resolves the signed-in user so the shell can render the account menu.
 * `requireUser()` is memoised with React `cache`, so the pages below calling
 * it again cost nothing.
 *
 * The Next docs warn that a layout check is not sufficient on its own —
 * layouts do not re-render on navigation and do not stop nested segments from
 * rendering. So each page calls `requireUser()` itself; this call exists to
 * get the identity for the chrome, not to be the gate.
 *
 * Toasts wrap the data store because every mutation reports through them, and
 * both sit above the shell so any interactive island inside a page can reach
 * them.
 */
export default async function DashboardLayout({ children }) {
  const user = await requireUser("/dashboard");

  return (
    <ToastProvider>
      <DataProvider>
        <DashboardShell user={user}>{children}</DashboardShell>
      </DataProvider>
    </ToastProvider>
  );
}
