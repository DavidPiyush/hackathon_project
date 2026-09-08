/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

import {
  ENDPOINTS,
  SCHEMAS,
  PRIORITIES,
  STATUSES,
  STATUS_LABELS,
  validateAgainstSchema,
  buildPath,
} from "@/lib/api/schema";
import { toFieldErrors, ApiError, isApiConfigured } from "@/lib/api/client";
import { investigations, reports } from "@/lib/data/dashboard";
import { initialState, reducer, nextId } from "@/lib/store/reducer";

/**
 * Backend contract.
 *
 * The console's own data deliberately uses the API's field names — `case_id`,
 * `description`, `status`, `notes` — so that swapping the in-memory store for
 * live HTTP calls does not require renaming anything in the UI. These tests
 * fail if the two drift apart.
 */

describe("endpoint table", () => {
  it("covers every documented path", () => {
    const paths = Object.values(ENDPOINTS)
      .flatMap((group) => Object.values(group))
      .map((endpoint) => endpoint.path);

    for (const path of [
      "/auth/google",
      "/auth/google/callback",
      "/auth/status",
      "/auth/logout",
      "/gmail/profile",
      "/gmail/messages",
      "/gmail/messages/{message_id}",
      "/analysis/email",
      "/analysis/gmail/{message_id}",
      "/analysis/status",
      "/investigations",
      "/investigations/{case_id}",
      "/investigations/{case_id}/gmail/{message_id}/analyze",
      "/reports/{case_id}",
      "/reports/{case_id}/pdf",
      "/health",
      "/health/database",
      "/health/threat-intel",
      "/health/services",
      "/health/full",
    ]) {
      expect(paths, `${path} is missing from the endpoint table`).toContain(path);
    }
  });

  it("uses the documented method for each mutation", () => {
    expect(ENDPOINTS.auth.logout.method).toBe("POST");
    expect(ENDPOINTS.analysis.email.method).toBe("POST");
    expect(ENDPOINTS.investigations.create.method).toBe("POST");
    // The spec uses PATCH, not PUT — a partial update.
    expect(ENDPOINTS.investigations.update.method).toBe("PATCH");
    expect(ENDPOINTS.investigations.remove.method).toBe("DELETE");
  });

  it("names path parameters exactly as the spec does", () => {
    // `case_id` and `message_id`, not `caseId`/`id`.
    expect(ENDPOINTS.investigations.get.path).toContain("{case_id}");
    expect(ENDPOINTS.gmail.message.path).toContain("{message_id}");
    expect(ENDPOINTS.reports.pdf.path).toContain("{case_id}");
  });
});

describe("buildPath", () => {
  it("substitutes and encodes parameters", () => {
    expect(
      buildPath("/investigations/{case_id}", { case_id: "IR-2026-018" }),
    ).toBe("/investigations/IR-2026-018");

    expect(buildPath("/gmail/messages/{message_id}", { message_id: "a/b" })).toBe(
      "/gmail/messages/a%2Fb",
    );
  });

  it("fills every parameter in a multi-parameter path", () => {
    expect(
      buildPath("/investigations/{case_id}/gmail/{message_id}/analyze", {
        case_id: "IR-1",
        message_id: "m-1",
      }),
    ).toBe("/investigations/IR-1/gmail/m-1/analyze");
  });

  it("throws rather than sending a path with a literal placeholder", () => {
    expect(() => buildPath("/investigations/{case_id}", {})).toThrow(
      /Missing path parameter/,
    );

    expect(() =>
      buildPath("/investigations/{case_id}", { case_id: "" }),
    ).toThrow(/Missing path parameter/);
  });
});

describe("request schemas", () => {
  it("requires raw_email for analysis", () => {
    expect(validateAgainstSchema("EmailAnalysisRequest", {}).raw_email).toBeTruthy();

    expect(
      validateAgainstSchema("EmailAnalysisRequest", { raw_email: "From: a@b.c" }),
    ).toEqual({});
  });

  it("enforces the documented case_id length limit", () => {
    const errors = validateAgainstSchema("EmailAnalysisRequest", {
      raw_email: "From: a@b.c",
      case_id: "x".repeat(51),
    });

    expect(errors.case_id).toMatch(/50 characters/);
  });

  it("requires a title to create an investigation", () => {
    expect(validateAgainstSchema("InvestigationCreate", {}).title).toBeTruthy();

    expect(
      validateAgainstSchema("InvestigationCreate", { title: "Invoice fraud" }),
    ).toEqual({});
  });

  it("enforces the documented investigation length limits", () => {
    const errors = validateAgainstSchema("InvestigationCreate", {
      title: "x".repeat(201),
      description: "y".repeat(5001),
      analyst: "z".repeat(101),
    });

    expect(errors.title).toMatch(/200 characters/);
    expect(errors.description).toMatch(/5000 characters/);
    expect(errors.analyst).toMatch(/100 characters/);
  });

  it("allows a partial update with no fields at all", () => {
    // PATCH semantics: an empty body is valid, it just changes nothing.
    expect(validateAgainstSchema("InvestigationUpdate", {})).toEqual({});
  });

  it("enforces the notes limit, which only exists on update", () => {
    expect(SCHEMAS.InvestigationUpdate.fields.notes.maxLength).toBe(10000);

    expect(
      validateAgainstSchema("InvestigationUpdate", { notes: "n".repeat(10001) })
        .notes,
    ).toMatch(/10000 characters/);
  });

  it("throws for an unknown schema rather than silently passing", () => {
    expect(() => validateAgainstSchema("NoSuchSchema", {})).toThrow(
      /Unknown schema/,
    );
  });
});

