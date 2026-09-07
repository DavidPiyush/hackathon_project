"use client";

import { useActionState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { submitContact } from "@/lib/actions/contact";
import { contactInitialState } from "@/lib/utils/contact-validation";
import { inquiryTypes } from "@/lib/data/marketing";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Form";

/**
 * Working contact form.
 *
 * The previous version had no `action`, no `name` attributes and no state — it
 * silently discarded every submission. This one posts to a Server Action,
 * validates on the server, renders per-field errors, keeps the user's input on
 * failure, and announces the outcome to assistive tech.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    contactInitialState,
  );

  const { errors, values, status } = state;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Outcome banner. `aria-live` announces it without stealing focus. */}
      <div aria-live="polite" aria-atomic="true">
        {status !== "idle" && state.message && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 text-xs leading-6",
              status === "success"
                ? "border-safe/25 bg-safe/10 text-safe"
                : "border-critical/25 bg-critical/10 text-critical",
            )}
          >
            <Icon
              name={status === "success" ? "check-circle" : "warning"}
              className="mt-0.5 shrink-0"
            />
            <p>{state.message}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name} required>
          {(field) => (
            <Input
              {...field}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              defaultValue={values.name}
              error={errors.name}
            />
          )}
        </Field>

        <Field id="email" label="Email address" error={errors.email} required>
          {(field) => (
            <Input
              {...field}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={values.email}
              error={errors.email}
            />
          )}
        </Field>
      </div>

      <Field id="subject" label="Subject" error={errors.subject} required>
        {(field) => (
          <Input
            {...field}
            name="subject"
            type="text"
            placeholder="How can we help?"
            defaultValue={values.subject}
            error={errors.subject}
          />
        )}
      </Field>

      <Field
        id="category"
        label="Inquiry type"
        error={errors.category}
        required
      >
        {(field) => (
          <Select
            {...field}
            name="category"
            defaultValue={values.category}
            error={errors.category}
          >
            <option value="">Select an inquiry type</option>

            {inquiryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="message"
        label="Message"
        error={errors.message}
        hint="Describe what you are seeing. Include message IDs or indicators where relevant."
        required
      >
        {(field) => (
          <Textarea
            {...field}
            name="message"
            placeholder="Describe your question or the activity you are investigating..."
            defaultValue={values.message}
            error={errors.message}
          />
        )}
      </Field>

      {/* Standing warning — and the server rejects credential-shaped content. */}
      <div className="flex items-start gap-3 rounded-lg border border-warn/20 bg-warn/[0.06] p-3">
        <Icon name="lock" className="mt-0.5 shrink-0 text-warn" />

        <p className="text-[11px] leading-5 text-ink-soft">
          <strong className="font-semibold text-warn">
            Never send secrets.
          </strong>{" "}
          Do not include passwords, private keys, session tokens or API keys.
          Submissions containing credential-shaped content are rejected
          automatically.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={pending}
        iconEnd={pending ? undefined : "arrow-right"}
        className="w-full"
      >
        {pending ? "Sending…" : "Send secure message"}
      </Button>

      <p className="flex items-center justify-center gap-2 text-[11px] text-ink-faint">
        <Icon name="shield" className="text-accent" />
        Your enquiry is handled under our{" "}
        <Link
          href="/privacy"
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
        >
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

export default ContactForm;
