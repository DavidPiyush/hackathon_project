"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/providers/ThemeProvider";

const OPTIONS = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
  { id: "system", label: "System", icon: "desktop" },
];

/**
 * Theme switch.
 *
 * A three-way segmented control on wider screens (light / dark / follow the
 * OS) and a single cycling button on narrow ones, where three targets would
 * crowd the header.
 *
 * The control always renders, including in the server HTML — an earlier
 * version held it back until hydration, which made the switch look absent on
 * first paint. The preference comes from useSyncExternalStore, so the server
 * snapshot (system, the real default) hydrates cleanly and a returning
 * visitor stored choice is adopted without a mismatch warning.
 */
export function ThemeToggle({ className, compact = false }) {
  const { preference, theme, setTheme, toggleTheme } = useTheme();

  if (compact) {
    const next = theme === "dark" ? "light" : "dark";

    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${next} theme`}
        title={`Switch to ${next} theme`}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-line text-ink-muted transition duration-200 hover:border-accent/35 hover:bg-accent/6 hover:text-accent active:scale-95",
          className,
        )}
      >
        {/* Both glyphs are rendered and cross-faded, so the swap animates
            rather than popping. */}
        <Icon
          name="sun"
          className={cn(
            "absolute transition-all duration-300",
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0",
          )}
        />
        <Icon
          name="moon"
          className={cn(
            "absolute transition-all duration-300",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-raise p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = preference === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.id)}
            title={
              option.id === "system"
                ? "Follow your system setting"
                : `${option.label} theme`
            }
            className={cn(
              "inline-flex h-8 w-9 items-center justify-center rounded-md text-xs transition duration-200 active:scale-95",
              active
                ? "bg-accent/12 text-accent shadow-sm"
                : "text-ink-faint hover:bg-raise-md hover:text-ink-soft",
            )}
          >
            <Icon name={option.icon} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeToggle;
