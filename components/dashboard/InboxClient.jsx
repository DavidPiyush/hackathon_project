"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { emailCategories, inboxFilters } from "@/lib/data/emails";
import { riskTone, needsReview } from "@/lib/utils/risk";
import { initials } from "@/lib/utils/format";
import { openInvestigations } from "@/lib/store/reducer";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Card, EmptyState } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/Form";
import { Tabs, FilterPills } from "@/components/ui/Interactive";
import { Modal } from "@/components/ui/Modal";
import { Popover } from "@/components/ui/Popover";
import { RiskMeter, StatCard } from "@/components/ui/DataDisplay";
import { ConfirmInline } from "@/components/ui/Feedback";
import {
  MessagePanel,
  AuthenticationPanel,
  InfrastructurePanel,
  IndicatorPanel,
  FindingsPanel,
  AttachmentPanel,
} from "@/components/dashboard/Evidence";

const TAB_ICONS = {
  Primary: "inbox",
  "Threat Alerts": "shield",
  Updates: "tag",
};

/** Which stored view the analyst is looking at. */
const VIEWS = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "archived", label: "Archived", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" },
];

export function InboxClient() {
  const { emails, investigations, actions } = useData();

  const [view, setView] = useState("inbox");
  const [category, setCategory] = useState("Primary");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openEmailId, setOpenEmailId] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  /** Messages belonging to the current stored view, before tab/risk filters. */
  const inView = useMemo(() => {
    switch (view) {
      case "starred":
        return emails.filter(
          (email) => email.starred && !email.deleted && !email.archived,
        );
      case "archived":
        return emails.filter((email) => email.archived && !email.deleted);
      case "trash":
        return emails.filter((email) => email.deleted);
      default:
        return emails.filter((email) => !email.archived && !email.deleted);
    }
  }, [emails, view]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return inView.filter((email) => {
      // Category tabs only make sense for the main inbox; the stored views are
      // already a selection, so tabbing them would hide most of the contents.
      if (view === "inbox" && email.category !== category) {
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
        email.caseId ?? "",
      ].some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [inView, view, category, filter, query]);

  /**
   * Selection is scoped to what is visible and compared by id.
   *
   * Comparing counts (the original bug) made the header checkbox read as
   * checked in any other tab that happened to hold the same number of rows.
   */
  const visibleIds = filtered.map((email) => email.id);
  const selectedVisible = visibleIds.filter((id) => selectedIds.includes(id));

  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisible.length === visibleIds.length;

  const someVisibleSelected = selectedVisible.length > 0 && !allVisibleSelected;

  const toggleOne = (id) =>
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );

  const toggleAllVisible = () =>
    setSelectedIds((previous) =>
      allVisibleSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])],
    );

  /** Changing what is on screen clears the selection. */
  const changeView = (setter) => (value) => {
    setter(value);
    setSelectedIds([]);
    setConfirmingDelete(false);
  };

  /** Run a bulk action, then drop the selection it applied to. */
  const runBulk = (action) => {
    action(selectedVisible);
    setSelectedIds([]);
    setConfirmingDelete(false);
  };

  const openEmail = emails.find((email) => email.id === openEmailId) ?? null;

  const openCases = openInvestigations({ investigations });

  const tabs = emailCategories.map((name) => ({
    id: name,
    label: name,
    icon: TAB_ICONS[name],
    count: emails.filter(
      (email) =>
        email.category === name && !email.archived && !email.deleted,
    ).length,
  }));

  const inboxCount = emails.filter(
    (email) => !email.archived && !email.deleted,
  ).length;

  const viewCounts = {
    inbox: inboxCount,
    starred: emails.filter(
      (email) => email.starred && !email.deleted && !email.archived,
    ).length,
    archived: emails.filter((email) => email.archived && !email.deleted).length,
    trash: emails.filter((email) => email.deleted).length,
  };

  return (
    <div className="space-y-6">
      {/* ================= LIVE STATS ================= */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="envelope"
          label="In the inbox"
          value={inboxCount}
          detail="Excluding archived and deleted"
        />

        <StatCard
          icon="envelope-open"
          label="Unread"
          value={
            emails.filter(
              (email) => email.unread && !email.archived && !email.deleted,
            ).length
          }
          detail="Not yet opened by an analyst"
          tone="info"
        />

        <StatCard
          icon="warning"
          label="High risk"
          value={
            emails.filter(
              (email) =>
                email.risk >= 75 && !email.archived && !email.deleted,
            ).length
          }
          detail="Scoring 75 or above"
          tone="critical"
        />

        <StatCard
          icon="folder"
          label="Assigned to a case"
          value={
            emails.filter((email) => email.caseId && !email.deleted).length
          }
          detail="Linked to an investigation"
          tone="warn"
        />
      </div>

      {/* ================= VIEW SWITCH ================= */}
      <div className="flex flex-wrap items-center gap-2">
        {VIEWS.map((item) => {
          const active = view === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeView(setView)(item.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition duration-200 active:scale-95",
                active
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-line text-ink-muted hover:border-accent/25 hover:bg-raise-md hover:text-ink",
              )}
            >
              <Icon name={item.icon} className="text-[11px]" />
              {item.label}

              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                  active ? "bg-accent/15" : "bg-raise-md text-ink-faint",
                )}
              >
                {viewCounts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {view === "inbox" ? (
          <Tabs tabs={tabs} value={category} onChange={changeView(setCategory)} />
        ) : (
          <p className="text-xs text-ink-muted">
            Showing the{" "}
            <strong className="font-medium text-ink">
              {VIEWS.find((item) => item.id === view)?.label.toLowerCase()}
            </strong>{" "}
            view across all categories.
          </p>
        )}

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subject, sender, domain, case or message ID…"
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
            {inView.length}
          </strong>{" "}
          messages in this view
        </p>
      </div>

      {/* ================= LIST ================= */}
      <Card padded={false} className="overflow-hidden">
        {/* Bulk action toolbar */}
        <div className="space-y-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                ref={(node) => {
                  // `indeterminate` has no React prop equivalent.
                  if (node) {
                    node.indeterminate = someVisibleSelected;
                  }
                }}
                onChange={toggleAllVisible}
                disabled={visibleIds.length === 0}
                className="h-4 w-4 disabled:opacity-40"
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

            {/* Bulk actions only exist while something is selected, so the
                toolbar never shows a permanently dead button. */}
            {selectedVisible.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                {view === "trash" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="undo"
                    onClick={() => runBulk(actions.restoreEmails)}
                  >
                    Recover
                  </Button>
                )}

                {view === "archived" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="undo"
                    onClick={() => runBulk(actions.unarchiveEmails)}
                  >
                    Move to inbox
                  </Button>
                )}

                {view !== "trash" && view !== "archived" && (
                  <>
                    <IconButton
                      icon="archive"
                      label={`Archive ${selectedVisible.length} selected`}
                      size="sm"
                      onClick={() => runBulk(actions.archiveEmails)}
                    />

                    <IconButton
                      icon="check-double"
                      label={`Mark ${selectedVisible.length} selected as read`}
                      size="sm"
                      onClick={() => runBulk((ids) => actions.markRead(ids, true))}
                    />

                    <IconButton
                      icon="envelope"
                      label={`Mark ${selectedVisible.length} selected as unread`}
                      size="sm"
                      onClick={() => runBulk((ids) => actions.markRead(ids, false))}
                    />

                    <Popover
                      align="left"
                      trigger={(props) => (
                        <IconButton
                          icon="folder-plus"
                          label={`Add ${selectedVisible.length} selected to a case`}
                          size="sm"
                          {...props}
                        />
                      )}
                    >
                      <p className="border-b border-line px-4 py-3 text-xs font-semibold text-ink">
                        Add to an investigation
                      </p>

                      <ul className="max-h-64 overflow-y-auto p-2">
                        {openCases.map((item) => (
                          <li key={item.case_id}>
                            <button
                              type="button"
                              onClick={() =>
                                runBulk((ids) => actions.assignCase(ids, item.case_id))
                              }
                              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition duration-200 hover:bg-raise-md"
                            >
                              <span className="ioc shrink-0 text-accent">
                                {item.id}
                              </span>

                              <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">
                                {item.title}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Popover>
                  </>
                )}

                <IconButton
                  icon="trash"
                  label={`Delete ${selectedVisible.length} selected`}
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirmingDelete(true)}
                />
              </div>
            ) : (
              <p className="hidden text-[11px] text-ink-faint sm:block">
                Select messages to archive, mark read, add to a case or delete.
              </p>
            )}

            <div className="ml-auto flex items-center gap-2 text-[11px] text-ink-faint">
              <Icon name="clock" />
              Newest first
            </div>
          </div>

          {confirmingDelete && selectedVisible.length > 0 && (
            <ConfirmInline
              question={`Delete ${selectedVisible.length} message${selectedVisible.length === 1 ? "" : "s"}? The evidence record is retained and this can be undone.`}
              confirmLabel="Delete"
              onCancel={() => setConfirmingDelete(false)}
              onConfirm={() => runBulk(actions.deleteEmails)}
            />
          )}
        </div>

        {/* Column headings, desktop only */}
        <div className="hidden grid-cols-[2rem_1.3fr_2fr_9rem_7rem_5rem] items-center gap-4 border-b border-line bg-raise px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint lg:grid">
          <span className="sr-only">Select</span>
          <span>Sender</span>
          <span>Subject</span>
          <span>Risk</span>
          <span>Severity</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={view === "trash" ? "trash" : "envelope-open"}
            title={
              view === "inbox"
                ? "No messages match these filters"
                : `Nothing in ${VIEWS.find((item) => item.id === view)?.label.toLowerCase()}`
            }
            description={
              view === "inbox"
                ? "Try clearing the search box, or switch to a different category or risk filter."
                : "Messages you move here will appear in this view."
            }
            action={
              view === "inbox" ? (
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
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="inbox"
                  onClick={() => changeView(setView)("inbox")}
                >
                  Back to the inbox
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((email) => (
              <EmailRow
                key={email.id}
                email={email}
                view={view}
                selected={selectedIds.includes(email.id)}
                onSelect={() => toggleOne(email.id)}
                onOpen={() => {
                  setOpenEmailId(email.id);

                  // Opening a message is what marks it read, exactly as a real
                  // client behaves.
                  if (email.unread) {
                    actions.setRead(email.id, true);
                  }
                }}
                actions={actions}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* ================= DETAIL DIALOG ================= */}
      <Modal
        open={Boolean(openEmail)}
        onClose={() => setOpenEmailId(null)}
        subtitle={openEmail ? `${openEmail.id} · ${openEmail.classification}` : ""}
        title={openEmail?.subject ?? ""}
        size="xl"
        footer={
          openEmail && (
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/dashboard/analysis" icon="search">
                Open full analysis
              </Button>

              <Popover
                align="left"
                trigger={(props) => (
                  <Button variant="secondary" icon="folder-plus" {...props}>
                    {openEmail.caseId ? `Case ${openEmail.caseId}` : "Add to case"}
                  </Button>
                )}
              >
                <p className="border-b border-line px-4 py-3 text-xs font-semibold text-ink">
                  Assign this message
                </p>

                <ul className="max-h-64 overflow-y-auto p-2">
                  {openCases.map((item) => (
                    <li key={item.case_id}>
                      <button
                        type="button"
                        onClick={() =>
                          actions.assignCase([openEmail.id], item.case_id)
                        }
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition duration-200 hover:bg-raise-md",
                          openEmail.caseId === item.case_id && "bg-accent/10",
                        )}
                      >
                        <span className="ioc shrink-0 text-accent">
                          {item.id}
                        </span>

                        <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">
                          {item.title}
                        </span>

                        {openEmail.caseId === item.case_id && (
                          <Icon name="check" className="shrink-0 text-accent" />
                        )}
                      </button>
                    </li>
                  ))}

                  {openEmail.caseId && (
                    <li className="mt-1 border-t border-line pt-1">
                      <button
                        type="button"
                        onClick={() => actions.assignCase([openEmail.id], null)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-critical transition duration-200 hover:bg-critical/10"
                      >
                        <Icon name="close" />
                        Detach from {openEmail.caseId}
                      </button>
                    </li>
                  )}
                </ul>
              </Popover>

              <Button
                variant="ghost"
                icon="archive"
                onClick={() => {
                  actions.archiveEmails([openEmail.id]);
                  setOpenEmailId(null);
                }}
              >
                Archive
              </Button>

              <p className="ml-auto hidden text-[11px] text-ink-faint sm:block">
                Press{" "}
                <kbd className="rounded border border-line bg-raise-md px-1.5 py-0.5 font-mono text-[10px]">
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
function EmailRow({ email, view, selected, onSelect, onOpen, actions }) {
  const t = resolveTone(riskTone(email.risk));

  return (
    <li
      className={cn(
        "group relative transition duration-200",
        selected ? "bg-accent/[0.06]" : "hover:bg-elevated",
      )}
    >
      {/* Severity edge marker */}
      {email.risk >= 75 && (
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 left-0 w-0.5", t.fill)}
        />
      )}

      <div className="grid grid-cols-[2rem_1fr] items-start gap-4 px-4 py-4 lg:grid-cols-[2rem_1.3fr_2fr_9rem_7rem_5rem] lg:items-center">
        <div className="flex items-center pt-0.5 lg:pt-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4"
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

        {/* Subject */}
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <button type="button" onClick={onOpen} className="block w-full text-left">
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

        {/* Row actions. Revealed on hover, always available to keyboard users. */}
        <div className="col-start-2 flex items-center justify-end gap-0.5 opacity-100 transition duration-200 lg:col-start-auto lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
          <IconButton
            icon="star"
            label={
              email.starred
                ? `Remove star from "${email.subject}"`
                : `Star "${email.subject}"`
            }
            size="sm"
            onClick={() => actions.toggleStar(email.id)}
            className={email.starred ? "text-warn" : undefined}
          />

          {view === "trash" ? (
            <IconButton
              icon="undo"
              label={`Recover "${email.subject}"`}
              size="sm"
              onClick={() => actions.restoreEmails([email.id])}
            />
          ) : view === "archived" ? (
            <IconButton
              icon="undo"
              label={`Move "${email.subject}" back to the inbox`}
              size="sm"
              onClick={() => actions.unarchiveEmails([email.id])}
            />
          ) : (
            <IconButton
              icon="archive"
              label={`Archive "${email.subject}"`}
              size="sm"
              onClick={() => actions.archiveEmails([email.id])}
            />
          )}
        </div>
      </div>
    </li>
  );
}

/** Full evidence body shown inside the detail dialog. */
function EmailDetailBody({ email }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <dl className="grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "From", value: email.sender },
              { label: "Address", value: email.senderEmail, mono: true },
              { label: "Received", value: email.receivedAt, mono: true },
              { label: "Classification", value: email.classification },
              { label: "Message ID", value: email.id, mono: true },
              {
                label: "Case",
                value: email.caseId ?? "Not assigned",
                mono: true,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-line bg-raise px-3 py-2.5"
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
