import { inquiryTypes } from "@/lib/data/marketing";

/**
 * Contact form validation.
 *
 * Kept in a plain module rather than inside the `"use server"` action file,
 * because a Server Action module may only export async functions. It also
 * means the rules are unit-testable without a running server, and the client
 * could reuse them for optimistic feedback.
 */
export function validateContact(fields) {
  const errors = {};

  const name = (fields.name ?? "").trim();
  const email = (fields.email ?? "").trim();
  const subject = (fields.subject ?? "").trim();
  const category = (fields.category ?? "").trim();
  const message = (fields.message ?? "").trim();

  if (name.length < 2) {
    errors.name = "Please enter your full name.";
  } else if (name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  // Deliberately permissive: the only reliable proof of a working address is a
  // confirmation email, so this rejects obvious typos and nothing more.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (subject.length < 4) {
    errors.subject = "Please add a short subject line.";
  } else if (subject.length > 160) {
    errors.subject = "Subject must be 160 characters or fewer.";
  }

  if (!inquiryTypes.some((type) => type.value === category)) {
    errors.category = "Please choose an inquiry type.";
  }

  if (message.length < 20) {
    errors.message = "Please give us at least 20 characters of detail.";
  } else if (message.length > 4000) {
    errors.message = "Message must be 4000 characters or fewer.";
  }

  return errors;
}

/**
 * Credential-shaped content that must never be accepted through a public form.
 * The form asks users not to send secrets; this enforces it server-side so a
 * pasted key is rejected before it could be persisted or forwarded anywhere.
 */
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /\bpassword\s*[:=]\s*\S+/i,
  /\bapi[_-]?key\s*[:=]\s*\S+/i,
  /\bsk-[A-Za-z0-9]{16,}/,
];

export function containsSecrets(message) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(message ?? ""));
}

/** Blank field set, shared by the initial state and the post-success reset. */
export const emptyContactValues = {
  name: "",
  email: "",
  subject: "",
  category: "",
  message: "",
};

/** Initial state for `useActionState`. */
export const contactInitialState = {
  status: "idle",
  message: "",
  errors: {},
  values: emptyContactValues,
};
