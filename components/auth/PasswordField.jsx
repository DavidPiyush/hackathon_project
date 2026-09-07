"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { scorePassword, PASSWORD_MIN } from "@/lib/auth/validation";
import { Icon } from "@/components/ui/Icon";
import { Field, Input } from "@/components/ui/Form";

/** Strength bands. The palette is the same risk scale used elsewhere. */
const BANDS = [
  { tone: "critical", fill: "bg-critical", text: "text-critical" },
  { tone: "critical", fill: "bg-critical", text: "text-critical" },
  { tone: "warn", fill: "bg-warn", text: "text-warn" },
  { tone: "info", fill: "bg-info", text: "text-info" },
  { tone: "safe", fill: "bg-safe", text: "text-safe" },
];

/**
 * Password input with a reveal toggle and a live strength meter.
 *
 * The meter calls the same `scorePassword` the Server Action uses, so the
 * advice on screen cannot contradict the rule that actually decides whether
 * the password is accepted.
 *
 * Reveal is deliberately included: hiding the password by default is right,
 * but forcing people to type a long passphrase blind is what drives them to
 * pick short ones.
 */
export function PasswordField({
  id,
  name = "password",
  label = "Password",
  value,
  onChange,
  error,
  hint,
  autoComplete = "new-password",
  showStrength = false,
  context = {},
  required = true,
}) {
  const [visible, setVisible] = useState(false);
  const meterId = useId();

  const strength = showStrength ? scorePassword(value, context) : null;
  const band = strength ? BANDS[strength.score] : null;

  return (
    <div>
      <Field
        id={id}
        label={label}
        error={error}
        hint={!showStrength ? hint : undefined}
        required={required}
      >
        {(field) => (
          <div className="relative">
            <Input
              {...field}
              name={name}
              type={visible ? "text" : "password"}
              value={value}
              onChange={onChange}
              autoComplete={autoComplete}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              error={error}
              className="pr-12"
              aria-describedby={
                [field["aria-describedby"], showStrength ? meterId : null]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            />

            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={visible ? "Hide password" : "Show password"}
              title={visible ? "Hide password" : "Show password"}
              // Excluded from the tab order: it sits between the password
              // field and submit, and tabbing into a reveal toggle on the way
              // to submitting is a nuisance. Still reachable by pointer and
              // by shift-tabbing back.
              tabIndex={-1}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition duration-200 hover:bg-raise-md hover:text-accent"
            >
              <Icon name={visible ? "eye" : "lock"} className="text-xs" />
            </button>
          </div>
        )}
      </Field>

      {showStrength && (
        <div id={meterId} className="mt-2.5">
          <div className="flex items-center gap-2">
            {/* Four segments, filled up to the score */}
            <div
              className="flex h-1 flex-1 gap-1"
              role="meter"
              aria-valuenow={strength.score}
              aria-valuemin={0}
              aria-valuemax={4}
              aria-label={`Password strength: ${strength.label}`}
            >
              {[1, 2, 3, 4].map((segment) => (
                <span
                  key={segment}
                  className={cn(
                    "h-full flex-1 rounded-full transition-colors duration-300",
                    strength.score >= segment ? band.fill : "bg-raise-lg",
                  )}
                />
              ))}
            </div>

            {value.length > 0 && (
              <span
                className={cn(
                  "shrink-0 text-[10px] font-semibold uppercase tracking-wider",
                  band.text,
                )}
              >
                {strength.label}
              </span>
            )}
          </div>

          {/* Server-side errors take precedence over live advice. */}
          {!error && (
            <p className="mt-1.5 text-[11px] leading-5 text-ink-muted">
              {value.length === 0
                ? `At least ${PASSWORD_MIN} characters. A memorable phrase beats a short password with symbols.`
                : strength.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PasswordField;
