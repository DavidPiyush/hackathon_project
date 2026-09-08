"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { riskTone } from "@/lib/utils/risk";

import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import { Field, Select, SearchInput } from "@/components/ui/Form";
import { FilterPills } from "@/components/ui/Interactive";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Feedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATE_FILTERS = [
  { id: "all", label: "All" },
  { id: "generated", label: "Generated" },
];

const EMPTY_DRAFT = {
  caseId: "",
};

function getCaseId(item) {
  return item?.case_id || item?.id || "";
}

function getRisk(report) {
  const score = Number(report?.risk?.score ?? report?.case?.risk_score ?? 0);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, score));
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  const text = String(value);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.detail ||
        payload?.error ||
        `Request failed with HTTP ${response.status}`,
    );
  }

  return payload;
}

function normalizeReport(payload) {
  if (!payload) {
    return null;
  }

  if (payload.data) {
    return payload.data;
  }

  return payload;
}

export function ReportsClient() {
  const [investigations, setInvestigations] = useState([]);

  const [reports, setReports] = useState([]);

  const [loadingInvestigations, setLoadingInvestigations] = useState(true);

  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  const [query, setQuery] = useState("");

  const [generating, setGenerating] = useState(false);

  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const [selectedReport, setSelectedReport] = useState(null);

  const loadInvestigations = async () => {
    setLoadingInvestigations(true);
    setError("");

    try {
      const payload = await apiRequest("/investigations");

      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.investigations)
          ? payload.investigations
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setInvestigations(rows);
    } catch (requestError) {
      console.error("[REPORTS] Failed to load investigations:", requestError);

      setError(requestError?.message || "Unable to load investigations.");
    } finally {
      setLoadingInvestigations(false);
    }
  };

  useEffect(() => {
    loadInvestigations();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const caseId = params.get("caseId");

    if (!caseId) {
      return;
    }

    setDraft((previous) => ({
      ...previous,
      caseId,
    }));
  }, []);

  const filteredReports = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return reports.filter((report) => {
      if (filter === "generated") {
        // Every item in this list represents a real backend
        // report that was generated during this session.
        if (!report?.report?.report_hash) {
          return false;
        }
      }

      if (!needle) {
        return true;
      }

      const caseData = report.case || {};
      const reportData = report.report || {};

      return [
        reportData.case_id,
        reportData.report_hash,
        caseData.title,
        caseData.analyst,
        caseData.classification,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [reports, filter, query]);

  const generateReport = async () => {
    if (!draft.caseId) {
      setError("Select an investigation before generating a forensic report.");
      return;
    }

    setLoadingReport(true);
    setError("");

    try {
      const payload = await apiRequest(
        `/reports/${encodeURIComponent(draft.caseId)}`,
      );

      const report = normalizeReport(payload);

      if (!report?.report) {
        throw new Error("The backend returned an invalid report structure.");
      }

      setReports((previous) => [
        report,
        ...previous.filter(
          (item) => item?.report?.report_hash !== report?.report?.report_hash,
        ),
      ]);

      setSelectedReport(report);

      setGenerating(false);

      setDraft(EMPTY_DRAFT);
    } catch (requestError) {
      console.error("[REPORTS] Report generation failed:", requestError);

      setError(
        requestError?.message || "Unable to generate the forensic report.",
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadPdf = async (caseId) => {
    if (!caseId) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/reports/${encodeURIComponent(caseId)}/pdf`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/pdf",
          },
        },
      );

      if (!response.ok) {
        let message = `PDF request failed with HTTP ${response.status}`;

        try {
          const payload = await response.json();

          message = payload?.detail || payload?.error || message;
        } catch {
          // Keep HTTP error.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = `forensic-report-${caseId}.pdf`;

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      console.error("[REPORTS] PDF download failed:", requestError);

      setError(requestError?.message || "Unable to download the PDF report.");
    }
  };

  const downloadJson = (report) => {
    if (!report) {
      return;
    }

    const caseId =
      report?.report?.case_id || report?.case?.case_id || "investigation";

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = `forensic-report-${caseId}.json`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(url);
  };

  const totalReports = reports.length;

  const totalEmails = reports.reduce(
    (sum, report) =>
      sum +
      Number(
        report?.investigation_summary?.email_count ??
          report?.evidence?.manifest?.email_count ??
          0,
      ),
    0,
  );

  const totalFindings = reports.reduce(
    (sum, report) =>
      sum +
      Number(
        report?.investigation_summary?.finding_count ??
          report?.finding_summary?.total ??
          0,
      ),
    0,
  );

  const totalIocs = reports.reduce(
    (sum, report) =>
      sum +
      Number(
        report?.investigation_summary?.ioc_count ??
          report?.evidence?.manifest?.ioc_count ??
          0,
      ),
    0,
  );

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-danger/20 bg-danger/[0.04] p-4">
          <div className="flex items-start gap-3">
            <Icon
              name="alert-triangle"
              className="mt-0.5 shrink-0 text-danger"
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink">
                Report service error
              </p>

              <p className="mt-1 text-xs leading-5 text-ink-muted">{error}</p>
            </div>

            <IconButton
              icon="x"
              label="Dismiss error"
              size="sm"
              onClick={() => setError("")}
            />
          </div>
        </Card>
      )}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="file"
          label="Reports generated"
          value={totalReports}
          detail="Generated from backend evidence"
          tone="info"
        />

        <StatCard
          icon="envelope"
          label="Emails covered"
          value={totalEmails}
          detail="Persisted investigation evidence"
        />

        <StatCard
          icon="alert-triangle"
          label="Findings covered"
          value={totalFindings}
          detail="Security findings in reports"
          tone={totalFindings > 0 ? "warn" : "neutral"}
        />

        <StatCard
          icon="fingerprint"
          label="IOCs covered"
          value={totalIocs}
          detail="Indicators from investigations"
          tone={totalIocs > 0 ? "critical" : "neutral"}
        />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterPills
          options={STATE_FILTERS}
          value={filter}
          onChange={setFilter}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case, report hash or analyst…"
            aria-label="Search generated reports"
            className="sm:w-80"
          />

          <Button
            icon="plus"
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setError("");
              setGenerating(true);
            }}
          >
            Generate report
          </Button>
        </div>
      </div>
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-line p-5">
          <CardHeader
            icon="layers"
            title="Generated forensic reports"
            subtitle="Reports generated from the current investigation database"
            level={2}
          />
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState
            icon="file"
            title={
              reports.length === 0
                ? "No reports generated yet"
                : "No reports match these filters"
            }
            description={
              reports.length === 0
                ? "Select an investigation and generate a report. The backend will build it from the persisted case, email, finding and IOC records."
                : "Try a different search term."
            }
            action={
              reports.length === 0 ? (
                <Button
                  size="sm"
                  icon="plus"
                  onClick={() => {
                    setDraft(EMPTY_DRAFT);
                    setGenerating(true);
                  }}
                >
                  Generate report
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filteredReports.map((report, index) => {
              const caseData = report.case || {};
              const reportData = report.report || {};

              const caseId =
                reportData.case_id || caseData.case_id || `report-${index}`;

              const risk = getRisk(report);

              return (
                <li key={reportData.report_hash || caseId}>
                  <div className="flex flex-col gap-4 px-5 py-5 transition hover:bg-elevated lg:flex-row lg:items-center">
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                        risk > 0
                          ? [
                              resolveTone(riskTone(risk)).bg,
                              resolveTone(riskTone(risk)).border,
                              resolveTone(riskTone(risk)).text,
                            ]
                          : "border-line bg-raise text-ink-muted",
                      )}
                    >
                      <Icon name="file" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">
                          {caseId}
                        </span>

                        <Badge tone="safe" size="sm" dot>
                          Generated
                        </Badge>

                        {caseData.priority && (
                          <Badge
                            tone={
                              caseData.priority === "critical"
                                ? "critical"
                                : caseData.priority === "high"
                                  ? "high"
                                  : caseData.priority === "medium"
                                    ? "warn"
                                    : "safe"
                            }
                            size="sm"
                          >
                            {caseData.priority}
                          </Badge>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-ink">
                        {caseData.title || "Email forensic investigation"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[10px] text-ink-faint">
                        <span>{formatStatus(caseData.status)}</span>

                        <span>Analyst: {caseData.analyst || "Unassigned"}</span>

                        <span>
                          Generated: {formatDate(reportData.generated_at)}
                        </span>

                        <span>
                          Emails:{" "}
                          {report?.investigation_summary?.email_count ?? 0}
                        </span>

                        <span>
                          Findings:{" "}
                          {report?.investigation_summary?.finding_count ?? 0}
                        </span>

                        <span>
                          IOCs: {report?.investigation_summary?.ioc_count ?? 0}
                        </span>
                      </div>

                      <p className="mt-2 break-all font-mono text-[9px] text-ink-faint">
                        SHA-256: {reportData.report_hash || "Unavailable"}
                      </p>
                    </div>
                    <div className="shrink-0 lg:w-40">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-widest text-ink-faint">
                          Risk
                        </span>

                        <span className="font-mono text-sm font-bold text-ink">
                          {risk}/100
                        </span>
                      </div>

                      <Meter
                        value={risk}
                        tone={riskTone(risk)}
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="eye"
                        onClick={() => setSelectedReport(report)}
                      >
                        View
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon="download"
                        onClick={() => downloadPdf(caseId)}
                      >
                        PDF
                      </Button>

                      <IconButton
                        icon="code"
                        label={`Download JSON for ${caseId}`}
                        size="sm"
                        onClick={() => downloadJson(report)}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <CardHeader
            icon="shield"
            title="Backend-generated evidence"
            subtitle="No fabricated report metadata"
            level={2}
          />

          <ul className="mt-5 space-y-3">
            {[
              "Investigation record",
              "Persisted email evidence",
              "Sender authentication",
              "SMTP relay path",
              "Security findings",
              "Indicators of compromise",
              "Risk and confidence",
              "Evidence hashes",
              "Chain of custody",
              "Report SHA-256 hash",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-xs text-ink-muted"
              >
                <Icon name="check" className="text-[10px] text-safe" />

                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <CardHeader
            icon="lock"
            title="Evidence integrity"
            subtitle="Content-addressed report generation"
            level={2}
          />

          <p className="mt-5 text-sm leading-6 text-ink-soft">
            Every generated report includes a SHA-256 report hash derived from
            the investigation, email evidence, findings and indicators. The
            report is generated from persisted backend evidence rather than
            browser-only state.
          </p>

          <div className="mt-5 rounded-lg border border-info/20 bg-info/[0.05] p-4">
            <div className="flex items-start gap-3">
              <Icon name="info" className="mt-0.5 text-info" />

              <p className="text-[11px] leading-5 text-ink-muted">
                Reports are currently generated on demand. Your existing backend
                does not expose a persistent report table or report-finalisation
                API, so the frontend does not pretend that those operations
                exist.
              </p>
            </div>
          </div>
        </Card>
      </div>
      <Modal
        open={generating}
        onClose={() => {
          if (!loadingReport) {
            setGenerating(false);
          }
        }}
        subtitle="Forensic reporting"
        title="Generate investigation report"
        size="md"
      >
        <div className="space-y-5">
          <Field
            id="report-case"
            label="Investigation"
            hint="The selected case becomes the source of the forensic report."
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
                disabled={loadingReport}
              >
                <option value="">Select an investigation</option>

                {investigations.map((item) => {
                  const caseId = getCaseId(item);

                  return (
                    <option key={caseId} value={caseId}>
                      {caseId} — {item.title || "Untitled investigation"}
                    </option>
                  );
                })}
              </Select>
            )}
          </Field>

          <div className="rounded-lg border border-accent/20 bg-accent/[0.04] p-4">
            <div className="flex items-start gap-3">
              <Icon name="file" className="mt-0.5 shrink-0 text-accent" />

              <div>
                <p className="text-xs font-semibold text-ink">
                  Real forensic report
                </p>

                <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                  ThreatDetect will request the selected investigation from the
                  backend report generator. The response is assembled from
                  PostgreSQL evidence, findings and IOCs.
                </p>
              </div>
            </div>
          </div>

          {draft.caseId && (
            <div className="rounded-lg border border-line bg-raise p-3">
              <p className="text-[9px] uppercase tracking-widest text-ink-faint">
                Selected case
              </p>

              <p className="mt-1 font-mono text-xs font-semibold text-accent">
                {draft.caseId}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Button
              onClick={generateReport}
              icon={loadingReport ? undefined : "file"}
              disabled={loadingReport || !draft.caseId || loadingInvestigations}
            >
              {loadingReport ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating…
                </>
              ) : (
                "Generate forensic report"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setGenerating(false)}
              disabled={loadingReport}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        subtitle={selectedReport?.report?.case_id || "Forensic report"}
        title={selectedReport?.case?.title || "Email forensic investigation"}
        size="lg"
      >
        {selectedReport && (
          <ReportViewer
            report={selectedReport}
            onPdf={() =>
              downloadPdf(
                selectedReport?.report?.case_id ||
                  selectedReport?.case?.case_id,
              )
            }
            onJson={() => downloadJson(selectedReport)}
          />
        )}
      </Modal>
    </div>
  );
}

function ReportViewer({ report, onPdf, onJson }) {
  const caseData = report.case || {};
  const reportData = report.report || {};
  const risk = getRisk(report);

  const authentication = report.authentication || [];

  const relayPaths = report.relay_paths || [];

  const findings = report.findings || [];

  const iocs = report.iocs?.items || [];

  const evidenceHashes =
    report.evidence?.chain_of_custody?.evidence_hashes || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" icon="download" onClick={onPdf}>
          Download PDF
        </Button>

        <Button size="sm" variant="secondary" icon="code" onClick={onJson}>
          Download JSON
        </Button>
      </div>
      <section className="rounded-xl border border-line bg-raise p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
              Executive summary
            </p>

            <h3 className="mt-2 text-lg font-semibold text-ink">
              {caseData.title || "Email forensic investigation"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {caseData.description ||
                "No investigation description was provided."}
            </p>
          </div>

          <div className="shrink-0">
            <RiskBadge score={risk} showScore />

            <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-ink-faint">
              {report.risk?.severity || caseData.risk_severity || "unknown"}
            </p>
          </div>
        </div>
      </section>
      <section>
        <SectionTitle icon="folder" title="Case details" />

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Case ID" value={caseData.case_id} mono />

          <Detail label="Status" value={formatStatus(caseData.status)} />

          <Detail label="Priority" value={caseData.priority} />

          <Detail label="Analyst" value={caseData.analyst || "Unassigned"} />
        </div>
      </section>
      <section>
        <SectionTitle icon="lock" title="Report integrity" />

        <div className="mt-3 rounded-lg border border-line bg-raise p-4">
          <p className="text-[9px] uppercase tracking-widest text-ink-faint">
            Report SHA-256
          </p>

          <p className="mt-2 break-all font-mono text-[10px] leading-5 text-ink-soft">
            {reportData.report_hash || "Unavailable"}
          </p>

          <p className="mt-4 text-[9px] uppercase tracking-widest text-ink-faint">
            Generated
          </p>

          <p className="mt-1 text-xs text-ink-soft">
            {formatDate(reportData.generated_at)}
          </p>
        </div>
      </section>
      <section>
        <SectionTitle icon="database" title="Evidence summary" />

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MiniStat
            icon="envelope"
            label="Emails"
            value={report.investigation_summary?.email_count ?? 0}
          />

          <MiniStat
            icon="alert-triangle"
            label="Findings"
            value={report.investigation_summary?.finding_count ?? 0}
          />

          <MiniStat
            icon="fingerprint"
            label="IOCs"
            value={report.investigation_summary?.ioc_count ?? 0}
          />
        </div>
      </section>
      <section>
        <SectionTitle icon="shield-check" title="Sender authentication" />

        <div className="mt-3 overflow-x-auto rounded-lg border border-line">
          {authentication.length === 0 ? (
            <p className="p-4 text-xs text-ink-faint">
              No authentication records are available.
            </p>
          ) : (
            <table className="w-full min-w-[600px] text-left">
              <thead className="border-b border-line bg-raise">
                <tr>
                  <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-ink-faint">
                    Gmail Message
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-ink-faint">
                    SPF
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-ink-faint">
                    DKIM
                  </th>

                  <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-ink-faint">
                    DMARC
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {authentication.map((item, index) => (
                  <tr key={item.gmail_message_id || index}>
                    <td className="max-w-52 truncate px-4 py-3 font-mono text-[9px] text-ink-soft">
                      {item.gmail_message_id || "—"}
                    </td>

                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {item.spf || "—"}
                    </td>

                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {item.dkim || "—"}
                    </td>

                    <td className="px-4 py-3 text-xs text-ink-soft">
                      {item.dmarc || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <section>
        <SectionTitle icon="route" title="SMTP relay path" />

        <div className="mt-3 space-y-2">
          {relayPaths.length === 0 ? (
            <p className="rounded-lg border border-line bg-raise p-4 text-xs text-ink-faint">
              No relay path records are available.
            </p>
          ) : (
            relayPaths.map((path, index) => (
              <div
                key={index}
                className="rounded-lg border border-line bg-raise p-4"
              >
                <p className="font-mono text-[10px] text-ink-soft">
                  {JSON.stringify(path, null, 2)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
      <section>
        <SectionTitle icon="alert-triangle" title="Security findings" />

        <div className="mt-3 space-y-2">
          {findings.length === 0 ? (
            <p className="rounded-lg border border-line bg-raise p-4 text-xs text-ink-faint">
              No security findings were recorded.
            </p>
          ) : (
            findings.map((finding, index) => (
              <div
                key={finding.id || index}
                className="rounded-lg border border-line bg-raise p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">
                      {finding.type || "Security finding"}
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                      {finding.description || "No description available."}
                    </p>
                  </div>

                  <Badge
                    tone={
                      finding.severity === "critical"
                        ? "critical"
                        : finding.severity === "high"
                          ? "high"
                          : finding.severity === "medium"
                            ? "warn"
                            : "neutral"
                    }
                    size="sm"
                  >
                    {finding.severity || "unknown"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      <section>
        <SectionTitle icon="fingerprint" title="Indicators of compromise" />

        <div className="mt-3 space-y-2">
          {iocs.length === 0 ? (
            <p className="rounded-lg border border-line bg-raise p-4 text-xs text-ink-faint">
              No indicators of compromise were recorded.
            </p>
          ) : (
            iocs.map((ioc, index) => (
              <div
                key={`${ioc.type}-${ioc.value}-${index}`}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-raise p-3"
              >
                <Badge tone="neutral" size="sm">
                  {ioc.type || "unknown"}
                </Badge>

                <span className="min-w-0 break-all font-mono text-[10px] text-ink-soft">
                  {ioc.value || "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
      <section>
        <SectionTitle icon="shield" title="Chain of custody" />

        <div className="mt-3 rounded-lg border border-line bg-raise p-4">
          <p className="text-xs leading-6 text-ink-muted">
            The report preserves hashes for the evidence available to the
            investigation and records the generated report hash.
          </p>

          {evidenceHashes.length > 0 && (
            <div className="mt-4 space-y-2">
              {evidenceHashes.map((hash, index) => (
                <div
                  key={`${hash}-${index}`}
                  className="rounded-md border border-line bg-elevated p-3"
                >
                  <p className="text-[9px] uppercase tracking-widest text-ink-faint">
                    Evidence {index + 1}
                  </p>

                  <p className="mt-1 break-all font-mono text-[9px] text-ink-soft">
                    {hash}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="rounded-lg border border-warn/20 bg-warn/[0.04] p-4">
        <div className="flex items-start gap-3">
          <Icon name="map-pin" className="mt-0.5 shrink-0 text-warn" />

          <div>
            <p className="text-xs font-semibold text-ink">
              Attribution boundary
            </p>

            <p className="mt-1 text-[11px] leading-5 text-ink-muted">
              Infrastructure geolocation and threat intelligence identify
              observable infrastructure and support correlation. They do not
              establish physical identity or an exact attacker location.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} className="text-xs text-accent" />

      <h3 className="text-xs font-semibold text-ink">{title}</h3>
    </div>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div className="rounded-lg border border-line bg-raise p-3">
      <p className="text-[9px] uppercase tracking-widest text-ink-faint">
        {label}
      </p>

      <p className={cn("mt-1 text-xs text-ink-soft", mono && "font-mono")}>
        {value || "—"}
      </p>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-line bg-raise p-4">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="text-[10px] text-accent" />

        <span className="text-[9px] uppercase tracking-widest text-ink-faint">
          {label}
        </span>
      </div>

      <p className="mt-2 font-mono text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default ReportsClient;
