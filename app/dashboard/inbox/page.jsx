import { emails } from "@/lib/data/emails";
import { needsReview } from "@/lib/utils/risk";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { InboxClient } from "@/components/dashboard/InboxClient";

export const metadata = {
  title: "Email Inbox",
  description:
    "Triage incoming messages by risk score, with full forensic evidence one click away.",
};

export default function InboxPage() {
  const unread = emails.filter((email) => email.unread).length;
  const highRisk = emails.filter((email) => email.risk >= 75).length;
  const safe = emails.filter((email) => !needsReview(email.risk)).length;

  return (
    <>
      <PageHeader
        eyebrow="Triage"
        eyebrowIcon="inbox"
        title="Email Inbox"
        description="Messages ranked by risk score. Open any message for its authentication results, infrastructure context, extracted indicators and analytical findings."
        actions={
          <>
            <Button href="/dashboard/analysis" icon="upload">
              Submit an email
            </Button>

            <Button href="/dashboard/investigations" variant="secondary" icon="folder">
              Investigations
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="envelope"
            label="Total messages"
            value={emails.length}
            detail="In the current corpus"
          />

          <StatCard
            icon="envelope-open"
            label="Unread"
            value={unread}
            detail="Not yet opened by an analyst"
            tone="info"
          />

          <StatCard
            icon="warning"
            label="High risk"
            value={highRisk}
            detail="Scoring 75 or above"
            tone="critical"
          />

          <StatCard
            icon="shield"
            label="Safe"
            value={safe}
            detail="Scoring below 40"
            tone="safe"
          />
        </div>

        <InboxClient />
      </PageBody>
    </>
  );
}
