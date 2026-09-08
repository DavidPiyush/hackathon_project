"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { reportSections } from "@/lib/data/dashboard";
import { riskTone } from "@/lib/utils/risk";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/DataDisplay";
import { Field, Select, SearchInput } from "@/components/ui/Form";
import { FilterPills } from "@/components/ui/Interactive";
import { Modal } from "@/components/ui/Modal";
import { StepProgress, ConfirmInline, Spinner } from "@/components/ui/Feedback";

const STATE_TONE = { Final: "safe", Draft: "warn", Archived: "neutral" };

const STATE_FILTERS = [
  { id: "all", label: "All" },
  { id: "Final", label: "Final" },
  { id: "Draft", label: "Draft" },
];

const FORMATS = ["PDF", "JSON", "STIX 2.1", "CSV"];

/** The stages a report actually goes through, shown while it generates. */
const GENERATION_STEPS = [
  "Collecting evidence records",
  "Rendering authentication analysis",
  "Resolving infrastructure intelligence",
  "Building the correlation graph",
  "Writing confidence and uncertainty",
  "Sealing the chain of custody",
];

export function ReportsClient() {
  const { reports, investigations, actions } = useData();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(-1);
  const [confirming, setConfirming] = useState(null);
  const [draft, setDraft] = useState({ caseId: "", format: "PDF" });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return reports.filter((report) => {
      if (filter !== "all" && report.state !== filter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [report.id, report.title, report.case_id ?? "", report.author]
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [reports, filter, query]);

  /**
   * Report generation is the one place with a modelled delay.
   *
   * In a real deployment this is genuinely slow — it collects every evidence
   * record, re-renders the analysis and seals a custody chain. Showing the
   * stages is more honest than a spinner, and it is what makes the wait
   * legible rather than suspicious.
   */
  const generate = async () => {
    const target = investigations.find((item) => item.case_id === draft.caseId);

    setStep(0);

    for (let index = 0; index < GENERATION_STEPS.length; index += 1) {
      setStep(index);
      await new Promise((resolve) => setTimeout(resolve, 260));
    }

    setStep(GENERATION_STEPS.length);

    actions.createReport({
      title: target
        ? `${target.case_id} — ${target.title}`
        : `Ad-hoc threat summary — ${new Date().toISOString().slice(0, 10)}`,
      caseId: target?.case_id ?? null,
      format: draft.format,
      risk: target?.risk ?? 0,
      pages: target ? 9 + Math.round(target.risk / 12) : 18,
      author: target?.analyst ?? "Analyst",
    });

    setGenerating(false);
    setStep(-1);
    setDraft({ caseId: "", format: "PDF" });
  };

  const finals = reports.filter((report) => report.state === "Final").length;
  const drafts = reports.filter((report) => report.state === "Draft").length;
  const pages = reports.reduce((total, report) => total + report.pages, 0);

  return (
    <div className="space-y-6">
      {/* ================= LIVE STATS ================= */}
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

      {/* ================= CONTROLS ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="text-xs text-ink-faint" />

          <FilterPills
            options={STATE_FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search report id, title, case or author…"
            aria-label="Search reports"
            className="sm:w-80"
          />

          <Button icon="plus" onClick={() => setGenerating(true)}>
            Generate report
          </Button>
        </div>
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

        {filtered.length === 0 ? (
          <EmptyState
            icon="file"
            title={
              reports.length === 0
                ? "No reports yet"
                : "No reports match these filters"
            }
            description="A report turns an investigation into a durable, audit-ready document."
            action={
              <Button size="sm" icon="plus" onClick={() => setGenerating(true)}>
                Generate report
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((report) => {
              const stateTone = STATE_TONE[report.state] ?? "neutral";

              return (
                <li key={report.id}>
                  <div className="flex flex-col gap-4 px-5 py-4 transition duration-200 hover:bg-elevated sm:flex-row sm:items-center">
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                        report.risk > 0
                          ? [
                              resolveTone(riskTone(report.risk)).bg,
                              resolveTone(riskTone(report.risk)).border,
                              resolveTone(riskTone(report.risk)).text,
                            ]
                          : "border-line bg-raise text-ink-muted",
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

                        {report.case_id && (
                          <span className="ioc text-accent">
                            {report.case_id}
                          </span>
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

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <Badge tone={stateTone} size="sm" dot>
                        {report.state}
                      </Badge>

                      {report.risk > 0 && <RiskBadge score={report.risk} />}

                      <Badge tone="neutral" size="sm">
                        {report.format}
                      </Badge>

                      <div className="flex items-center gap-0.5">
                        {report.state === "Draft" && (
                          <IconButton
                            icon="lock"
                            label={`Finalise ${report.id}`}
                            size="sm"
                            onClick={() => actions.finalizeReport(report.id)}
                          />
                        )}

                        <IconButton
                          icon="print"
                          label={`Print ${report.id}`}
                          size="sm"
                          className="no-print"
                          onClick={() => window.print()}
                        />

                        <IconButton
                          icon="trash"
                          label={`Delete ${report.id}`}
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirming(report.id)}
                        />
                      </div>
                    </div>
                  </div>

                  {confirming === report.id && (
                    <div className="px-5 pb-4">
                      <ConfirmInline
                        question={
                          report.state === "Final"
                            ? `${report.id} is finalised. Deleting it removes the signed document from the case.`
                            : `Delete draft ${report.id}?`
                        }
                        onCancel={() => setConfirming(null)}
                        onConfirm={() => {
                          actions.deleteReport(report.id);
                          setConfirming(null);
                        }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
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
                className="flex items-start gap-4 rounded-lg border border-line bg-raise p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-[10px] font-bold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{section.name}</p>
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
              <strong className="font-semibold text-ink">new revision</strong>{" "}
              that references the original.
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
                  className="flex items-center gap-3 rounded-lg border border-line bg-raise px-3 py-2.5"
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

      {/* ================= GENERATE ================= */}
      <Modal
        open={generating}
        onClose={() => {
          // Closing mid-run would leave the progress list orphaned.
          if (step === -1) {
            setGenerating(false);
          }
        }}
        subtitle="Reporting"
        title="Generate an investigation report"
        size="md"
      >
        {step === -1 ? (
          <div className="space-y-5">
            <Field
              id="report-case"
              label="Case"
              hint="Leave unselected for an ad-hoc summary across all activity."
            >
              {(field) => (
                <Select
                  {...field}
                  value={draft.caseId}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      caseId: event.target.value,
                    }))
                  }
                >
                  <option value="">Ad-hoc threat summary</option>

                  {investigations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {item.title}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field id="report-format" label="Format">
              {(field) => (
                <Select
                  {...field}
                  value={draft.format}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      format: event.target.value,
                    }))
                  }
                >
                  {FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <p className="flex items-start gap-2 rounded-lg border border-info/20 bg-info/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
              <Icon name="info" className="mt-0.5 shrink-0 text-info" />
              The report is created as a{" "}
              <strong className="font-semibold text-ink">draft</strong>. Finalise
              it to record a content hash and make it immutable.
            </p>

            <div className="flex items-center gap-3 border-t border-line pt-5">
              <Button onClick={generate} icon="magic">
                Generate
              </Button>

              <Button
                variant="ghost"
                onClick={() => setGenerating(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="flex items-center gap-3 text-sm text-ink-soft">
              <Spinner size="sm" className="text-accent" />
              Assembling the report…
            </p>

            <StepProgress steps={GENERATION_STEPS} activeIndex={step} />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ReportsClient;
