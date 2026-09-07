"use server";

import {
  validateContact,
  containsSecrets,
  emptyContactValues,
} from "@/lib/utils/contact-validation";

/**
 * Contact form Server Action.
 *
 * The signature matches `useActionState`: previous state first, `FormData`
 * second. A `"use server"` module may only export async functions, so the
 * validation rules and the initial state live in
 * `lib/utils/contact-validation.js`.
 *
 * There is no mail backend in this build, so a successful submission is
 * recorded and acknowledged rather than delivered. The returned message says
 * so plainly instead of implying a human received it.
 */
export async function submitContact(previousState, formData) {
  const fields = {
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    category: formData.get("category") ?? "",
    message: formData.get("message") ?? "",
  };

  const errors = validateContact(fields);

  if (containsSecrets(fields.message)) {
    errors.message =
      "This looks like it contains a credential or private key. Please remove it and describe the issue instead.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors,
      // Echo the values back so a failed submit does not wipe the form.
      values: fields,
    };
  }

  // Where a real integration belongs: queue the enquiry, notify the on-call
  // analyst, write an audit record. Nothing leaves the process today.
  console.info("[contact] enquiry received", {
    category: fields.category,
    subjectLength: fields.subject.length,
    messageLength: fields.message.length,
  });

  return {
    status: "success",
    message:
      "Thanks — your enquiry has been recorded. This demo build has no mail backend, so nothing was emailed; a production deployment would route it to the on-call analyst.",
    errors: {},
    values: emptyContactValues,
  };
}
