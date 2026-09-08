import { requireUser } from "@/lib/auth/dal";

import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { InboxClient } from "@/components/dashboard/InboxClient";

export const metadata = {
  title: "Email Inbox",
  description:
    "Triage incoming messages by risk score, with full forensic evidence one click away.",
};

export default async function InboxPage() {
  await requireUser("/dashboard/inbox");

  return (
    <>
      <PageHeader
        eyebrow="Triage"
        eyebrowIcon="inbox"
        title="Email Inbox"
        description="Messages ranked by risk score. Star, archive, mark read, assign to a case or delete — every action can be undone, and changes persist in this browser."
        actions={
          <>
            {" "}
            <Button href="/dashboard/analysis" icon="upload">
              Submit an email{" "}
            </Button>
            ```
            <Button
              href="/dashboard/investigations"
              variant="secondary"
              icon="folder"
            >
              Investigations
            </Button>
          </>
        }
      />

      <PageBody>
        <InboxClient />
      </PageBody>
    </>
  );
}
