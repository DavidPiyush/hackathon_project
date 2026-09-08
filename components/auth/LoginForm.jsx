"use client";

import { useActionState, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { loginAction } from "@/lib/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PasswordField } from "@/components/auth/PasswordField";

const INITIAL = { status: "idle", message: "", errors: {}, values: {} };

/**
 * Sign-in form.
 *
 * Posts to a Server Action. On success the action redirects, so this component
 * only ever renders the idle or error state — there is no success branch to
 * get out of sync.
 */
export function LoginForm({ next, accounts = [] }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { errors = {}, values = {} } = state;

  /**
   * Fill a demo account in rather than making people retype it.
   *
   * Deliberately not named `useAccount` — a `use` prefix reads as a React hook
   * to both the linter and the next person to open this file.
   */
  const fillAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Where to go after signing in, validated server-side. */}
      <input type="hidden" name="next" value={next ?? ""} />

      {/*
        Errors are announced but must not steal focus — moving focus on submit
        failure loses the user's place in the form.
      */}
      <div aria-live="polite" aria-atomic="true">
        {state.status === "error" && state.message && (
          <div className="flex items-start gap-3 rounded-lg border border-critical/25 bg-critical/10 p-4 text-xs leading-6 text-critical">
            <Icon name="warning" className="mt-0.5 shrink-0" />
            <p>{state.message}</p>
          </div>
        )}
      </div>

      <Field id="login-email" label="Email address" error={errors.email} required>
        {(field) => (
          <Input
            {...field}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="analyst@company.com"
            value={email || values.email || ""}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        )}
      </Field>

      <PasswordField
        id="login-password"
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2.5 text-xs text-ink-muted">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-4 w-4"
          />
          Keep me signed in for 7 days
        </label>

        {/* Honest: there is no mail backend, so this is not a live flow. */}
        <span
          title="Password reset needs an email service, which this build does not have."
          className="cursor-not-allowed text-xs text-ink-faint"
        >
          Forgot password?
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={pending}
        iconEnd={pending ? undefined : "arrow-right"}
        className="w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      {/* Seeded accounts, so the console can be opened without signing up */}
      {accounts.length > 0 && (
        <div className="rounded-lg border border-accent/20 bg-accent/[0.05] p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
            <Icon name="key" className="text-[10px]" />
            Demo accounts
          </p>

          <ul className="mt-3 space-y-3">
            {accounts.map((account) => (
              <li
                key={account.email}
                className="rounded-lg border border-line bg-surface/60 p-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-xs font-semibold text-ink">
                    {account.label}
                  </p>

                  <button
                    type="button"
                    onClick={() => fillAccount(account)}
                    className={cn(
                      "shrink-0 text-[11px] font-semibold text-accent",
                      "underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent",
                    )}
                  >
                    Use this
                  </button>
                </div>

                <p className="mt-1 text-[10px] leading-4 text-ink-muted">
                  {account.description}
                </p>

                <dl className="mt-2 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <dt className="w-14 shrink-0 text-[10px] uppercase tracking-wider text-ink-faint">
                      Email
                    </dt>
                    <dd className="ioc text-ink-soft">{account.email}</dd>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <dt className="w-14 shrink-0 text-[10px] uppercase tracking-wider text-ink-faint">
                      Password
                    </dt>
                    <dd className="ioc text-ink-soft">{account.password}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export default LoginForm;
