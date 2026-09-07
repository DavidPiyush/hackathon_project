"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone, VERDICT_TONES } from "@/lib/utils/tones";
import { indicatorRegistry } from "@/lib/data/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/ui/Form";
import { FilterPills, CopyButton } from "@/components/ui/Interactive";

const VERDICT_FILTERS = [
  { id: "all", label: "All" },
  { id: "malicious", label: "Malicious" },
  { id: "suspicious", label: "Suspicious" },
  { id: "benign", label: "Benign" },
];

/** Searchable indicator-of-compromise registry. */
export function IndicatorRegistry() {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return indicatorRegistry.filter((entry) => {
      if (verdict !== "all" && entry.verdict !== verdict) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [entry.value, entry.type, entry.context, ...entry.cases].some(
        (field) => field.toLowerCase().includes(needle),
      );
    });
  }, [query, verdict]);

  return (
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

        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search indicator, type, case or context…"
          aria-label="Search the indicator registry"
          className="lg:w-96"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="fingerprint"
          title="No indicators match"
          description="Adjust the verdict filter or clear the search box."
          action={
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
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <caption className="sr-only">
                Registered indicators of compromise with verdict, sightings and
                linked cases
              </caption>

              <thead className="border-b border-line bg-white/[0.015]">
                <tr>
                  {[
                    "Indicator",
                    "Type",
                    "Verdict",
                    "First seen",
                    "Sightings",
                    "Cases",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-ink-faint"
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
                      className="align-top transition duration-150 hover:bg-elevated/50"
                    >
                      <th scope="row" className="px-5 py-4 text-left font-normal">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", t.fill)}
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

                      <td className="px-5 py-4">
                        <Badge tone={toneName} size="xs" uppercase>
                          {entry.verdict}
                        </Badge>
                      </td>

                      <td className="ioc px-5 py-4 text-ink-muted">
                        {entry.firstSeen}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">
                        {entry.sightings}
                      </td>

                      <td className="px-5 py-4">
                        {entry.cases.length === 0 ? (
                          <span className="text-[11px] text-ink-faint">—</span>
                        ) : (
                          <ul className="space-y-1">
                            {entry.cases.map((caseId) => (
                              <li key={caseId}>
                                <span className="ioc text-accent">{caseId}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="border-t border-line px-5 py-3 text-[11px] text-ink-muted">
            Showing{" "}
            <strong className="font-mono font-semibold text-ink">
              {filtered.length}
            </strong>{" "}
            of{" "}
            <strong className="font-mono font-semibold text-ink">
              {indicatorRegistry.length}
            </strong>{" "}
            registered indicators
          </p>
        </>
      )}
    </Card>
  );
}

export default IndicatorRegistry;
