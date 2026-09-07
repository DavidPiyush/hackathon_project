"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { emails, emailCategories, inboxFilters } from "@/lib/data/emails";
import { riskTone, needsReview } from "@/lib/utils/risk";
import { initials } from "@/lib/utils/format";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Card, EmptyState } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/Form";
import { Tabs, FilterPills } from "@/components/ui/Interactive";
import { Modal } from "@/components/ui/Modal";
import { RiskMeter } from "@/components/ui/DataDisplay";
import {
  MessagePanel,
  AuthenticationPanel,
  InfrastructurePanel,
  IndicatorPanel,
  FindingsPanel,
  AttachmentPanel,
} from "@/components/dashboard/Evidence";

/** Category tab counts, computed from the corpus rather than hardcoded. */
const TAB_ICONS = {
  Primary: "inbox",
  "Threat Alerts": "shield",
  Updates: "tag",
};

export function InboxClient() {
  const [category, setCategory] = useState("Primary");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openEmail, setOpenEmail] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return emails.filter((email) => {
      if (email.category !== category) {
        return false;
      }

      if (filter === "unread" && !email.unread) {
        return false;
      }

      if (filter === "high" && email.risk < 75) {
        return false;
      }

      if (filter === "safe" && needsReview(email.risk)) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [
        email.sender,
        email.senderEmail,
        email.subject,
        email.preview,
        email.classification,
        email.id,
      ].some((field) => field.toLowerCase().includes(needle));
    });
  }, [category, filter, query]);

  /**
   * Selection state is scoped to what is currently visible.
   *
   * The previous implementation compared `selected.length` against
   * `filtered.length`, so selecting two messages in one tab made the header
   * checkbox appear checked in any other tab that also had two messages — and
   * "select all" would then clear instead of select. Comparing ids fixes both.
   */
  const visibleIds = filtered.map((email) => email.id);

  const selectedVisible = visibleIds.filter((id) => selectedIds.includes(id));

  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const someVisibleSelected =
    selectedVisible.length > 0 && !allVisibleSelected;

  const toggleOne = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((previous) =>
      allVisibleSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])],
    );
  };

  /**
   * Changing what is on screen clears the selection. Keeping hidden rows
   * selected means a later bulk action would silently affect messages the
   * analyst can no longer see.
   */
  const changeView = (setter) => (value) => {
    setter(value);
    setSelectedIds([]);
  };

  const tabs = emailCategories.map((name) => ({
    id: name,
    label: name,
    icon: TAB_ICONS[name],
    count: emails.filter((email) => email.category === name).length,
  }));

  return (
    <div className="space-y-5">
      {/* ================= CONTROLS ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={tabs} value={category} onChange={changeView(setCategory)} />

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subject, sender, domain or message ID…"
          aria-label="Search messages"
          className="lg:w-96"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="text-xs text-ink-faint" />

          <FilterPills
            options={inboxFilters}
            value={filter}
            onChange={changeView(setFilter)}
          />
        </div>

        <p className="text-xs text-ink-muted">
          Showing{" "}
          <strong className="font-mono font-semibold text-ink">
            {filtered.length}
          </strong>{" "}
          of{" "}
          <strong className="font-mono font-semibold text-ink">
            {emails.length}
          </strong>{" "}
          messages
        </p>
      </div>

      {/* ================= LIST ================= */}
      <Card padded={false} className="overflow-hidden">
        {/* Bulk action toolbar */}
        <div className="flex items-center gap-4 border-b border-line px-4 py-3">
          <label className="flex items-center gap-3 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(node) => {
                // Indeterminate is not expressible as a prop in React.
                if (node) {
                  node.indeterminate = someVisibleSelected;
                }
              }}
              onChange={toggleAllVisible}
              disabled={visibleIds.length === 0}
              className="h-4 w-4 accent-[var(--color-accent)] disabled:opacity-40"
              aria-label={
                allVisibleSelected
                  ? "Deselect all visible messages"
                  : "Select all visible messages"
              }
            />

            <span className="sr-only sm:not-sr-only">
              {selectedVisible.length > 0
                ? `${selectedVisible.length} selected`
                : "Select all"}
            </span>
          </label>

          {/* Bulk actions only appear once something is selected, so there are
              no permanently dead buttons in the toolbar. */}
          {selectedVisible.length > 0 ? (
            <div className="flex items-center gap-1">
              <IconButton icon="archive" label={`Archive ${selectedVisible.length} selected`} size="sm" />
              <IconButton icon="ban" label={`Mark ${selectedVisible.length} selected as junk`} size="sm" />
              <IconButton icon="trash" label={`Delete ${selectedVisible.length} selected`} size="sm" variant="danger" />
              <IconButton icon="folder" label={`Add ${selectedVisible.length} selected to a case`} size="sm" />
            </div>
          ) : (
            <p className="hidden text-[11px] text-ink-faint sm:block">
              Select messages to archive, escalate or add to a case.
            </p>
          )}

          <div className="ml-auto flex items-center gap-2 text-[11px] text-ink-faint">
            <Icon name="clock" />
            Sorted by newest
          </div>
        </div>

        {/* Column headings, desktop only */}
        <div className="hidden grid-cols-[2rem_1.3fr_2fr_9rem_7rem] items-center gap-4 border-b border-line bg-white/[0.015] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint lg:grid">
          <span className="sr-only">Select</span>
          <span>Sender</span>
          <span>Subject</span>
          <span>Risk</span>
          <span>Severity</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="envelope-open"
            title="No messages match these filters"
            description="Try clearing the search box, or switch to a different category or risk filter."
            action={
              <Button
                variant="secondary"
                size="sm"
                icon="refresh"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                selected={selectedIds.includes(email.id)}
                onSelect={() => toggleOne(email.id)}
                onOpen={() => setOpenEmail(email)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* ================= DETAIL DIALOG ================= */}
      <Modal
        open={Boolean(openEmail)}
        onClose={() => setOpenEmail(null)}
        subtitle={openEmail ? `${openEmail.id} · ${openEmail.classification}` : ""}
        title={openEmail?.subject ?? ""}
        size="xl"
        footer={
          openEmail && (
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/dashboard/analysis" icon="search">
                Open full analysis
              </Button>

              <Button variant="secondary" icon="folder">
                Add to case
              </Button>

              <Button variant="ghost" icon="archive">
                Archive
              </Button>

              <p className="ml-auto hidden text-[11px] text-ink-faint sm:block">
                Press{" "}
                <kbd className="rounded border border-line bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </div>
          )
        }
      >
        {openEmail && <EmailDetailBody email={openEmail} />}
      </Modal>
    </div>
  );
}

