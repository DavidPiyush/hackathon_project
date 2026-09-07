"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone, VERDICT_TONES } from "@/lib/utils/tones";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Field, Input, Select } from "@/components/ui/Form";
import { FilterPills, CopyButton } from "@/components/ui/Interactive";
import { Popover } from "@/components/ui/Popover";
import { Modal } from "@/components/ui/Modal";
import { Spinner, ConfirmInline } from "@/components/ui/Feedback";

const VERDICT_FILTERS = [
  { id: "all", label: "All" },
  { id: "malicious", label: "Malicious" },
  { id: "suspicious", label: "Suspicious" },
  { id: "benign", label: "Benign" },
  { id: "unknown", label: "Unknown" },
];

const INDICATOR_TYPES = ["Domain", "IPv4", "IPv6", "URL", "MD5", "SHA-256", "Email"];

const VERDICTS = ["malicious", "suspicious", "benign", "unknown"];

/**
 * Indicator registry with full CRUD.
 *
 * Add an indicator, run enrichment against it, override the verdict, or remove
 * it. Everything persists in the browser and every destructive action can be
 * undone from its toast.
 */
export function IndicatorRegistry() {
  const { indicators, investigations, actions } = useData();

  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("all");
  const [adding, setAdding] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [draft, setDraft] = useState({
    value: "",
    indicatorType: "Domain",
    caseId: "",
    context: "",
  });
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return indicators.filter((entry) => {
      if (verdict !== "all" && entry.verdict !== verdict) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [entry.value, entry.type, entry.context, ...(entry.cases ?? [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [indicators, query, verdict]);

  const submitDraft = (event) => {
    event.preventDefault();

    const value = draft.value.trim();
    const nextErrors = {};

    if (value.length < 3) {
      nextErrors.value = "Enter the indicator you want to register.";
    } else if (/\s/.test(value)) {
      nextErrors.value = "An indicator cannot contain spaces.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const created = actions.createIndicator({
      value,
      indicatorType: draft.indicatorType,
      caseId: draft.caseId || null,
      context: draft.context.trim(),
    });

    if (created) {
      setDraft({ value: "", indicatorType: "Domain", caseId: "", context: "" });
      setAdding(false);
    } else {
      setErrors({ value: "This indicator is already in the registry." });
    }
  };

  return (
    <>
      <Card padded={false} className="overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Icon name="filter" className="text-xs text-ink-faint" />

            <FilterPills
              options={VERDICT_FILTERS}
              value={verdict}
              onChange={setVerdict}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search indicator, type, case or context…"
              aria-label="Search the indicator registry"
              className="sm:w-80"
            />

            <Button icon="plus" onClick={() => setAdding(true)}>
              Add indicator
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="fingerprint"
            title="No indicators match"
            description="Adjust the verdict filter, clear the search box, or register a new indicator."
            action={
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="refresh"
                  onClick={() => {
                    setQuery("");
                    setVerdict("all");
                  }}
                >
                  Reset filters
                </Button>

                <Button size="sm" icon="plus" onClick={() => setAdding(true)}>
                  Add indicator
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[58rem] text-left">
                <caption className="sr-only">
                  Registered indicators of compromise with verdict, sightings
                  and linked cases
                </caption>

                <thead className="border-b border-line bg-raise">
                  <tr>
                    {[
                      "Indicator",
                      "Type",
                      "Verdict",
                      "First seen",
                      "Sightings",
                      "Cases",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={cn(
                          "px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-ink-faint",
                          heading === "Actions" && "text-right",
                        )}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {filtered.map((entry) => {
                    const toneName = VERDICT_TONES[entry.verdict] ?? "neutral";
                    const t = resolveTone(toneName);

                    return (
                      <tr
                        key={entry.value}
                        className="align-top transition duration-150 hover:bg-elevated"
                      >
                        <th
                          scope="row"
                          className="px-5 py-4 text-left font-normal"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                t.fill,
                              )}
                            />

                            <span className="ioc font-medium text-ink">
                              {entry.value}
                            </span>

                            <CopyButton
                              value={entry.value}
                              label={`Copy ${entry.value}`}
                            />
                          </span>

                          <span className="mt-1.5 block max-w-md text-[11px] leading-5 text-ink-muted">
                            {entry.context}
                          </span>
                        </th>

                        <td className="px-5 py-4">
                          <Badge tone="neutral" size="xs">
                            {entry.type}
                          </Badge>
                        </td>

                        {/* Verdict is editable — an analyst overrides the
                            engine, not the other way round. */}
                        <td className="px-5 py-4">
                          {entry.enriching ? (
                            <span className="flex items-center gap-2 text-[11px] text-accent">
                              <Spinner size="xs" />
                              Enriching…
                            </span>
                          ) : (
                            <Popover
                              align="left"
                              trigger={(props) => (
                                <button
                                  type="button"
                                  // Without this the accessible name is just
                                  // "malicious", which says nothing about
                                  // which indicator it belongs to or that it
                                  // opens a menu.
                                  aria-label={`Change verdict for ${entry.value} — currently ${entry.verdict}`}
                                  className="inline-flex items-center gap-1.5 rounded transition duration-200 hover:opacity-80"
                                  {...props}
                                >
                                  <Badge tone={toneName} size="xs" uppercase>
                                    {entry.verdict}
                                  </Badge>

                                  <Icon
                                    name="chevron-down"
                                    className="text-[8px] text-ink-faint"
                                  />
                                </button>
                              )}
                            >
                              <p className="border-b border-line px-4 py-3 text-xs font-semibold text-ink">
                                Set verdict
                              </p>

                              <ul className="p-2">
                                {VERDICTS.map((option) => (
                                  <li key={option}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        actions.setIndicatorVerdict(
                                          entry.value,
                                          option,
                                        )
                                      }
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition duration-200 hover:bg-raise-md"
                                    >
                                      <Badge
                                        tone={
                                          VERDICT_TONES[option] ?? "neutral"
                                        }
                                        size="xs"
                                        uppercase
                                      >
                                        {option}
                                      </Badge>

                                      {entry.verdict === option && (
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
                          )}
                        </td>

                        <td className="ioc px-5 py-4 text-ink-muted">
                          {entry.firstSeen}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">
                          {entry.sightings}
                        </td>

                        <td className="px-5 py-4">
                          {(entry.cases ?? []).length === 0 ? (
                            <span className="text-[11px] text-ink-faint">—</span>
                          ) : (
                            <ul className="space-y-1">
                              {entry.cases.map((caseId) => (
                                <li key={caseId}>
                                  <span className="ioc text-accent">
                                    {caseId}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-0.5">
                            <IconButton
                              icon="magic"
                              label={`Run enrichment on ${entry.value}`}
                              size="sm"
                              disabled={entry.enriching}
                              onClick={() =>
                                actions.enrichIndicator(entry.value)
                              }
                            />

                            <IconButton
                              icon="trash"
                              label={`Remove ${entry.value}`}
                              size="sm"
                              variant="danger"
                              onClick={() => setConfirming(entry.value)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {confirming && (
              <div className="border-t border-line p-4">
                <ConfirmInline
                  question={`Remove ${confirming} from the registry? Any case still referencing it keeps its own copy of the evidence.`}
                  confirmLabel="Remove"
                  onCancel={() => setConfirming(null)}
                  onConfirm={() => {
                    actions.deleteIndicator(confirming);
                    setConfirming(null);
                  }}
                />
              </div>
            )}

            <p className="border-t border-line px-5 py-3 text-[11px] text-ink-muted">
              Showing{" "}
              <strong className="font-mono font-semibold text-ink">
                {filtered.length}
              </strong>{" "}
              of{" "}
              <strong className="font-mono font-semibold text-ink">
                {indicators.length}
              </strong>{" "}
              registered indicators
            </p>
          </>
        )}
      </Card>

      {/* ================= ADD INDICATOR ================= */}
      <Modal
        open={adding}
        onClose={() => {
          setAdding(false);
          setErrors({});
        }}
        subtitle="Registry"
        title="Register an indicator"
        size="md"
      >
        <form onSubmit={submitDraft} className="space-y-5" noValidate>
          <p className="flex items-start gap-2 rounded-lg border border-info/20 bg-info/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
            <Icon name="info" className="mt-0.5 shrink-0 text-info" />
            New indicators start as{" "}
            <strong className="font-semibold text-ink">unknown</strong>. Run
            enrichment to derive a verdict, or set one yourself if you have
            grounds the engine does not.
          </p>

          <Field
            id="indicator-value"
            label="Indicator"
            error={errors.value}
            hint="A domain, address, URL or file hash."
            required
          >
            {(field) => (
              <Input
                {...field}
                value={draft.value}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    value: event.target.value,
                  }))
                }
                placeholder="suspicious-domain.example"
                error={errors.value}
                className="ioc"
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="indicator-type" label="Type" required>
              {(field) => (
                <Select
                  {...field}
                  value={draft.indicatorType}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      indicatorType: event.target.value,
                    }))
                  }
                >
                  {INDICATOR_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field id="indicator-case" label="Link to a case">
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
                  <option value="">Not linked</option>

                  {investigations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id} — {item.title}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            id="indicator-context"
            label="Context"
            hint="Why this indicator matters. Shown beneath it in the registry."
          >
            {(field) => (
              <Input
                {...field}
                value={draft.context}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    context: event.target.value,
                  }))
                }
                placeholder="Registered 3 days ago, hosting a cloned login portal."
              />
            )}
          </Field>

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Button type="submit" icon="plus">
              Register indicator
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default IndicatorRegistry;
