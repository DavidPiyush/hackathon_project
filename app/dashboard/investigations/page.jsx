import { requireUser } from "@/lib/auth/dal";

import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { InvestigationsClient } from "@/components/dashboard/InvestigationsClient";

export const metadata = {
  title: "Investigations",
  description:
    "Open cases, their current state, assigned analyst and correlated evidence.",
};

export default async function InvestigationsPage() {
  await requireUser("/dashboard/investigations");

  return (
    <>
      <PageHeader
        eyebrow="Case Management"
        eyebrowIcon="folder"
        title="Investigations"
        description="Every case links the messages, findings, indicators and infrastructure that belong to it. Cases persist in the investigation database and provide the evidence source for forensic reporting."
        actions={
          <Button href="/dashboard/reports" variant="secondary" icon="file">
            Reports
          </Button>
        }
      />

      <PageBody>
        <InvestigationsClient />
      </PageBody>
    </>
  );
}
