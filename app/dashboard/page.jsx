import { requireUser } from "@/lib/auth/dal";
import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { OverviewClient } from "@/components/dashboard/OverviewClient";

export const metadata = {
  title: "Overview",
  description:
    "Platform health, detection volume and threat activity across the last seven days.",
};

export default async function DashboardOverviewPage() {
  // Authoritative check. Proxy is optimistic; this is what actually gates
  // the page, per the Next.js auth guidance on layouts.
  await requireUser("/dashboard");

  return (
    <>
      <PageHeader
        eyebrow="Security Console"
        eyebrowIcon="gauge"
        title="Overview"
        description="Detection volume, threat composition and service health for the current reporting window."
        meta={[
          { icon: "clock", label: "Window", value: "Last 7 days" },
          { icon: "refresh", label: "Updated", value: "2 min ago" },
          { icon: "shield", label: "Engine", value: "v4.2" },
        ]}
        actions={
          <>
            <Button href="/dashboard/analysis" icon="upload">
              Analyze an email
            </Button>

            <Button href="/dashboard/reports" variant="secondary" icon="file">
              Reports
            </Button>
          </>
        }
      />

      <PageBody>
        <OverviewClient />
      </PageBody>
    </>
  );
}
