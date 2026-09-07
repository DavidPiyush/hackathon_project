import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { reports, reportSections } from "@/lib/data/dashboard";
import { riskTone } from "@/lib/utils/risk";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/DataDisplay";
import { PageHeader, PageBody } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "Reports",
  description:
    "Audit-ready investigation reports that preserve evidence, findings, confidence and chain of custody.",
};

const STATE_TONE = { Final: "safe", Draft: "warn", Archived: "neutral" };

export default function ReportsPage() {
  const finals = reports.filter((report) => report.state === "Final").length;
  const drafts = reports.filter((report) => report.state === "Draft").length;
  const pages = reports.reduce((total, report) => total + report.pages, 0);

  return (
    <>
      <PageHeader
        eyebrow="Output"
        eyebrowIcon="file"
        title="Reports"
        description="A report is the investigation made durable: the evidence that was examined, what it showed, how confident the conclusion is, and what remains unknown."
        actions={
          <>
            <Button icon="plus">Generate report</Button>

            <Button href="/dashboard/investigations" variant="secondary" icon="folder">
              Investigations
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon="file"
            label="Total reports"
            value={reports.length}
            detail="Across all cases"
          />

          <StatCard
            icon="check-circle"
            label="Finalised"
            value={finals}
            detail="Signed off and immutable"
            tone="safe"
          />

          <StatCard
            icon="clock"
            label="Drafts"
            value={drafts}
            detail="Awaiting analyst sign-off"
            tone="warn"
          />

          <StatCard
            icon="book"
            label="Pages produced"
            value={pages}
            detail="Total across all reports"
            tone="info"
          />
        </div>

        {/* ================= REPORT LIST ================= */}
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-line p-5">
            <CardHeader
              icon="layers"
              title="Generated reports"
              subtitle="Newest first"
              level={2}
            />
          </div>

          <ul className="divide-y divide-line">
            {reports.map((report) => {
              const stateTone = STATE_TONE[report.state] ?? "neutral";

              return (
                <li
                  key={report.id}
                  className="flex flex-col gap-4 px-5 py-4 transition duration-200 hover:bg-elevated/50 sm:flex-row sm:items-center"
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                      report.risk > 0
                        ? [
                            resolveTone(riskTone(report.risk)).bg,
                            resolveTone(riskTone(report.risk)).border,
                            resolveTone(riskTone(report.risk)).text,
                          ]
                        : "border-line bg-white/[0.03] text-ink-muted",
                    )}
                  >
                    <Icon name="file" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {report.title}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-faint">
                      <span className="ioc">{report.id}</span>

                      {report.caseId && (
                        <span className="ioc text-accent">{report.caseId}</span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" />
                        {report.generated}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Icon name="user" />
                        {report.author}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Icon name="book" />
                        {report.pages} pages
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={stateTone} size="sm" dot>
                      {report.state}
                    </Badge>

                    {report.risk > 0 && <RiskBadge score={report.risk} />}

                    <Badge tone="neutral" size="sm">
                      {report.format}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <IconButton
                        icon="eye"
                        label={`Preview ${report.id}`}
                        size="sm"
                      />
                      <IconButton
                        icon="download"
                        label={`Download ${report.id}`}
                        size="sm"
                      />
                      <IconButton
                        icon="print"
                        label={`Print ${report.id}`}
                        size="sm"
                        className="no-print"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* ================= WHAT A REPORT CONTAINS ================= */}
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            <CardHeader
              icon="checklist"
              title="What every report contains"
              subtitle="Fixed structure, so two reports can be compared directly"
              level={2}
            />

            <ol className="mt-6 space-y-3">
              {reportSections.map((section, index) => (
                <li
                  key={section.name}
                  className="flex items-start gap-4 rounded-lg border border-line bg-white/[0.02] p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-[10px] font-bold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {section.name}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                      {section.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <CardHeader
                icon="lock"
                title="Why reports are immutable"
                subtitle="Finalised output cannot be edited"
                level={2}
              />

              <p className="mt-5 text-sm leading-6 text-ink-soft">
                A report that can be quietly revised is not evidence. Once
                finalised, a report is content-addressed and appended to the
                case&rsquo;s audit trail. Corrections are issued as a{" "}
                <strong className="font-semibold text-ink">
                  new revision
                </strong>{" "}
                that references the original, so the history of the conclusion
                stays visible.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Content hash recorded at finalisation",
                  "Author and timestamp bound to the document",
                  "Superseded revisions retained, never deleted",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs text-ink-muted"
                  >
                    <Icon
                      name="check"
                      className="mt-0.5 shrink-0 text-[10px] text-safe"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <CardHeader
                icon="share"
                title="Export formats"
                subtitle="Choose by audience"
                level={2}
              />

              <ul className="mt-5 space-y-2.5">
                {[
                  { format: "PDF", detail: "Executive and legal distribution", icon: "file" },
                  { format: "JSON", detail: "Machine-readable evidence bundle", icon: "code" },
                  { format: "STIX 2.1", detail: "Indicator sharing with partners", icon: "nodes" },
                  { format: "CSV", detail: "Indicator list for bulk blocking", icon: "database" },
                ].map((item) => (
                  <li
                    key={item.format}
                    className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon name={item.icon} className="text-[11px]" />
                    </span>

                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-ink">
                        {item.format}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
