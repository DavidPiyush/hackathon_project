import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { ReportsClient } from "@/components/dashboard/ReportsClient";

export const metadata = {
  title: "Reports",
  description:
    "Audit-ready investigation reports that preserve evidence, findings, confidence and chain of custody.",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Output"
        eyebrowIcon="file"
        title="Reports"
        description="A report is the investigation made durable: the evidence examined, what it showed, how confident the conclusion is, and what remains unknown. Generate, finalise or delete — a finalised report is immutable."
        actions={
          <Button href="/dashboard/investigations" variant="secondary" icon="folder">
            Investigations
          </Button>
        }
      />

      <PageBody>
        <ReportsClient />
      </PageBody>
    </>
  );
}
