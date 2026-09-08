import { requireUser } from "@/lib/auth/dal";

import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { HeaderAnalyzer } from "@/components/dashboard/HeaderAnalyzer";
import AnalysisClient from "@/components/dashboard/AnalysisClient";

export const metadata = {
  title: "Email Analysis",
  description:
    "Parse suspicious email headers and review the forensic analysis returned by ThreatDetect.",
};

export default async function AnalysisPage() {
  await requireUser("/dashboard/analysis");

  return (
    <>
      <PageHeader
        eyebrow="Forensics"
        eyebrowIcon="search"
        title="Email Analysis"
        description="Paste the raw headers of a suspicious message for immediate parsing, then review the live backend enrichment and forensic assessment."
        meta={[
          { icon: "lock", label: "Processing", value: "Client + backend" },
          { icon: "shield", label: "Engine", value: "ThreatDetect" },
          { icon: "scale", label: "Scoring", value: "Explainable" },
        ]}
        actions={
          <Button href="/dashboard/inbox" variant="secondary" icon="inbox">
            Back to inbox
          </Button>
        }
      />

      <PageBody className="space-y-8">
        <HeaderAnalyzer />
        <AnalysisClient />
      </PageBody>
    </>
  );
}
