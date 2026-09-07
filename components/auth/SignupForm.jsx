"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { signupAction } from "@/lib/actions/auth";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PasswordField } from "@/components/auth/PasswordField";

const INITIAL = { status: "idle", message: "", errors: {}, values: {} };

/**
 * Account creation.
 *
 * The password field scores as you type using the same rule the Server Action
 * enforces, so the guidance on screen and the decision on submit can never
 * disagree. On success the action redirects straight into the console — there
 * is no email confirmation step, because there is no mail backend, and adding
 * a fake one would be worse than omitting it.
 */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, INITIAL);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { errors = {}, values = {} } = state;

  // Only flag a mismatch once the user has actually started confirming.
  const mismatch =
    confirm.length > 0 && password.length > 0 && confirm !== password;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div aria-live="polite" aria-atomic="true">
        {state.status === "error" && state.message && (
          <div className="flex items-start gap-3 rounded-lg border border-critical/25 bg-critical/10 p-4 text-xs leading-6 text-critical">
            <Icon name="warning" className="mt-0.5 shrink-0" />

            <p>
              {state.message}
              {errors.email?.includes("already exists") && (
                <>
                  {" "}
                  <Link
                    href="/login"
                    className="font-semibold underline decoration-critical/40 underline-offset-2 hover:decoration-critical"
                  >
                    Sign in instead
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <Field id="signup-name" label="Full name" error={errors.name} required>
        {(field) => (
          <Input
            {...field}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name || values.name || ""}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
          />
        )}
      </Field>

      <Field
        id="signup-email"
        label="Work email"
        error={errors.email}
        hint="Used to sign in. Nothing is sent to it in this build."
        required
      >
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
        id="signup-password"
        label="Password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        showStrength
        // Passed so the score can reject a password containing the user's own
        // name or email local-part.
        context={{ name, email }}
      />

      <PasswordField
        id="signup-confirm"
        name="confirm"
        label="Confirm password"
        autoComplete="new-password"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm ?? (mismatch ? "Passwords do not match." : undefined)}
      />

      {/* Unticked by default — a pre-ticked consent box is not consent. */}
      <div>
        <label className="flex items-start gap-3 text-[11px] leading-5 text-ink-soft">
          <input
            type="checkbox"
            name="terms"
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "signup-terms-error" : undefined}
          />

          <span>
            I accept the{" "}
            <Link
              href="/security"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              security terms
            </Link>{" "}
            and the{" "}
            <Link
              href="/privacy"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>

        {errors.terms && (
          <p
            id="signup-terms-error"
            role="alert"
            className="mt-1.5 flex items-start gap-1.5 text-[11px] text-critical"
          >
            <Icon name="warning" className="mt-0.5 shrink-0 text-[10px]" />
            {errors.terms}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        loading={pending}
        iconEnd={pending ? undefined : "arrow-right"}
        className="w-full"
      >
        {pending ? "Creating your account…" : "Create account"}
      </Button>

      <p className="flex items-start gap-2 rounded-lg border border-line bg-raise p-3 text-[11px] leading-5 text-ink-muted">
        <Icon name="lock" className="mt-0.5 shrink-0 text-accent" />
        Your password is hashed with scrypt and a per-account salt before it is
        stored. It is never logged, never emailed, and cannot be recovered —
        only reset.
      </p>
    </form>
  );
}

export default SignupForm;
