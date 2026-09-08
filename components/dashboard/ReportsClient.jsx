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
import { Spinner } from "@/components/ui/Feedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATE_FILTERS = [
  { id: "all", label: "All" },
  { id: "generated", label: "Generated" },
  { id: "empty", label: "No evidence" },
];

const FORMATS = ["PDF", "JSON"];

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function formatBytes(value) {
  if (!value) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = Number(value);
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function severityTone(severity) {
  switch (String(severity || "").toLowerCase()) {
    case "critical":
      return "danger";
    case "high":
      return "danger";
    case "medium":
      return "warn";
    case "low":
      return "info";
    case "informational":
    case "info":
      return "neutral";
    default:
      return "neutral";
  }
}

function classificationTone(classification) {
  const value = String(classification || "").toLowerCase();

  if (
    value.includes("phishing") ||
    value.includes("fraud") ||
    value.includes("malicious") ||
    value.includes("imperson")
  ) {
    return "danger";
  }

  if (value.includes("suspicious")) {
    return "warn";
  }

  if (
    value.includes("legitimate") ||
    value.includes("benign") ||
    value.includes("safe")
  ) {
    return "safe";
  }

  return "neutral";
}

function riskValue(report) {
  return Number(report?.risk?.score ?? 0);
}

function reportHasEvidence(report) {
  return (
    Number(report?.evidence?.manifest?.email_count ?? 0) > 0 ||
    Number(report?.evidence?.manifest?.finding_count ?? 0) > 0 ||
    Number(report?.evidence?.manifest?.ioc_count ?? 0) > 0
  );
}

function normaliseReport(response) {
  if (!response) return null;

  if (response.success && response.data) {
    return response.data;
  }

  if (response.data) {
    return response.data;
  }

  return response;
}

function downloadJson(report) {
  const payload = JSON.stringify(report, null, 2);
  const blob = new Blob([payload], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `forensic-report-${report?.report?.case_id || "case"}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function ReportsClient() {
  const { investigations } = useData();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [draft, setDraft] = useState({
    caseId: "",
    format: "PDF",
  });

  const [error, setError] = useState("");

  const reports = selectedReport ? [selectedReport] : [];

  const filteredInvestigations = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return investigations.filter((item) => {
      if (!needle) return true;

      return [
        item.id,
        item.title,
        item.description,
        item.status,
        item.priority,
        item.analyst,
      ].some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(needle),
      );
    });
  }, [investigations, query]);

  const currentReportHasEvidence = selectedReport
    ? reportHasEvidence(selectedReport)
    : false;

  const reportRisk = selectedReport ? riskValue(selectedReport) : 0;

  const emailCount = Number(
    selectedReport?.investigation_summary?.email_count ??
      selectedReport?.evidence?.manifest?.email_count ??
      0,
  );

  const findingCount = Number(
    selectedReport?.investigation_summary?.finding_count ??
      selectedReport?.evidence?.manifest?.finding_count ??
      0,
  );

  const iocCount = Number(
    selectedReport?.investigation_summary?.ioc_count ??
      selectedReport?.evidence?.manifest?.ioc_count ??
      0,
  );

  const criticalCount = Number(
    selectedReport?.investigation_summary?.critical_findings ?? 0,
  );

  const highCount = Number(
    selectedReport?.investigation_summary?.high_findings ?? 0,
  );

  const generatedReport = selectedReport?.report;
  const caseData = selectedReport?.case;
  const riskData = selectedReport?.risk;
  const evidence = selectedReport?.evidence;
  const findingSummary = selectedReport?.finding_summary;
  const iocs = selectedReport?.iocs;
  const emails = selectedReport?.emails ?? [];
  const authentication = selectedReport?.authentication ?? [];
  const relayPaths = selectedReport?.relay_paths ?? [];
  const analysis = selectedReport?.analysis ?? [];
  const findings = selectedReport?.findings ?? [];

  const reportState = selectedReport
    ? currentReportHasEvidence
      ? "Generated"
      : "No evidence"
    : null;

  const stateTone =
    reportState === "Generated"
      ? "safe"
      : reportState === "No evidence"
        ? "warn"
        : "neutral";

  const loadReport = async () => {
    if (!draft.caseId) {
      setError("Select an investigation first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/reports/${encodeURIComponent(draft.caseId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        throw new Error("The report service returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.error ||
            `Report generation failed with HTTP ${response.status}.`,
        );
      }

      const report = normaliseReport(data);

      if (!report?.report || !report?.case) {
        throw new Error(
          "The report response does not contain the expected report structure.",
        );
      }

      setSelectedReport(report);
      setGenerating(false);
      setDraft((previous) => ({
        ...previous,
        caseId: draft.caseId,
      }));
    } catch (requestError) {
      console.error("[REPORTS] Failed to generate report:", requestError);
      setError(
        requestError?.message || "Unable to generate the forensic report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!selectedReport?.report?.case_id) return;

    const url = `${API_URL}/reports/${encodeURIComponent(
      selectedReport.report.case_id,
    )}/pdf`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const exportJson = () => {
    if (!selectedReport) return;
    downloadJson(selectedReport);
  };

  const openGenerator = () => {
    setError("");
    setGenerating(true);
  };

  const closeGenerator = () => {
    if (!loading) {
      setGenerating(false);
      setError("");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= LIVE STATS ================= */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="file"
          label="Report status"
          value={selectedReport ? "Ready" : "—"}
          detail={
            selectedReport
              ? `Case ${selectedReport.report?.case_id}`
              : "Generate from an investigation"
          }
          tone={selectedReport ? "safe" : "neutral"}
        />

        <StatCard
          icon="mail"
          label="Emails analysed"
          value={emailCount}
          detail="Evidence records"
        />

        <StatCard
          icon="alert-triangle"
          label="Findings"
          value={findingCount}
          detail={`${criticalCount} critical · ${highCount} high`}
          tone={findingCount > 0 ? "warn" : "neutral"}
        />

        <StatCard
          icon="database"
          label="IOCs"
          value={iocCount}
          detail="Correlated indicators"
          tone={iocCount > 0 ? "info" : "neutral"}
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
            placeholder="Search investigation, case or analyst…"
            aria-label="Search investigations"
            className="sm:w-80"
          />

          <Button icon="plus" onClick={openGenerator}>
            Generate report
          </Button>
        </div>
      </div>

      {/* ================= CURRENT REPORT ================= */}

      {!selectedReport ? (
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-line p-5">
            <CardHeader
              icon="file"
              title="Forensic report"
              subtitle="Backend-generated investigation report"
              level={2}
            />
          </div>

          <EmptyState
            icon="file"
            title="No report generated"
            description="Select an investigation and generate a report from the live forensic evidence stored by ThreatDetect."
            action={
              <Button size="sm" icon="plus" onClick={openGenerator}>
                Generate report
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* ================= REPORT HEADER ================= */}

          <Card className="overflow-hidden">
            <div className="border-b border-line bg-elevated/40 p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={stateTone} size="sm" dot>
                      {reportState}
                    </Badge>

                    <Badge tone="neutral" size="sm">
                      {generatedReport?.report_type ||
                        "email_forensic_investigation"}
                    </Badge>

                    {riskData?.classification && (
                      <Badge
                        tone={classificationTone(riskData.classification)}
                        size="sm"
                      >
                        {riskData.classification}
                      </Badge>
                    )}
                  </div>

                  <h2 className="mt-4 truncate text-xl font-semibold text-ink">
                    {caseData?.title || "Forensic Investigation Report"}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-faint">
                    <span className="ioc text-accent">
                      {generatedReport?.case_id}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Icon name="clock" />
                      {formatDate(generatedReport?.generated_at)}
                    </span>

                    {caseData?.analyst && (
                      <span className="flex items-center gap-1.5">
                        <Icon name="user" />
                        {caseData.analyst}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    icon="download"
                    onClick={downloadPdf}
                  >
                    Download PDF
                  </Button>

                  <Button variant="ghost" icon="code" onClick={exportJson}>
                    Export JSON
                  </Button>
                </div>
              </div>
            </div>

            {/* Risk banner */}

            <div className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    Risk assessment
                  </span>

                  {riskData?.severity && (
                    <Badge tone={severityTone(riskData.severity)} size="sm" dot>
                      {riskData.severity}
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-4">
                  <span className="font-mono text-4xl font-bold text-ink">
                    {reportRisk}
                  </span>

                  <span className="pb-1 text-sm text-ink-muted">
                    / 100 risk score
                  </span>

                  {reportRisk > 0 && <RiskBadge score={reportRisk} />}
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
                  {riskData?.explanation ||
                    "No risk explanation was returned for this investigation."}
                </p>
              </div>

              <div
                className={cn(
                  "flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border",
                  reportRisk > 0
                    ? [
                        resolveTone(riskTone(reportRisk)).bg,
                        resolveTone(riskTone(reportRisk)).border,
                        resolveTone(riskTone(reportRisk)).text,
                      ]
                    : "border-line bg-raise text-ink-muted",
                )}
              >
                <div className="text-center">
                  <div className="font-mono text-2xl font-bold">
                    {reportRisk}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest">
                    Risk
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ================= SUMMARY ================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              icon="mail"
              label="Emails"
              value={emailCount}
              detail="Investigated"
            />

            <StatCard
              icon="alert-triangle"
              label="Findings"
              value={findingCount}
              detail="Security findings"
              tone={findingCount ? "warn" : "neutral"}
            />

            <StatCard
              icon="database"
              label="IOCs"
              value={iocCount}
              detail="Indicators"
              tone={iocCount ? "info" : "neutral"}
            />

            <StatCard
              icon="shield"
              label="Critical"
              value={criticalCount}
              detail="Critical findings"
              tone={criticalCount ? "danger" : "neutral"}
            />

            <StatCard
              icon="alert-circle"
              label="High"
              value={highCount}
              detail="High findings"
              tone={highCount ? "warn" : "neutral"}
            />
          </div>

          {/* ================= CASE + EVIDENCE ================= */}

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-6">
              <CardHeader
                icon="folder"
                title="Case details"
                subtitle="Investigation metadata"
                level={2}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Detail label="Case ID" value={caseData?.case_id} mono />
                <Detail label="Title" value={caseData?.title} />
                <Detail label="Priority" value={caseData?.priority} />
                <Detail label="Status" value={caseData?.status} />
                <Detail label="Analyst" value={caseData?.analyst} />
                <Detail
                  label="Created"
                  value={formatDate(caseData?.created_at)}
                />
              </div>

              {caseData?.description && (
                <div className="mt-5 rounded-lg border border-line bg-raise p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    {caseData.description}
                  </p>
                </div>
              )}

              {caseData?.notes && (
                <div className="mt-4 rounded-lg border border-line bg-raise p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                    Analyst notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    {caseData.notes}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <CardHeader
                icon="lock"
                title="Evidence & chain of custody"
                subtitle="Integrity information returned by the forensic engine"
                level={2}
              />

              <div className="mt-6 space-y-4">
                <HashRow
                  label="Report hash"
                  value={generatedReport?.report_hash}
                />

                <HashRow label="Case ID" value={evidence?.manifest?.case_id} />

                <HashRow
                  label="Evidence count"
                  value={String(evidence?.manifest?.email_count ?? 0)}
                />

                <HashRow
                  label="Finding count"
                  value={String(evidence?.manifest?.finding_count ?? 0)}
                />

                <HashRow
                  label="IOC count"
                  value={String(evidence?.manifest?.ioc_count ?? 0)}
                />
              </div>

              <div className="mt-5 rounded-lg border border-info/20 bg-info/[0.05] p-4">
                <div className="flex items-start gap-2.5">
                  <Icon name="info" className="mt-0.5 shrink-0 text-info" />

                  <div>
                    <p className="text-xs font-semibold text-ink">
                      Evidence preservation
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                      {evidence?.chain_of_custody?.preservation_note ||
                        "Original evidence hashes should be retained with the original source material."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ================= EMAIL EVIDENCE ================= */}

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-5">
              <CardHeader
                icon="mail"
                title="Email evidence"
                subtitle={`${emails.length} email record${
                  emails.length === 1 ? "" : "s"
                } returned by the investigation`}
                level={2}
              />
            </div>

            {emails.length === 0 ? (
              <EmptyState
                icon="mail"
                title="No email evidence"
                description="This investigation currently contains no investigated email records."
              />
            ) : (
              <div className="divide-y divide-line">
                {emails.map((email, index) => (
                  <div
                    key={
                      email.id ||
                      email.gmail_message_id ||
                      email.message_id ||
                      index
                    }
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {email.subject || "Untitled email"}
                        </p>

                        <p className="mt-1 text-xs text-ink-muted">
                          {email.sender || "Unknown sender"}
                        </p>
                      </div>

                      {email.analyzed_at && (
                        <span className="shrink-0 text-[10px] text-ink-faint">
                          Analysed {formatDate(email.analyzed_at)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Detail
                        label="Message ID"
                        value={email.message_id}
                        mono
                      />

                      <Detail
                        label="Gmail message"
                        value={email.gmail_message_id}
                        mono
                      />

                      <Detail label="Reply-To" value={email.reply_to} />

                      <Detail label="Return-Path" value={email.return_path} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ================= AUTHENTICATION ================= */}

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-5">
              <CardHeader
                icon="shield-check"
                title="Sender authentication"
                subtitle="SPF, DKIM and DMARC results"
                level={2}
              />
            </div>

            {authentication.length === 0 ? (
              <EmptyState
                icon="shield"
                title="No authentication records"
                description="No SPF, DKIM or DMARC authentication summary was returned."
              />
            ) : (
              <div className="divide-y divide-line">
                {authentication.map((item, index) => (
                  <div
                    key={item.gmail_message_id || index}
                    className="grid gap-4 p-5 sm:grid-cols-3"
                  >
                    <AuthResult label="SPF" value={item.spf} />

                    <AuthResult label="DKIM" value={item.dkim} />

                    <AuthResult label="DMARC" value={item.dmarc} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ================= RELAY PATH ================= */}

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-5">
              <CardHeader
                icon="route"
                title="SMTP relay path"
                subtitle="Observed Received-chain infrastructure"
                level={2}
              />
            </div>

            {relayPaths.length === 0 ? (
              <EmptyState
                icon="route"
                title="No relay path"
                description="No relay-path data was returned for this investigation."
              />
            ) : (
              <div className="divide-y divide-line">
                {relayPaths.map((path, index) => (
                  <div key={index} className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-[10px] font-bold text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs font-semibold text-ink">
                        Relay path {index + 1}
                      </span>
                    </div>

                    <pre className="overflow-x-auto rounded-lg border border-line bg-raise p-4 font-mono text-[10px] leading-5 text-ink-muted">
                      {typeof path === "string"
                        ? path
                        : JSON.stringify(path, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ================= FINDINGS + IOC ================= */}

          <div className="grid gap-5 xl:grid-cols-2">
            <Card padded={false} className="overflow-hidden">
              <div className="border-b border-line p-5">
                <CardHeader
                  icon="alert-triangle"
                  title="Security findings"
                  subtitle={`${findingSummary?.total ?? findings.length} finding${
                    (findingSummary?.total ?? findings.length) === 1 ? "" : "s"
                  }`}
                  level={2}
                />
              </div>

              {findings.length === 0 ? (
                <EmptyState
                  icon="check-circle"
                  title="No findings"
                  description="The report contains no persisted security findings."
                />
              ) : (
                <div className="divide-y divide-line">
                  {findings.map((finding, index) => (
                    <div key={finding.id || index} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {finding.type || "Security finding"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-ink-muted">
                            {finding.description || "No description provided."}
                          </p>
                        </div>

                        <Badge
                          tone={severityTone(finding.severity)}
                          size="sm"
                          dot
                        >
                          {finding.severity || "unknown"}
                        </Badge>
                      </div>

                      {finding.evidence && (
                        <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-raise p-3 font-mono text-[10px] leading-5 text-ink-faint">
                          {typeof finding.evidence === "string"
                            ? finding.evidence
                            : JSON.stringify(finding.evidence, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padded={false} className="overflow-hidden">
              <div className="border-b border-line p-5">
                <CardHeader
                  icon="database"
                  title="Indicators of compromise"
                  subtitle={`${iocs?.items?.length ?? 0} indicators`}
                  level={2}
                />
              </div>

              {!iocs?.items?.length ? (
                <EmptyState
                  icon="database"
                  title="No IOCs"
                  description="No indicators of compromise were persisted for this investigation."
                />
              ) : (
                <div className="divide-y divide-line">
                  {iocs.items.map((ioc, index) => (
                    <div
                      key={`${ioc.type}-${ioc.value}-${index}`}
                      className="flex items-start gap-3 p-4"
                    >
                      <Badge tone="neutral" size="sm">
                        {ioc.type || "unknown"}
                      </Badge>

                      <span className="min-w-0 break-all font-mono text-[11px] text-ink-soft">
                        {ioc.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ================= ANALYSIS ================= */}

          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-line p-5">
              <CardHeader
                icon="activity"
                title="Forensic analysis"
                subtitle="Analysis summaries returned by the backend"
                level={2}
              />
            </div>

            {analysis.length === 0 ? (
              <EmptyState
                icon="activity"
                title="No analysis summary"
                description="No persisted analysis summary was returned for this case."
              />
            ) : (
              <div className="divide-y divide-line">
                {analysis.map((item, index) => (
                  <div key={index} className="p-5">
                    <pre className="overflow-x-auto rounded-lg border border-line bg-raise p-4 font-mono text-[10px] leading-5 text-ink-muted">
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ================= RISK DETAILS ================= */}

          <Card className="p-6">
            <CardHeader
              icon="bar-chart"
              title="Risk analysis"
              subtitle="Backend risk model output"
              level={2}
            />

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <Detail
                label="Score"
                value={`${riskData?.score ?? 0} / 100`}
                mono
              />

              <Detail label="Severity" value={riskData?.severity} />

              <Detail label="Classification" value={riskData?.classification} />
            </div>

            {riskData?.contributing_signals?.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  Contributing signals
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {riskData.contributing_signals.map((signal, index) => (
                    <Badge key={index} tone="neutral" size="sm">
                      {typeof signal === "string"
                        ? signal
                        : JSON.stringify(signal)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {riskData?.score_breakdown && (
              <div className="mt-5 rounded-lg border border-line bg-raise p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                  Score breakdown
                </p>

                <pre className="mt-3 overflow-x-auto font-mono text-[10px] leading-5 text-ink-muted">
                  {JSON.stringify(riskData.score_breakdown, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          {/* ================= ATTRIBUTION BOUNDARY ================= */}

          <Card className="border-info/20 bg-info/[0.035] p-6">
            <div className="flex items-start gap-3">
              <Icon name="map-pin" className="mt-0.5 shrink-0 text-info" />

              <div>
                <p className="text-sm font-semibold text-ink">
                  Attribution and geolocation boundary
                </p>

                <p className="mt-2 max-w-4xl text-xs leading-6 text-ink-muted">
                  Infrastructure geolocation and threat intelligence identify
                  observable network infrastructure and support correlation.
                  They do not, by themselves, establish a person's physical
                  identity or an exact attacker location.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ================= WHAT A REPORT CONTAINS ================= */}

      {!selectedReport && (
        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            <CardHeader
              icon="checklist"
              title="What every report contains"
              subtitle="Fixed structure returned by the forensic reporting engine"
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
                title="Evidence integrity"
                subtitle="Backend-generated content hash"
                level={2}
              />

              <p className="mt-5 text-sm leading-6 text-ink-soft">
                Each generated report contains a SHA-256 report hash derived
                from the investigation evidence available at generation time.
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Report hash returned by the backend",
                  "Original evidence hashes preserved",
                  "Generation timestamp recorded",
                  "Case identity bound to the report",
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
                subtitle="Available from the current API"
                level={2}
              />

              <ul className="mt-5 space-y-2.5">
                {[
                  {
                    format: "PDF",
                    detail: "Forensic report generated by ReportLab",
                    icon: "file",
                  },
                  {
                    format: "JSON",
                    detail: "Machine-readable report response",
                    icon: "code",
                  },
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
      )}

      {/* ================= GENERATE ================= */}

      <Modal
        open={generating}
        onClose={closeGenerator}
        subtitle="Reporting"
        title="Generate an investigation report"
        size="md"
      >
        <div className="space-y-5">
          <Field
            id="report-case"
            label="Case"
            hint="Choose an investigation. The backend will generate the report from its persisted evidence."
          >
            {(field) => (
              <Select
                {...field}
                value={draft.caseId}
                disabled={loading}
                onChange={(event) => {
                  setError("");

                  setDraft((previous) => ({
                    ...previous,
                    caseId: event.target.value,
                  }));
                }}
              >
                <option value="">Select an investigation</option>

                {filteredInvestigations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} — {item.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            id="report-format"
            label="Format"
            hint="PDF uses the backend forensic report generator. JSON uses the live API response."
          >
            {(field) => (
              <Select
                {...field}
                value={draft.format}
                disabled={loading}
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

          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/[0.06] p-3">
              <div className="flex items-start gap-2">
                <Icon
                  name="alert-triangle"
                  className="mt-0.5 shrink-0 text-danger"
                />

                <p className="text-xs leading-5 text-ink-soft">{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-info/20 bg-info/[0.06] p-3">
            <div className="flex items-start gap-2">
              <Icon name="info" className="mt-0.5 shrink-0 text-info" />

              <p className="text-[11px] leading-5 text-ink-soft">
                This action reads the selected case from the existing forensic
                reporting API. No local report record is created and no
                simulated generation delay is used.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Button
              onClick={loadReport}
              icon={loading ? undefined : "magic"}
              disabled={loading || !draft.caseId}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating…
                </>
              ) : (
                "Generate"
              )}
            </Button>

            <Button variant="ghost" onClick={closeGenerator} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   SUPPORTING UI
   ============================================================ */

function Detail({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>

      <p
        className={cn(
          "mt-1 break-words text-xs text-ink-soft",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function HashRow({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-raise p-3">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
        {label}
      </p>

      <p className="mt-1 break-all font-mono text-[10px] leading-5 text-ink-muted">
        {value || "—"}
      </p>
    </div>
  );
}

function AuthResult({ label, value }) {
  const result =
    typeof value === "object" && value !== null ? value.result : value;

  const detail =
    typeof value === "object" && value !== null ? value.detail : null;

  const normalized = String(result || "unknown").toLowerCase();

  let tone = "neutral";

  if (
    normalized === "pass" ||
    normalized === "passed" ||
    normalized === "success"
  ) {
    tone = "safe";
  } else if (
    normalized === "fail" ||
    normalized === "failed" ||
    normalized === "invalid"
  ) {
    tone = "danger";
  } else if (normalized === "softfail" || normalized === "neutral") {
    tone = "warn";
  }

  return (
    <div className="rounded-lg border border-line bg-raise p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink">{label}</span>

        <Badge tone={tone} size="sm" dot>
          {result || "unknown"}
        </Badge>
      </div>

      {detail && (
        <p className="mt-2 text-[10px] leading-5 text-ink-faint">{detail}</p>
      )}
    </div>
  );
}

export default ReportsClient;
