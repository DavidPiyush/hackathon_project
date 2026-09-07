import { requireUser } from "@/lib/auth/dal";
import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { InvestigationsClient } from "@/components/dashboard/InvestigationsClient";

export const metadata = {
  title: "Investigations",
  description:
    "Open cases, their current state, assigned analyst and correlated evidence.",
};

/**
 * Investigations page.
 *
 * Case counts and linked-evidence totals are computed in the client island
 * from live store state, because assigning a message to a case has to update
 * both the case row and the stat tiles at once.
 */
export default async function InvestigationsPage() {
  // Authoritative check. Proxy is optimistic; this is what actually gates
  // the page, per the Next.js auth guidance on layouts.
  await requireUser("/dashboard/investigations");

  return (
    <>
      <PageHeader
        eyebrow="Case Management"
        eyebrowIcon="folder"
        title="Investigations"
        description="Every case links the messages, indicators and infrastructure that belong to it, so a conclusion can be traced back to the evidence that produced it. Open, edit, move or close a case — all of it persists in this browser."
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
