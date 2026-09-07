import { ToastProvider } from "@/components/providers/ToastProvider";
import { DataProvider } from "@/components/providers/DataProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: {
    default: "Console",
    template: "%s — ThreatDetect Console",
  },
};

/**
 * Console layout.
 *
 * Toasts wrap the data store because every mutation reports through them, and
 * both sit above the shell so any interactive island inside a page — even one
 * rendered through a server component — can reach them.
 */
export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <DataProvider>
        <DashboardShell>{children}</DashboardShell>
      </DataProvider>
    </ToastProvider>
  );
}
