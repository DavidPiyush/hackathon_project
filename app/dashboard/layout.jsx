import { requireUser } from "@/lib/auth/dal";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { DataProvider } from "@/components/providers/DataProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: {
    default: "Console",
    template: "%s — ThreatDetect Console",
  },
  robots: {
    index: false,
    follow: false,
  },
};

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
