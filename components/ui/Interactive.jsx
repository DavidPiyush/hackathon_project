"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

/**
 * Segmented tab bar following the ARIA tabs pattern: arrow keys move between
 * tabs, only the active tab is in the tab order.
 *
 * This is a controlled component — the parent owns the active value so it can
 * also reset dependent state (such as an inbox selection) on change.
 */
export function Tabs({ tabs, value, onChange, className }) {
  const baseId = useId();

  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === value);
    const keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
    const move = keys[event.key];

    if (move === undefined) {
      return;
    }

    event.preventDefault();

    const next =
      move === "first"
        ? 0
        : move === "last"
          ? tabs.length - 1
          : (index + move + tabs.length) % tabs.length;

    onChange(tabs[next].id);
    document.getElementById(`${baseId}-${tabs[next].id}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Filter messages by category"
      onKeyDown={onKeyDown}
      className={cn("flex gap-1 overflow-x-auto", className)}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;

        return (
          <button
            key={tab.id}
            id={`${baseId}-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition duration-200",
              active
                ? "bg-accent/10 text-accent"
                : "text-ink-muted hover:bg-raise-md hover:text-ink-soft",
            )}
          >
            {tab.icon && <Icon name={tab.icon} />}

            {tab.label}

            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                  active ? "bg-accent/15 text-accent" : "bg-raise-md text-ink-faint",
                )}
              >
                {tab.count}
              </span>
            )}

            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Pill-style filter group — a simpler alternative to Tabs for short lists. */
export function FilterPills({ options, value, onChange, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((option) => {
        const active = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium transition duration-200",
              active
                ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                : "text-ink-muted hover:bg-raise-md hover:text-ink-soft",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Disclosure list built on native `<details>` semantics via buttons, with
 * `aria-expanded` and `aria-controls` wired up. Only one panel opens at a time.
 */
export function Accordion({ items, className }) {
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-line overflow-hidden rounded-xl border border-line", className)}>
      {items.map((item, index) => {
        const open = openIndex === index;

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${baseId}-panel-${index}`}
                id={`${baseId}-button-${index}`}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 bg-surface/40 px-5 py-4 text-left transition duration-200 hover:bg-elevated/60"
              >
                <span className="text-sm font-medium text-ink">
                  {item.question}
                </span>

                <Icon
                  name="chevron-down"
                  className={cn(
                    "shrink-0 text-xs text-ink-faint transition-transform duration-200",
                    open && "rotate-180 text-accent",
                  )}
                />
              </button>
            </h3>

            <div
              id={`${baseId}-panel-${index}`}
              role="region"
              aria-labelledby={`${baseId}-button-${index}`}
              hidden={!open}
              className="border-t border-line bg-canvas/40 px-5 py-4"
            >
              <p className="text-sm leading-7 text-ink-soft">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Switch control. Uses `role="switch"` so assistive tech announces on/off
 * rather than "checkbox, checked".
 */
export function Toggle({ checked, onChange, label, description, className }) {
  const id = useId();

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>

        {description && (
          <p className="mt-1 text-[11px] leading-5 text-ink-muted">
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition duration-200",
          checked ? "bg-accent" : "bg-raise-lg",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full transition-all duration-200",
            checked ? "left-6 bg-on-accent" : "left-1 bg-ink-muted",
          )}
        />

        <span className="sr-only">{checked ? "Enabled" : "Disabled"}</span>
      </button>
    </div>
  );
}

/**
 * Copy-to-clipboard button for indicators. Confirms in place rather than with
 * a toast, and falls back gracefully where the Clipboard API is unavailable.
 */
export function CopyButton({ value, label = "Copy value", className }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission denied or unavailable — leave the UI unchanged
      // rather than claiming a copy that did not happen.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded transition duration-200",
        copied
          ? "text-safe"
          : "text-ink-faint hover:bg-raise-md hover:text-accent",
        className,
      )}
    >
      <Icon name={copied ? "check" : "copy"} className="text-[11px]" />
    </button>
  );
}

/** Indicator row: type chip, monospace value, verdict badge and copy control. */
export function IndicatorRow({ indicator, verdictTone, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-line bg-raise px-3 py-2.5 transition duration-200 hover:border-accent/25",
        className,
      )}
    >
      <span className="w-16 shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-faint">
        {indicator.type}
      </span>

      <span className="ioc min-w-0 flex-1 text-ink-soft">{indicator.value}</span>

      {indicator.verdict && (
        <Badge tone={verdictTone} size="xs" uppercase>
          {indicator.verdict}
        </Badge>
      )}

      <CopyButton value={indicator.value} label={`Copy ${indicator.value}`} />
    </div>
  );
}
