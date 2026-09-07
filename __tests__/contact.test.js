import { describe, expect, it } from "vitest";

import {
  validateContact,
  containsSecrets,
  contactInitialState,
} from "@/lib/utils/contact-validation";
import { submitContact } from "@/lib/actions/contact";
import { inquiryTypes } from "@/lib/data/marketing";

/** Build a FormData the way the browser would for the contact form. */
function formDataFrom(fields) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Suspicious invoice email",
  category: "threat",
  message:
    "We received an invoice from a supplier requesting a change of banking details.",
};

describe("validateContact", () => {
  it("accepts a well-formed submission", () => {
    expect(validateContact(VALID)).toEqual({});
  });

  it("rejects an empty submission with an error per field", () => {
    const errors = validateContact({});

    expect(Object.keys(errors).sort()).toEqual([
      "category",
      "email",
      "message",
      "name",
      "subject",
    ]);
  });

  it("treats whitespace-only values as empty", () => {
    const errors = validateContact({ ...VALID, name: "   ", message: "   " });

    expect(errors.name).toBeDefined();
    expect(errors.message).toBeDefined();
  });

  it("requires a plausible email address", () => {
    for (const email of [
      "not-an-email",
      "missing@tld",
      "@example.com",
      "spaces in@example.com",
      "two@@example.com",
    ]) {
      expect(validateContact({ ...VALID, email }).email).toBeDefined();
    }
  });

  it("accepts unusual but valid addresses", () => {
    for (const email of [
      "a.b+tag@sub.example.co.uk",
      "analyst_1@example.io",
    ]) {
      expect(validateContact({ ...VALID, email }).email).toBeUndefined();
    }
  });

  it("only accepts a category from the published list", () => {
    expect(validateContact({ ...VALID, category: "made-up" }).category).toBeDefined();

    for (const type of inquiryTypes) {
      expect(
        validateContact({ ...VALID, category: type.value }).category,
      ).toBeUndefined();
    }
  });

  it("requires enough detail in the message to be actionable", () => {
    expect(validateContact({ ...VALID, message: "help" }).message).toBeDefined();
    expect(
      validateContact({ ...VALID, message: "a".repeat(20) }).message,
    ).toBeUndefined();
  });

  it("enforces upper length bounds", () => {
    expect(validateContact({ ...VALID, name: "a".repeat(121) }).name).toBeDefined();
    expect(
      validateContact({ ...VALID, subject: "a".repeat(161) }).subject,
    ).toBeDefined();
    expect(
      validateContact({ ...VALID, message: "a".repeat(4001) }).message,
    ).toBeDefined();
  });

  it("tolerates missing keys without throwing", () => {
    expect(() => validateContact({ name: undefined })).not.toThrow();
  });
});

describe("containsSecrets", () => {
  it("detects a pasted private key", () => {
    expect(
      containsSecrets("-----BEGIN RSA PRIVATE KEY-----\nMIIEow…"),
    ).toBe(true);
  });

  it("detects credential assignments", () => {
    expect(containsSecrets("password: hunter2")).toBe(true);
    expect(containsSecrets("api_key=abcdef123456")).toBe(true);
    expect(containsSecrets("API-KEY: abcdef123456")).toBe(true);
  });

  it("detects a token-shaped string", () => {
    expect(containsSecrets("my token is sk-abcdefghij0123456789")).toBe(true);
  });

  it("does not flag ordinary prose that mentions credentials", () => {
    expect(
      containsSecrets(
        "The phishing page asked the user for their password, which we have since rotated.",
      ),
    ).toBe(false);
  });

  it("handles absent input", () => {
    expect(containsSecrets(undefined)).toBe(false);
    expect(containsSecrets("")).toBe(false);
  });
});

describe("submitContact server action", () => {
  it("returns success for a valid submission", async () => {
    const state = await submitContact(contactInitialState, formDataFrom(VALID));

    expect(state.status).toBe("success");
    expect(state.errors).toEqual({});
  });

  it("says plainly that nothing was emailed, rather than implying delivery", async () => {
    const state = await submitContact(contactInitialState, formDataFrom(VALID));

    expect(state.message).toMatch(/no mail backend|nothing was emailed/i);
  });

  it("clears the fields after a successful submission", async () => {
    const state = await submitContact(contactInitialState, formDataFrom(VALID));

    expect(Object.values(state.values).every((value) => value === "")).toBe(
      true,
    );
  });

  it("returns field errors for an invalid submission", async () => {
    const state = await submitContact(
      contactInitialState,
      formDataFrom({ ...VALID, email: "nope" }),
    );

    expect(state.status).toBe("error");
    expect(state.errors.email).toBeDefined();
  });

  it("echoes the submitted values back so a failed submit does not wipe the form", async () => {
    const state = await submitContact(
      contactInitialState,
      formDataFrom({ ...VALID, email: "nope" }),
    );

    expect(state.values.name).toBe(VALID.name);
    expect(state.values.message).toBe(VALID.message);
  });

  it("rejects a submission containing a credential", async () => {
    const state = await submitContact(
      contactInitialState,
      formDataFrom({
        ...VALID,
        message: `Here is the account, password: hunter2, please investigate it.`,
      }),
    );

    expect(state.status).toBe("error");
    expect(state.errors.message).toMatch(/credential|private key/i);
  });

  it("handles a submission with no fields at all", async () => {
    const state = await submitContact(contactInitialState, new FormData());

    expect(state.status).toBe("error");
    expect(Object.keys(state.errors).length).toBeGreaterThan(0);
  });
});
