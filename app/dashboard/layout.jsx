import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: {
    default: "Console",
    template: "%s — ThreatDetect Console",
  },
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
