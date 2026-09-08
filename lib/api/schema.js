/**
 * Backend contract.
 *
 * Transcribed from the FastAPI OpenAPI document (`ThreatDetect 1.0.0`) so the
 * frontend and the API cannot drift apart silently. Field names, length limits
 * and nullability all come from that document — this file is the reason the
 * console's own data uses `case_id`, `description`, `status` and `notes`
 * rather than the names an isolated frontend would have invented.
 *
 * `__tests__/api-contract.test.js` asserts these tables still match the
 * shapes the app builds and renders.
 */

/** Every documented endpoint, grouped as the spec groups them by tag. */
export const ENDPOINTS = {
  auth: {
    googleLogin: { method: "GET", path: "/auth/google" },
    googleCallback: {
      method: "GET",
      path: "/auth/google/callback",
      query: ["code", "state"],
    },
    status: { method: "GET", path: "/auth/status" },
    logout: { method: "POST", path: "/auth/logout" },
  },

  gmail: {
    profile: { method: "GET", path: "/gmail/profile" },
    messages: {
      method: "GET",
      path: "/gmail/messages",
      query: ["max_results", "page_token", "query"],
    },
    message: { method: "GET", path: "/gmail/messages/{message_id}" },
  },

  analysis: {
    email: { method: "POST", path: "/analysis/email", body: "EmailAnalysisRequest" },
    gmailMessage: { method: "POST", path: "/analysis/gmail/{message_id}" },
    status: { method: "GET", path: "/analysis/status" },
  },

  investigations: {
    list: { method: "GET", path: "/investigations" },
    create: { method: "POST", path: "/investigations", body: "InvestigationCreate" },
    get: { method: "GET", path: "/investigations/{case_id}" },
    update: {
      method: "PATCH",
      path: "/investigations/{case_id}",
      body: "InvestigationUpdate",
    },
    remove: { method: "DELETE", path: "/investigations/{case_id}" },
    analyzeGmail: {
      method: "POST",
      path: "/investigations/{case_id}/gmail/{message_id}/analyze",
    },
  },

  reports: {
    get: { method: "GET", path: "/reports/{case_id}" },
    pdf: { method: "GET", path: "/reports/{case_id}/pdf" },
  },

  health: {
    basic: { method: "GET", path: "/health" },
    database: { method: "GET", path: "/health/database" },
    threatIntel: { method: "GET", path: "/health/threat-intel" },
    services: { method: "GET", path: "/health/services" },
    full: { method: "GET", path: "/health/full" },
  },
};

/**
 * Request bodies, with the exact constraints from the spec.
 *
 * These drive client-side validation so a request is rejected here rather
 * than coming back as a 422 the user has to interpret.
 */
export const SCHEMAS = {
  EmailAnalysisRequest: {
    required: ["raw_email"],
    fields: {
      raw_email: { type: "string", minLength: 1 },
      case_id: { type: "string", maxLength: 50, nullable: true },
    },
  },

  InvestigationCreate: {
    required: ["title"],
    fields: {
      title: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: "string", maxLength: 5000, nullable: true },
      priority: { type: "string", default: "medium" },
      analyst: { type: "string", maxLength: 100, nullable: true },
    },
  },

  InvestigationUpdate: {
    required: [],
    fields: {
      title: { type: "string", minLength: 1, maxLength: 200, nullable: true },
      description: { type: "string", maxLength: 5000, nullable: true },
      priority: { type: "string", nullable: true },
      status: { type: "string", nullable: true },
      analyst: { type: "string", maxLength: 100, nullable: true },
      notes: { type: "string", maxLength: 10000, nullable: true },
    },
  },
};

/**
 * The spec types `priority` and `status` only as `string`, so these are the
 * frontend's vocabulary rather than an API constraint. Kept here so the UI and
 * any future request validation agree on one list.
 */
export const PRIORITIES = ["critical", "high", "medium", "low"];

export const STATUSES = ["open", "active", "pending_review", "monitoring", "closed"];

/** Display labels for the wire values above. */
export const STATUS_LABELS = {
  open: "Open",
  active: "Active",
  pending_review: "Pending Review",
  monitoring: "Monitoring",
  closed: "Closed",
};

/**
 * Validate a payload against a named schema.
 *
 * Returns a map of field errors, matching the shape the forms already use, so
 * a 422 from the server and a local rejection render identically.
 */
export function validateAgainstSchema(name, payload) {
  const schema = SCHEMAS[name];

  if (!schema) {
    throw new Error(`Unknown schema: ${name}`);
  }

  const errors = {};

  for (const field of schema.required) {
    const value = payload?.[field];

    if (value === undefined || value === null || String(value).trim() === "") {
      errors[field] = "This field is required.";
    }
  }

  for (const [field, rule] of Object.entries(schema.fields)) {
    const value = payload?.[field];

    if (value === undefined || value === null) {
      // Absent optional fields are fine; absent required ones are already flagged.
      continue;
    }

    const text = String(value);

    if (rule.minLength !== undefined && text.trim().length < rule.minLength) {
      errors[field] ??= `Must be at least ${rule.minLength} character${rule.minLength === 1 ? "" : "s"}.`;
    }

    if (rule.maxLength !== undefined && text.length > rule.maxLength) {
      errors[field] ??= `Must be ${rule.maxLength} characters or fewer.`;
    }
  }

  return errors;
}

/** Fill a path template, e.g. `/investigations/{case_id}` -> `/investigations/IR-1`. */
export function buildPath(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = params[key];

    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing path parameter "${key}" for ${template}`);
    }

    return encodeURIComponent(String(value));
  });
}
