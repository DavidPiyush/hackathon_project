"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { riskTone } from "@/lib/utils/risk";

import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import {
  Field,
  Input,
  Select,
  Textarea,
  SearchInput,
} from "@/components/ui/Form";
import { FilterPills } from "@/components/ui/Interactive";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
import { ConfirmInline, Spinner } from "@/components/ui/Feedback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const STATUS_OPTIONS = ["open", "investigating", "resolved", "closed"];

const PRIORITIES = ["critical", "high", "medium", "low"];

const STATUS_TONES = {
  open: "info",
  investigating: "critical",
  resolved: "safe",
  closed: "neutral",
};

const PRIORITY_TONES = {
  critical: "critical",
  high: "high",
  medium: "warn",
  low: "safe",
};

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "investigating", label: "Investigating" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

const EMPTY_DRAFT = {
  title: "",
  description: "",
  analyst: "",
  priority: "medium",
};

function normalizeListResponse(payload) {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.investigations)) {
    return payload.investigations;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.data?.investigations)) {
    return payload.data.investigations;
  }

  return [];
}

function normalizeSingleResponse(payload) {
  if (!payload) return null;

  if (payload.data?.investigation) {
    return payload.data.investigation;
  }

  if (payload.investigation) {
    return payload.investigation;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload;
}

function formatStatus(status) {
  const value = String(status || "open");

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

function getRisk(item) {
  const value = Number(item?.risk_score ?? 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function getEmailCount(item) {
  return Number(item?.email_count ?? 0);
}

function getFindingCount(item) {
  return Number(item?.finding_count ?? 0);
}

function getCaseId(item) {
  return item?.case_id || item?.id || "";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
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

export function InvestigationsClient() {
  const [investigations, setInvestigations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [confirming, setConfirming] = useState(null);

  const [saving, setSaving] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);
  const [changingStatus, setChangingStatus] = useState(null);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState({});

  const loadInvestigations = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const payload = await apiRequest("/investigations");

      const rows = normalizeListResponse(payload);

      setInvestigations(rows);
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Failed to load cases:", requestError);

      setError(requestError?.message || "Unable to load investigations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvestigations();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return investigations.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      if (filter !== "all" && status !== filter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [
        item.case_id,
        item.title,
        item.description,
        item.analyst,
        item.priority,
        item.status,
        item.classification,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [investigations, filter, query]);

  const openCases = useMemo(
    () =>
      investigations.filter((item) =>
        ["open", "investigating"].includes(
          String(item.status || "").toLowerCase(),
        ),
      ),
    [investigations],
  );

  const activeInvestigations = useMemo(
    () =>
      investigations.filter(
        (item) => String(item.status || "").toLowerCase() === "investigating",
      ),
    [investigations],
  );

  const totalEmails = useMemo(
    () => investigations.reduce((sum, item) => sum + getEmailCount(item), 0),
    [investigations],
  );

  const totalFindings = useMemo(
    () => investigations.reduce((sum, item) => sum + getFindingCount(item), 0),
    [investigations],
  );

  const validate = (values) => {
    const next = {};

    if (values.title.trim().length < 3) {
      next.title = "Give the investigation a title of at least 3 characters.";
    }

    if (values.description.trim().length < 5) {
      next.description = "Provide a short description of the incident.";
    }

    if (!PRIORITIES.includes(values.priority)) {
      next.priority = "Select a valid priority.";
    }

    return next;
  };

  const openCreate = () => {
    setDraft({
      ...EMPTY_DRAFT,
    });

    setErrors({});
    setError("");
    setEditing(null);
    setCreating(true);
  };

  const submitCreate = async (event) => {
    event.preventDefault();

    const nextErrors = validate(draft);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = await apiRequest("/investigations", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title.trim(),
          description: draft.description.trim(),
          priority: draft.priority,
          analyst: draft.analyst.trim() || null,
        }),
      });

      const created = normalizeSingleResponse(payload);

      if (created?.case_id) {
        setInvestigations((previous) => [
          created,
          ...previous.filter((item) => item.case_id !== created.case_id),
        ]);
      } else {
        await loadInvestigations({ silent: true });
      }

      setCreating(false);
      setDraft({
        ...EMPTY_DRAFT,
      });
      setErrors({});
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Create failed:", requestError);

      setError(requestError?.message || "Unable to create the investigation.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditing(getCaseId(item));

    setCreating(false);

    setDraft({
      title: item.title || "",
      description: item.description || "",
      analyst: item.analyst || "",
      priority: item.priority || "medium",
    });

    setErrors({});
    setError("");
  };

  const submitEdit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(draft);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!editing) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = await apiRequest(
        `/investigations/${encodeURIComponent(editing)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: draft.title.trim(),
            description: draft.description.trim(),
            priority: draft.priority,
            analyst: draft.analyst.trim() || null,
          }),
        },
      );

      const updated = normalizeSingleResponse(payload);

      if (updated?.case_id) {
        setInvestigations((previous) =>
          previous.map((item) => (item.case_id === editing ? updated : item)),
        );
      } else {
        await loadInvestigations({ silent: true });
      }

      setEditing(null);
      setErrors({});
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Update failed:", requestError);

      setError(requestError?.message || "Unable to update the investigation.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (caseId, status) => {
    if (!caseId || !STATUS_OPTIONS.includes(status)) {
      return;
    }

    setChangingStatus(caseId);
    setError("");

    try {
      const payload = await apiRequest(
        `/investigations/${encodeURIComponent(caseId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        },
      );

      const updated = normalizeSingleResponse(payload);

      if (updated?.case_id) {
        setInvestigations((previous) =>
          previous.map((item) => (item.case_id === caseId ? updated : item)),
        );
      } else {
        await loadInvestigations({ silent: true });
      }
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Status update failed:", requestError);

      setError(requestError?.message || "Unable to change case status.");
    } finally {
      setChangingStatus(null);
    }
  };

  const deleteCase = async (caseId) => {
    if (!caseId) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiRequest(`/investigations/${encodeURIComponent(caseId)}`, {
        method: "DELETE",
      });

      setInvestigations((previous) =>
        previous.filter((item) => item.case_id !== caseId),
      );

      setConfirming(null);
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Delete failed:", requestError);

      setError(requestError?.message || "Unable to delete the investigation.");
    } finally {
      setSaving(false);
    }
  };

  const openCase = async (caseId) => {
    if (!caseId) {
      return;
    }

    setLoadingCase(true);
    setError("");

    try {
      const payload = await apiRequest(
        `/investigations/${encodeURIComponent(caseId)}`,
      );

      const complete = payload?.data || payload;

      setViewing(complete);
    } catch (requestError) {
      console.error("[INVESTIGATIONS] Failed to load case:", requestError);

      setError(
        requestError?.message || "Unable to load investigation details.",
      );
    } finally {
      setLoadingCase(false);
    }
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setCreating(false);
    setEditing(null);
    setErrors({});
  };

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
                Investigation service error
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
          icon="folder"
          label="Open cases"
          value={openCases.length}
          detail="Open + investigating"
          tone="critical"
        />

        <StatCard
          icon="activity"
          label="Investigating"
          value={activeInvestigations.length}
          detail="Currently under analysis"
          tone="info"
        />

        <StatCard
          icon="envelope"
          label="Emails linked"
          value={totalEmails}
          detail="Persisted evidence"
          tone="info"
        />

        <StatCard
          icon="alert-triangle"
          label="Findings"
          value={totalFindings}
          detail="Across all cases"
          tone={totalFindings > 0 ? "warn" : "neutral"}
        />
      </div>

<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="text-xs text-ink-faint" />

          <FilterPills
            options={STATUS_FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case, title, analyst or status…"
            aria-label="Search investigations"
            className="sm:w-80"
          />

          <Button
            variant="secondary"
            icon="refresh"
            disabled={loading || refreshing}
            onClick={() => loadInvestigations({ silent: true })}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>

          <Button icon="plus" onClick={openCreate}>
            Open a case
          </Button>
        </div>
      </div>

{loading ? (
        <Card className="p-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Spinner />

            <p className="text-sm font-medium text-ink">
              Loading investigations
            </p>

            <p className="text-xs text-ink-faint">
              Reading cases from the investigation database…
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="folder"
            title={
              investigations.length === 0
                ? "No investigations yet"
                : "No cases match these filters"
            }
            description={
              investigations.length === 0
                ? "Create your first investigation. The case will be persisted in PostgreSQL and can later become the source for a forensic report."
                : "Try a different status filter or clear the search box."
            }
            action={
              investigations.length === 0 ? (
                <Button size="sm" icon="plus" onClick={openCreate}>
                  Open a case
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => {
            const caseId = getCaseId(item);
            const status = String(item.status || "open").toLowerCase();

            const priority = String(item.priority || "medium").toLowerCase();

            const risk = getRisk(item);
            const emailCount = getEmailCount(item);
            const findingCount = getFindingCount(item);

            const statusTone = STATUS_TONES[status] || "neutral";

            const priorityTone = PRIORITY_TONES[priority] || "neutral";

            return (
              <li key={caseId}>
                <Card
                  interactive
                  className={cn(
                    "p-6 transition",
                    status === "closed" && "opacity-70",
                  )}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

<div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-accent">
                          {caseId}
                        </span>

<Popover
                          align="left"
                          trigger={(props) => (
                            <button
                              type="button"
                              aria-label={`Change status for ${caseId}`}
                              disabled={changingStatus === caseId}
                              className="inline-flex items-center gap-1.5 rounded transition hover:opacity-80 disabled:opacity-50"
                              {...props}
                            >
                              <Badge tone={statusTone} size="sm" dot>
                                {formatStatus(status)}
                              </Badge>

                              <Icon
                                name="chevron-down"
                                className="text-[8px] text-ink-faint"
                              />
                            </button>
                          )}
                        >
                          <div className="min-w-44">
                            <p className="border-b border-line px-4 py-3 text-xs font-semibold text-ink">
                              Change status
                            </p>

                            <ul className="p-2">
                              {STATUS_OPTIONS.map((option) => (
                                <li key={option}>
                                  <button
                                    type="button"
                                    disabled={changingStatus === caseId}
                                    onClick={() => changeStatus(caseId, option)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-raise-md disabled:opacity-50"
                                  >
                                    <StatusDot
                                      tone={STATUS_TONES[option] || "neutral"}
                                    />

                                    <span className="text-xs text-ink-soft">
                                      {formatStatus(option)}
                                    </span>

                                    {status === option && (
                                      <Icon
                                        name="check"
                                        className="ml-auto text-accent"
                                      />
                                    )}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>

                        <Badge tone={priorityTone} size="sm" uppercase>
                          {priority}
                        </Badge>

                        {item.classification && (
                          <Badge
                            tone={
                              String(item.classification)
                                .toLowerCase()
                                .includes("phish")
                                ? "critical"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {item.classification}
                          </Badge>
                        )}
                      </div>

                      <h2 className="mt-3 text-base font-semibold text-ink">
                        {item.title || "Untitled investigation"}
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                        {item.description ||
                          "No investigation description provided."}
                      </p>

                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                        {[
                          {
                            icon: "user",
                            label: "Analyst",
                            value: item.analyst || "Unassigned",
                          },
                          {
                            icon: "clock",
                            label: "Opened",
                            value: formatDate(item.created_at),
                          },
                          {
                            icon: "refresh",
                            label: "Updated",
                            value: formatDate(item.updated_at),
                          },
                          {
                            icon: "envelope",
                            label: "Emails",
                            value: emailCount,
                          },
                          {
                            icon: "alert-triangle",
                            label: "Findings",
                            value: findingCount,
                          },
                        ].map((meta) => (
                          <div
                            key={meta.label}
                            className="flex items-center gap-2"
                          >
                            <Icon
                              name={meta.icon}
                              className="text-[10px] text-ink-faint"
                            />

                            <dt className="text-ink-faint">{meta.label}</dt>

                            <dd className="font-mono font-semibold text-ink-soft">
                              {meta.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

<div className="shrink-0 lg:w-56">
                      <div className="flex items-center justify-between gap-3">
                        <RiskBadge score={risk} showScore />

                        <span
                          className={cn(
                            "font-mono text-2xl font-bold",
                            resolveTone(riskTone(risk)).text,
                          )}
                        >
                          {risk}
                        </span>
                      </div>

                      <Meter
                        value={risk}
                        tone={riskTone(risk)}
                        size="sm"
                        label={`Case risk ${risk} of 100`}
                        className="mt-3"
                      />

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          icon="eye"
                          onClick={() => openCase(caseId)}
                        >
                          View
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          icon="edit"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          href={`/dashboard/reports?caseId=${encodeURIComponent(
                            caseId,
                          )}`}
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          icon="file"
                        >
                          Report
                        </Button>

                        <IconButton
                          icon="trash"
                          label={`Delete ${caseId}`}
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirming(caseId)}
                        />
                      </div>
                    </div>
                  </div>

{confirming === caseId && (
                    <ConfirmInline
                      question={`Delete ${caseId}? Stored case data and linked evidence will be affected according to the backend delete operation.`}
                      onCancel={() => setConfirming(null)}
                      onConfirm={() => deleteCase(caseId)}
                      className="mt-5"
                    />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

<Card className="border-accent/15 bg-accent/[0.025] p-6">
        <div className="flex items-start gap-3">
          <Icon name="database" className="mt-0.5 shrink-0 text-accent" />

          <div>
            <p className="text-sm font-semibold text-ink">
              Investigation is the source of truth
            </p>

            <p className="mt-2 max-w-4xl text-xs leading-6 text-ink-muted">
              Cases are persisted by the backend rather than in browser state.
              Email analysis can attach evidence, findings and indicators to a
              case. The Reports module then builds the forensic report from
              those persisted records.
            </p>
          </div>
        </div>
      </Card>

<Modal
        open={creating || Boolean(editing)}
        onClose={closeForm}
        subtitle={editing ? `Editing ${editing}` : "New investigation"}
        title={editing ? "Update investigation" : "Open an investigation"}
        size="md"
      >
        <form
          onSubmit={editing ? submitEdit : submitCreate}
          className="space-y-5"
          noValidate
        >
          <Field id="case-title" label="Title" error={errors.title} required>
            {(field) => (
              <Input
                {...field}
                value={draft.title}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="Invoice fraud targeting finance"
                error={errors.title}
                disabled={saving}
              />
            )}
          </Field>

          <Field
            id="case-description"
            label="Description"
            error={errors.description}
            hint="Describe what happened and why this case was opened."
            required
          >
            {(field) => (
              <Textarea
                {...field}
                rows={5}
                value={draft.description}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="A suspicious email appears to impersonate a supplier and requests a change of banking details."
                error={errors.description}
                disabled={saving}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="case-analyst" label="Analyst">
              {(field) => (
                <Input
                  {...field}
                  value={draft.analyst}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      analyst: event.target.value,
                    }))
                  }
                  placeholder="DFIR Analyst"
                  disabled={saving}
                />
              )}
            </Field>

            <Field id="case-priority" label="Priority" error={errors.priority}>
              {(field) => (
                <Select
                  {...field}
                  value={draft.priority}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      priority: event.target.value,
                    }))
                  }
                  disabled={saving}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          {!editing && (
            <div className="rounded-lg border border-info/20 bg-info/[0.05] p-4">
              <div className="flex items-start gap-2.5">
                <Icon name="info" className="mt-0.5 shrink-0 text-info" />

                <p className="text-[11px] leading-5 text-ink-muted">
                  The backend generates the case ID and starts the investigation
                  with status{" "}
                  <span className="font-mono text-ink-soft">open</span>. Risk
                  and classification are not manually entered here; they can be
                  updated from actual email analysis.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Button
              type="submit"
              icon={saving ? undefined : editing ? "save" : "plus"}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Open case"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

<Modal
        open={Boolean(viewing) || loadingCase}
        onClose={() => {
          if (!loadingCase) {
            setViewing(null);
          }
        }}
        subtitle="Investigation evidence"
        title={
          viewing?.investigation?.title || viewing?.title || "Investigation"
        }
        size="lg"
      >
        {loadingCase ? (
          <div className="flex min-h-56 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner />

              <p className="text-sm text-ink-soft">Loading case evidence…</p>
            </div>
          </div>
        ) : viewing ? (
          <CaseDetails
            investigation={viewing.investigation || viewing}
            emails={viewing.emails || []}
            findings={viewing.findings || []}
            iocs={viewing.iocs || []}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function CaseDetails({ investigation, emails, findings, iocs }) {
  const risk = getRisk(investigation);

  return (
    <div className="space-y-5">

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Case ID" value={investigation.case_id} mono />

        <Detail label="Status" value={formatStatus(investigation.status)} />

        <Detail label="Priority" value={investigation.priority} />

        <Detail label="Risk" value={`${risk} / 100`} mono />
      </div>

{investigation.description && (
        <div className="rounded-lg border border-line bg-raise p-4">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
            Description
          </p>

          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {investigation.description}
          </p>
        </div>
      )}

<div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Emails" value={emails.length} icon="envelope" />

        <MiniStat
          label="Findings"
          value={findings.length}
          icon="alert-triangle"
        />

        <MiniStat label="IOCs" value={iocs.length} icon="fingerprint" />
      </div>

<EvidenceSection
        title="Investigated emails"
        count={emails.length}
        icon="envelope"
      >
        {emails.length === 0 ? (
          <p className="text-xs text-ink-faint">
            No email evidence has been attached to this case.
          </p>
        ) : (
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div
                key={email.id || email.gmail_message_id || index}
                className="rounded-lg border border-line bg-raise p-3"
              >
                <p className="text-xs font-medium text-ink">
                  {email.subject || "Untitled email"}
                </p>

                <p className="mt-1 text-[10px] text-ink-muted">
                  {email.sender || "Unknown sender"}
                </p>

                {email.gmail_message_id && (
                  <p className="mt-2 break-all font-mono text-[9px] text-ink-faint">
                    Gmail: {email.gmail_message_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </EvidenceSection>

<EvidenceSection
        title="Security findings"
        count={findings.length}
        icon="alert-triangle"
      >
        {findings.length === 0 ? (
          <p className="text-xs text-ink-faint">
            No findings have been persisted for this case.
          </p>
        ) : (
          <div className="space-y-2">
            {findings.map((finding, index) => (
              <div
                key={finding.id || index}
                className="rounded-lg border border-line bg-raise p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-ink">
                      {finding.type || "Security finding"}
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-ink-muted">
                      {finding.description || "No description available."}
                    </p>
                  </div>

                  <Badge
                    tone={
                      PRIORITY_TONES[
                        String(finding.severity || "low").toLowerCase()
                      ] || "neutral"
                    }
                    size="sm"
                  >
                    {finding.severity || "unknown"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </EvidenceSection>

<EvidenceSection
        title="Indicators of compromise"
        count={iocs.length}
        icon="fingerprint"
      >
        {iocs.length === 0 ? (
          <p className="text-xs text-ink-faint">
            No IOCs have been persisted for this case.
          </p>
        ) : (
          <div className="space-y-2">
            {iocs.map((ioc, index) => (
              <div
                key={`${ioc.type}-${ioc.value}-${index}`}
                className="flex items-start gap-3 rounded-lg border border-line bg-raise p-3"
              >
                <Badge tone="neutral" size="sm">
                  {ioc.type || "unknown"}
                </Badge>

                <span className="min-w-0 break-all font-mono text-[10px] text-ink-soft">
                  {ioc.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </EvidenceSection>
    </div>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
        {label}
      </p>

      <p className={cn("mt-1 text-xs text-ink-soft", mono && "font-mono")}>
        {value || "—"}
      </p>
    </div>
  );
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="rounded-lg border border-line bg-raise p-4">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="text-[10px] text-accent" />

        <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-faint">
          {label}
        </span>
      </div>

      <p className="mt-2 font-mono text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function EvidenceSection({ title, count, icon, children }) {
  return (
    <section className="rounded-xl border border-line bg-raise p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="text-xs text-accent" />

          <h3 className="text-xs font-semibold text-ink">{title}</h3>
        </div>

        <Badge tone="neutral" size="sm">
          {count}
        </Badge>
      </div>

      {children}
    </section>
  );
}

export default InvestigationsClient;