/** One row in the inbox list. */
function EmailRow({ email, selected, onSelect, onOpen }) {
  const t = resolveTone(riskTone(email.risk));

  return (
    <li
      className={cn(
        "group relative transition duration-200",
        selected ? "bg-accent/[0.06]" : "hover:bg-elevated/60",
      )}
    >
      {/* Severity edge marker */}
      {email.risk >= 75 && (
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-0.5", t.fill)}
        />
      )}

      <div className="grid grid-cols-[2rem_1fr] items-start gap-4 px-4 py-4 lg:grid-cols-[2rem_1.3fr_2fr_9rem_7rem] lg:items-center">
        {/* Selection — kept outside the row button so it does not toggle open */}
        <div className="flex items-center pt-0.5 lg:pt-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 accent-[var(--color-accent)]"
            aria-label={`Select "${email.subject}"`}
          />
        </div>

        {/* Sender */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-bold sm:flex",
              t.bg,
              t.border,
              t.text,
            )}
          >
            {initials(email.sender)}
          </span>

          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm",
                email.unread ? "font-semibold text-ink" : "text-ink-soft",
              )}
            >
              {email.sender}
            </p>

            <p className="ioc truncate text-ink-faint">{email.senderEmail}</p>
          </div>
        </div>

        {/* Subject — the button, so the whole cell is one keyboard target */}
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full text-left"
          >
            <span className="flex items-center gap-2">
              {email.unread && (
                <span
                  aria-label="Unread"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                />
              )}

              <span
                className={cn(
                  "truncate text-sm underline-offset-4 group-hover:underline",
                  email.unread ? "font-medium text-ink" : "text-ink-soft",
                )}
              >
                {email.subject}
              </span>
            </span>

            <span className="mt-1 flex items-center gap-3">
              <span className="truncate text-[11px] text-ink-muted">
                {email.preview}
              </span>
            </span>

            <span className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone="neutral" size="xs">
                {email.classification}
              </Badge>

              {email.attachment && (
                <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                  <Icon name="paperclip" className="text-[9px]" />
                  Attachment
                </span>
              )}

              {email.link && (
                <span className="flex items-center gap-1 text-[10px] text-ink-faint">
                  <Icon name="link" className="text-[9px]" />
                  Link
                </span>
              )}

              {email.caseId && (
                <span className="ioc text-[10px] text-accent">
                  {email.caseId}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Risk meter */}
        <div className="col-start-2 lg:col-start-auto">
          <RiskMeter score={email.risk} size="sm" />
        </div>

        {/* Severity + time */}
        <div className="col-start-2 flex items-center justify-between gap-2 lg:col-start-auto lg:block">
          <RiskBadge score={email.risk} />

          <p className="mt-0 font-mono text-[10px] text-ink-faint lg:mt-1.5">
            {email.time}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Full evidence body shown inside the detail dialog. */
function EmailDetailBody({ email }) {
  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <dl className="grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "From", value: email.sender },
              { label: "Address", value: email.senderEmail, mono: true },
              { label: "Received", value: email.receivedAt, mono: true },
              { label: "Classification", value: email.classification },
              { label: "Message ID", value: email.id, mono: true },
              { label: "Case", value: email.caseId ?? "Not assigned", mono: true },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-line bg-white/[0.02] px-3 py-2.5"
              >
                <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                  {field.label}
                </dt>
                <dd
                  className={cn(
                    "mt-1 truncate text-xs text-ink-soft",
                    field.mono && "ioc",
                  )}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <RiskMeter score={email.risk} />
      </div>

      <MessagePanel email={email} />

      <div className="grid gap-5 lg:grid-cols-2">
        <AuthenticationPanel authentication={email.authentication} />
        <InfrastructurePanel infrastructure={email.infrastructure} />
      </div>

      <AttachmentPanel attachments={email.attachments} />

      <div className="grid gap-5 lg:grid-cols-2">
        <IndicatorPanel indicators={email.indicators} />
        <FindingsPanel findings={email.findings} />
      </div>
    </div>
  );
}

export default InboxClient;
