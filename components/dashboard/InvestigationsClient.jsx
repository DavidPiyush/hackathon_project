"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { riskTone, clampScore } from "@/lib/utils/risk";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import { Field, Input, Select, Textarea, SearchInput } from "@/components/ui/Form";
import { FilterPills } from "@/components/ui/Interactive";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
import { ConfirmInline } from "@/components/ui/Feedback";

const STATE_TONES = {
  Active: "critical",
  "Pending Review": "warn",
  Monitoring: "info",
  Closed: "safe",
};

const PRIORITY_TONES = {
  critical: "critical",
  high: "high",
  medium: "warn",
  low: "safe",
};

const CASE_STATES = ["Active", "Pending Review", "Monitoring", "Closed"];
const PRIORITIES = ["critical", "high", "medium", "low"];

const STATE_FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "Active", label: "Active" },
  { id: "Pending Review", label: "Pending" },
  { id: "Monitoring", label: "Monitoring" },
  { id: "Closed", label: "Closed" },
];

const EMPTY_DRAFT = {
  title: "",
  summary: "",
  analyst: "SOC Analyst",
  priority: "high",
  risk: "60",
};

/** Case list with create, edit, state transitions and delete. */
export function InvestigationsClient() {
  const { investigations, emails, indicators, actions } = useData();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return investigations.filter((item) => {
      if (filter === "open" && item.state === "Closed") {
        return false;
      }

      if (filter !== "all" && filter !== "open" && item.state !== filter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [item.id, item.title, item.summary, item.analyst]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [investigations, filter, query]);

  const open = investigations.filter((item) => item.state !== "Closed");

  /** Live counts, derived from the store rather than the seed. */
  const linkedEmails = (caseId) =>
    emails.filter((email) => email.caseId === caseId && !email.deleted).length;

  const linkedIndicators = (caseId) =>
    indicators.filter((item) => (item.cases ?? []).includes(caseId)).length;

  const validate = (values) => {
    const next = {};

    if (values.title.trim().length < 6) {
      next.title = "Give the case a title of at least 6 characters.";
    }

    if (values.summary.trim().length < 20) {
      next.summary = "Summarise the case in at least 20 characters.";
    }

    const risk = Number(values.risk);

    if (!Number.isFinite(risk) || risk < 0 || risk > 100) {
      next.risk = "Risk must be a number between 0 and 100.";
    }

    return next;
  };

  const submitCreate = (event) => {
    event.preventDefault();

    const nextErrors = validate(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    actions.createCase({
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      analyst: draft.analyst,
      priority: draft.priority,
      risk: clampScore(draft.risk),
    });

    setDraft(EMPTY_DRAFT);
    setCreating(false);
  };

  const submitEdit = (event) => {
    event.preventDefault();

    const nextErrors = validate(draft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    actions.updateCase(editing, {
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      analyst: draft.analyst,
      priority: draft.priority,
      risk: clampScore(draft.risk),
    });

    setEditing(null);
  };

  const startEdit = (item) => {
    setDraft({
      title: item.title,
      summary: item.summary,
      analyst: item.analyst,
      priority: item.priority,
      risk: String(item.risk),
    });
    setErrors({});
    setEditing(item.id);
  };

  return (
    <div className="space-y-6">
      {/* ================= LIVE STATS ================= */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="folder"
          label="Open cases"
          value={open.length}
          detail="Active, pending or monitoring"
          tone="critical"
        />

        <StatCard
          icon="checklist"
          label="Total cases"
          value={investigations.length}
          detail="Including closed"
        />

        <StatCard
          icon="envelope"
          label="Messages linked"
          value={emails.filter((email) => email.caseId && !email.deleted).length}
          detail="Across all cases"
          tone="info"
        />

        <StatCard
          icon="fingerprint"
          label="Indicators"
          value={
            indicators.filter((item) => (item.cases ?? []).length > 0).length
          }
          detail="Attached to a case"
          tone="warn"
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
            placeholder="Search case id, title, summary or analyst…"
            aria-label="Search investigations"
            className="sm:w-80"
          />

          <Button
            icon="plus"
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setErrors({});
              setCreating(true);
            }}
          >
            Open a case
          </Button>
        </div>
      </div>

      {/* ================= CASE LIST ================= */}
      {filtered.length === 0 ? (
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
                ? "A case collects the messages, indicators and infrastructure that belong to one incident."
                : "Try a different state filter, or clear the search box."
            }
            action={
              <Button
                size="sm"
                icon="plus"
                onClick={() => {
                  setDraft(EMPTY_DRAFT);
                  setCreating(true);
                }}
              >
                Open a case
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => {
            const stateTone = STATE_TONES[item.state] ?? "neutral";
            const priorityTone = PRIORITY_TONES[item.priority] ?? "neutral";
            const closed = item.state === "Closed";

            return (
              <li key={item.id}>
                <Card
                  interactive
                  className={cn("p-6 transition", closed && "opacity-70")}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-accent">
                          {item.id}
                        </span>

                        {/* State is a control, not a label */}
                        <Popover
                          align="left"
                          trigger={(props) => (
                            <button
                              type="button"
                              // Names the case, so the control is not just
                              // "Active" with no context.
                              aria-label={`Change state for ${item.id} — currently ${item.state}`}
                              className="inline-flex items-center gap-1.5 rounded transition duration-200 hover:opacity-80"
                              {...props}
                            >
                              <Badge tone={stateTone} size="sm" dot>
                                {item.state}
                              </Badge>

                              <Icon
                                name="chevron-down"
                                className="text-[8px] text-ink-faint"
                              />
                            </button>
                          )}
                        >
                          <p className="border-b border-line px-4 py-3 text-xs font-semibold text-ink">
                            Move case to
                          </p>

                          <ul className="p-2">
                            {CASE_STATES.map((option) => (
                              <li key={option}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.setCaseState(item.id, option)
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition duration-200 hover:bg-raise-md"
                                >
                                  <StatusDot
                                    tone={STATE_TONES[option] ?? "neutral"}
                                  />

                                  <span className="text-xs text-ink-soft">
                                    {option}
                                  </span>

                                  {item.state === option && (
                                    <Icon
                                      name="check"
                                      className="ml-auto text-accent"
                                    />
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Popover>

                        <Badge tone={priorityTone} size="sm" uppercase>
                          {item.priority}
                        </Badge>
                      </div>

                      <h2 className="mt-3 text-base font-semibold text-ink">
                        {item.title}
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                        {item.summary}
                      </p>

                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                        {[
                          { icon: "user", label: "Analyst", value: item.analyst },
                          { icon: "clock", label: "Opened", value: item.opened },
                          { icon: "refresh", label: "Updated", value: item.updated },
                          {
                            icon: "envelope",
                            label: "Messages",
                            value: linkedEmails(item.id),
                          },
                          {
                            icon: "fingerprint",
                            label: "Indicators",
                            value: linkedIndicators(item.id),
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
                        <RiskBadge score={item.risk} showScore />

                        <span
                          className={cn(
                            "font-mono text-2xl font-bold",
                            resolveTone(riskTone(item.risk)).text,
                          )}
                        >
                          {item.risk}
                        </span>
                      </div>

                      <Meter
                        value={item.risk}
                        tone={riskTone(item.risk)}
                        size="sm"
                        label={`Case risk ${item.risk} of 100`}
                        className="mt-3"
                      />

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          href="/dashboard/analysis"
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                        >
                          Evidence
                        </Button>

                        <IconButton
                          icon="edit"
                          label={`Edit ${item.id}`}
                          size="sm"
                          onClick={() => startEdit(item)}
                        />

                        <IconButton
                          icon="trash"
                          label={`Delete ${item.id}`}
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirming(item.id)}
                        />
                      </div>
                    </div>
                  </div>

                  {confirming === item.id && (
                    <ConfirmInline
                      question={`Delete ${item.id}? Linked messages are detached, not deleted.`}
                      onCancel={() => setConfirming(null)}
                      onConfirm={() => {
                        actions.deleteCase(item.id);
                        setConfirming(null);
                      }}
                      className="mt-5"
                    />
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* ================= CLOSURE RULES ================= */}
      <Card className="p-6">
        <CardHeader
          icon="scale"
          title="When a case can be closed"
          subtitle="The platform blocks closure while evidence is outstanding"
          level={2}
        />

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Every promoted indicator has been acknowledged by an analyst",
            "Authentication and infrastructure stages have both completed",
            "Findings state a confidence level, or are marked unknown",
            "A report has been generated and attached to the case",
          ].map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-3 rounded-lg border border-line bg-raise p-3 text-xs leading-5 text-ink-soft"
            >
              <StatusDot tone="safe" className="mt-1.5" />
              {rule}
            </li>
          ))}
        </ul>
      </Card>

      {/* ================= CREATE / EDIT ================= */}
      <Modal
        open={creating || Boolean(editing)}
        onClose={() => {
          setCreating(false);
          setEditing(null);
          setErrors({});
        }}
        subtitle={editing ? `Editing ${editing}` : "New case"}
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
              />
            )}
          </Field>

          <Field
            id="case-summary"
            label="Summary"
            error={errors.summary}
            hint="What is happening, and why it warranted a case."
            required
          >
            {(field) => (
              <Textarea
                {...field}
                rows={4}
                value={draft.summary}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    summary: event.target.value,
                  }))
                }
                placeholder="A newly registered domain is impersonating a supplier and requesting a change of banking details."
                error={errors.summary}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="case-analyst" label="Analyst">
              {(field) => (
                <Select
                  {...field}
                  value={draft.analyst}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      analyst: event.target.value,
                    }))
                  }
                >
                  {["SOC Analyst", "DFIR Lead", "Threat Intel"].map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field id="case-priority" label="Priority">
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
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field id="case-risk" label="Risk score" error={errors.risk}>
              {(field) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  max={100}
                  value={draft.risk}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      risk: event.target.value,
                    }))
                  }
                  error={errors.risk}
                  className="font-mono"
                />
              )}
            </Field>
          </div>

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Button type="submit" icon={editing ? "save" : "plus"}>
              {editing ? "Save changes" : "Open case"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InvestigationsClient;