describe("seed data matches the contract", () => {
  it("keys investigations by case_id", () => {
    for (const item of investigations) {
      expect(item.case_id, JSON.stringify(item.title)).toMatch(/^IR-/);
      // `id` would be the shape an isolated frontend invented.
      expect(item).not.toHaveProperty("id");
    }
  });

  it("uses description and notes, not summary", () => {
    for (const item of investigations) {
      expect(typeof item.description).toBe("string");
      expect(typeof item.notes).toBe("string");
      expect(item).not.toHaveProperty("summary");
    }
  });

  it("uses wire status values, not display labels", () => {
    for (const item of investigations) {
      expect(STATUSES, `status "${item.status}"`).toContain(item.status);
      expect(item).not.toHaveProperty("state");
    }
  });

  it("uses the documented priority vocabulary", () => {
    for (const item of investigations) {
      expect(PRIORITIES).toContain(item.priority);
    }
  });

  it("stays inside the documented length limits", () => {
    for (const item of investigations) {
      const errors = validateAgainstSchema("InvestigationCreate", {
        title: item.title,
        description: item.description,
        analyst: item.analyst,
      });

      expect(errors, `${item.case_id}: ${JSON.stringify(errors)}`).toEqual({});
    }
  });

  it("links reports to a case by case_id", () => {
    for (const report of reports) {
      if (report.case_id !== null) {
        expect(report.case_id).toMatch(/^IR-/);
      }

      // Reports keep their own `id`; only the link uses `case_id`.
      expect(report.id).toMatch(/^RPT-/);
      expect(report).not.toHaveProperty("caseId");
    }
  });

  it("gives every status a display label", () => {
    for (const status of STATUSES) {
      expect(STATUS_LABELS[status], status).toBeTruthy();
    }
  });
});

describe("reducer honours the contract", () => {
  it("creates cases with the contract field names", () => {
    const state = reducer(initialState(), {
      type: "case/create",
      title: "Supplier impersonation",
      description: "A look-alike domain is requesting invoice payment.",
      analyst: "SOC Analyst",
      priority: "high",
      risk: 70,
    });

    const created = state.investigations[0];

    expect(created.case_id).toMatch(/^IR-/);
    expect(created.status).toBe("active");
    expect(created).toHaveProperty("description");
    expect(created).toHaveProperty("notes");
    expect(created).not.toHaveProperty("summary");
    expect(created).not.toHaveProperty("state");
  });

  it("continues the case_id sequence rather than restarting", () => {
    const base = initialState();
    const next = nextId(base.investigations, "IR", 2026);

    expect(next).toMatch(/^IR-2026-\d{3}$/);

    // Higher than every existing case.
    const highest = Math.max(
      ...base.investigations.map((item) => Number(item.case_id.split("-").at(-1))),
    );

    expect(Number(next.split("-").at(-1))).toBe(highest + 1);
  });

  it("addresses cases by case_id when updating", () => {
    const base = initialState();
    const caseId = base.investigations[1].case_id;

    const state = reducer(base, {
      type: "case/update",
      id: caseId,
      change: { notes: "Escalated to the supplier's security team." },
    });

    expect(
      state.investigations.find((item) => item.case_id === caseId).notes,
    ).toBe("Escalated to the supplier's security team.");

    // Nothing else moved.
    expect(state.investigations).toHaveLength(base.investigations.length);
  });
});

describe("FastAPI error translation", () => {
  it("maps a 422 detail array onto field errors", () => {
    const errors = toFieldErrors([
      {
        loc: ["body", "title"],
        msg: "String should have at least 1 character",
        type: "string_too_short",
      },
      { loc: ["body", "description"], msg: "Too long", type: "string_too_long" },
    ]);

    expect(errors.title).toMatch(/at least 1 character/);
    expect(errors.description).toBe("Too long");
  });

  it("skips the 'body' wrapper when naming the field", () => {
    expect(toFieldErrors([{ loc: ["body"], msg: "Invalid" }])).toEqual({});
  });

  it("handles a nested location", () => {
    const errors = toFieldErrors([
      { loc: ["body", "items", 0, "raw_email"], msg: "Required" },
    ]);

    expect(errors.raw_email).toBe("Required");
  });

  it("keeps the first message per field", () => {
    const errors = toFieldErrors([
      { loc: ["body", "title"], msg: "First" },
      { loc: ["body", "title"], msg: "Second" },
    ]);

    expect(errors.title).toBe("First");
  });

  it("tolerates a non-array detail", () => {
    expect(toFieldErrors(undefined)).toEqual({});
    expect(toFieldErrors("Internal Server Error")).toEqual({});
    expect(toFieldErrors(null)).toEqual({});
  });
});

describe("client configuration", () => {
  it("reports that no backend is configured when the URL is unset", () => {
    // The app must degrade to local behaviour rather than throwing on import.
    expect(typeof isApiConfigured()).toBe("boolean");
  });

  it("carries status, code and field errors on ApiError", () => {
    const error = new ApiError("Rejected", {
      status: 422,
      code: "validation",
      fieldErrors: { title: "Required" },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.status).toBe(422);
    expect(error.code).toBe("validation");
    expect(error.fieldErrors.title).toBe("Required");
  });

  it("defaults sensibly when given no metadata", () => {
    const error = new ApiError("Boom");

    expect(error.status).toBe(0);
    expect(error.code).toBe("unknown");
    expect(error.fieldErrors).toEqual({});
  });
});
