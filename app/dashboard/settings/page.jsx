import { requireUser } from "@/lib/auth/dal";

import { Button } from "@/components/ui/Button";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";
import { SettingsPanels } from "@/components/dashboard/SettingsPanels";

export const metadata = {
  title: "Settings",
  description:
    "Tune detection thresholds, enrichment sources, notifications and evidence handling.",
};

export default async function SettingsPage() {
  await requireUser("/dashboard/settings");

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        eyebrowIcon="gear"
        title="Settings"
        description="How aggressively the engine escalates, which enrichment sources it queries, what reaches an analyst, and how evidence is retained."
        meta={[
          { icon: "user", label: "Scope", value: "Workspace" },
          { icon: "key", label: "Role", value: "Tier 2 Analyst" },
        ]}
        actions={
          <Button href="/dashboard/help" variant="secondary" icon="help">
            Documentation{" "}
          </Button>
        }
      />

      <PageBody>
        <SettingsPanels />
      </PageBody>
    </>
  );
}
