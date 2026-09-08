"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { riskTone } from "@/lib/utils/risk";
import { STATUSES, STATUS_LABELS } from "@/lib/api/schema";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, CardHeader, EmptyState } from "@/components/ui/Card";
import { Badge, RiskBadge, StatusDot } from "@/components/ui/Badge";
import { StatCard, Meter } from "@/components/ui/DataDisplay";
import { SearchInput } from "@/components/ui/Form";
import { FilterPills } from "@/components/ui/Interactive";
import { Popover } from "@/components/ui/Popover";
import { ConfirmInline } from "@/components/ui/Feedback";
import { CaseFormModal } from "@/components/dashboard/CaseFormModal";

/** Tones keyed by the wire status values from the API contract. */
const STATUS_TONES = {
  open: "info",
  active: "critical",
  pending_review: "warn",
  monitoring: "info",
  closed: "safe",
};

const PRIORITY_TONES = {
  critical: "critical",
  high: "high",
  medium: "warn",
  low: "safe",
};

/**
 * Filters use the wire status values from the API contract, with
 * `STATUS_LABELS` for display. `unclosed` is a frontend-only convenience that
 * means "anything not closed".
 */
const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "unclosed", label: "Open" },
  ...STATUSES.filter((status) => status !== "open").map((status) => ({
    id: status,
    label: STATUS_LABELS[status] ?? status,
  })),
];

/** Case list with create, edit, state transitions and delete. */
export function InvestigationsClient() {
  const { investigations, emails, indicators, actions } = useData();

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return investigations.filter((item) => {
      if (filter === "unclosed" && item.status === "closed") {
        return false;
      }

      if (filter !== "all" && filter !== "unclosed" && item.status !== filter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [item.case_id, item.title, item.description, item.analyst]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [investigations, filter, query]);

  const open = investigations.filter((item) => item.status !== "closed");

  /** Live counts, derived from the store rather than the seed. */
  const linkedEmails = (caseId) =>
    emails.filter((email) => email.caseId === caseId && !email.deleted).length;

  const linkedIndicators = (caseId) =>
    indicators.filter((item) => (item.cases ?? []).includes(caseId)).length;

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
            options={STATUS_FILTERS}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case id, title, description or analyst…"
            aria-label="Search investigations"
            className="sm:w-80"
          />

          <Button
            icon="plus"
            onClick={() => setCreating(true)}
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
                onClick={() => setCreating(true)}
              >
                Open a case
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => {
            const stateTone = STATUS_TONES[item.status] ?? "neutral";
            const priorityTone = PRIORITY_TONES[item.priority] ?? "neutral";
            const closed = item.status === "closed";

            return (
              <li key={item.case_id}>
                <Card
                  interactive
                  className={cn("p-6 transition", closed && "opacity-70")}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-accent">
                          {item.case_id}
                        </span>

                        {/* State is a control, not a label */}
                        <Popover
                          align="left"
                          trigger={(props) => (
                            <button
                              type="button"
                              // Names the case, so the control is not just
                              // "Active" with no context.
                              aria-label={`Change state for ${item.case_id} — currently ${STATUS_LABELS[item.status] ?? item.status}`}
                              className="inline-flex items-center gap-1.5 rounded transition duration-200 hover:opacity-80"
                              {...props}
                            >
                              <Badge tone={stateTone} size="sm" dot>
                                {STATUS_LABELS[item.status] ?? item.status}
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
                            {STATUSES.map((option) => (
                              <li key={option}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.setCaseStatus(item.case_id, option)
                                  }
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition duration-200 hover:bg-raise-md"
                                >
                                  <StatusDot
                                    tone={STATUS_TONES[option] ?? "neutral"}
                                  />

                                  {/* Labels, not wire values — nobody should
                                      read "pending_review" in a menu. */}
                                  <span className="text-xs text-ink-soft">
                                    {STATUS_LABELS[option] ?? option}
                                  </span>

                                  {item.status === option && (
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
                        {item.description}
                      </p>

                      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px]">
                        {[
                          { icon: "user", label: "Analyst", value: item.analyst },
                          { icon: "clock", label: "Opened", value: item.opened },
                          { icon: "refresh", label: "Updated", value: item.updated },
                          {
                            icon: "envelope",
                            label: "Messages",
                            value: linkedEmails(item.case_id),
                          },
                          {
                            icon: "fingerprint",
                            label: "Indicators",
                            value: linkedIndicators(item.case_id),
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
                          label={`Edit ${item.case_id}`}
                          size="sm"
                          onClick={() => setEditing(item.case_id)}
                        />

                        <IconButton
                          icon="trash"
                          label={`Delete ${item.case_id}`}
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirming(item.case_id)}
                        />
                      </div>
                    </div>
                  </div>

                  {confirming === item.case_id && (
                    <ConfirmInline
                      question={`Delete ${item.case_id}? Linked messages are detached, not deleted.`}
                      onCancel={() => setConfirming(null)}
                      onConfirm={() => {
                        actions.deleteCase(item.case_id);
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
      {/*
        `key` remounts the form when the target changes, so switching from
        one case to another starts from a fresh draft with no syncing effect.
      */}
      {(creating || editing) && (
        <CaseFormModal
          key={editing ?? "new"}
          open
          mode={editing ? "edit" : "create"}
          initial={
            editing
              ? investigations.find((item) => item.case_id === editing)
              : null
          }
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) {
              actions.updateCase(editing, payload);
              setEditing(null);
            } else {
              actions.createCase(payload);
              setCreating(false);
            }
          }}
        />
      )}
    </div>
  );
}

export default InvestigationsClient;
