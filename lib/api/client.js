import {
  ENDPOINTS,
  buildPath,
  validateAgainstSchema,
} from "@/lib/api/schema";

/**
 * HTTP client for the ThreatDetect FastAPI backend.
 *
 * Every call goes through one `request()` so credentials, error shaping and
 * timeouts are handled in a single place rather than per call site.
 *
 * The backend authenticates with a cookie set by the Google OAuth callback, so
 * requests send `credentials: "include"`. That is also why `NEXT_PUBLIC_API_URL`
 * must be a real origin in production — a wildcard CORS policy cannot be used
 * with credentialed requests.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/** Whether a backend is configured at all. */
export function isApiConfigured() {
  return API_BASE_URL.length > 0;
}

/** Error carrying the status and any FastAPI validation detail. */
export class ApiError extends Error {
  constructor(message, { status, code, detail, fieldErrors } = {}) {
    super(message);

    this.name = "ApiError";
    this.status = status ?? 0;
    this.code = code ?? "unknown";
    this.detail = detail;
    this.fieldErrors = fieldErrors ?? {};
  }
}

/**
 * Turn FastAPI's 422 body into the field-error map the forms already render.
 *
 * The shape is `{ detail: [{ loc: ["body", "title"], msg, type }] }`, so the
 * field name is the last string in `loc`.
 */
export function toFieldErrors(detail) {
  if (!Array.isArray(detail)) {
    return {};
  }

  const errors = {};

  for (const item of detail) {
    const location = Array.isArray(item?.loc) ? item.loc : [];

    const field = [...location]
      .reverse()
      .find((part) => typeof part === "string" && part !== "body");

    if (field && !errors[field]) {
      errors[field] = item.msg ?? "Invalid value.";
    }
  }

  return errors;
}

const DEFAULT_TIMEOUT_MS = 15000;

async function request(
  endpoint,
  { params, query, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  if (!isApiConfigured()) {
    throw new ApiError(
      "No backend is configured. Set NEXT_PUBLIC_API_URL to the FastAPI origin.",
      { code: "not_configured" },
    );
  }

  const url = new URL(buildPath(endpoint.path, params), `${API_BASE_URL}/`);

  for (const [key, value] of Object.entries(query ?? {})) {
    // Skip absent optional query params rather than sending "undefined".
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  // A hung request should fail rather than spin forever, but an explicit
  // caller signal still wins.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response;

  try {
    response = await fetch(url, {
      method: endpoint.method,
      // The backend session is a cookie, so it has to be sent.
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("The request timed out.", { code: "timeout" });
    }

    throw new ApiError("Could not reach the backend.", {
      code: "network",
      detail: error.message,
    });
  } finally {
    clearTimeout(timer);
  }

  // 204 and other empty bodies must not be parsed as JSON.
  const text = await response.text();

  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    if (response.status === 422) {
      throw new ApiError("The request was rejected as invalid.", {
        status: 422,
        code: "validation",
        detail: payload?.detail,
        fieldErrors: toFieldErrors(payload?.detail),
      });
    }

    if (response.status === 401 || response.status === 403) {
      throw new ApiError("Your session has expired. Sign in again.", {
        status: response.status,
        code: "unauthenticated",
      });
    }

    throw new ApiError(
      payload?.detail?.toString?.() ?? `Request failed (${response.status}).`,
      { status: response.status, code: "http", detail: payload },
    );
  }

  return payload;
}

/* ============================ AUTHENTICATION ============================ */

/**
 * Where to send the browser to start Google sign-in.
 *
 * This is a full navigation, not a fetch: the OAuth flow redirects to Google
 * and back to the callback, which a same-origin `fetch` cannot follow.
 */
export function googleLoginUrl() {
  return isApiConfigured()
    ? `${API_BASE_URL}${ENDPOINTS.auth.googleLogin.path}`
    : null;
}

export const auth = {
  status: (options) => request(ENDPOINTS.auth.status, options),
  logout: (options) => request(ENDPOINTS.auth.logout, options),
};

/* ================================ GMAIL ================================ */

export const gmail = {
  profile: (options) => request(ENDPOINTS.gmail.profile, options),

  messages: ({ maxResults, pageToken, query, ...options } = {}) =>
    request(ENDPOINTS.gmail.messages, {
      ...options,
      query: {
        max_results: maxResults,
        page_token: pageToken,
        query,
      },
    }),

  message: (messageId, options) =>
    request(ENDPOINTS.gmail.message, {
      ...options,
      params: { message_id: messageId },
    }),
};

/* =============================== ANALYSIS =============================== */

export const analysis = {
  /** Analyse raw RFC 5322 content. Validated locally against the spec first. */
  email: ({ rawEmail, caseId } = {}, options) => {
    const body = { raw_email: rawEmail, ...(caseId ? { case_id: caseId } : {}) };

    const errors = validateAgainstSchema("EmailAnalysisRequest", body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError("The request was rejected as invalid.", {
        code: "validation",
        fieldErrors: errors,
      });
    }

    return request(ENDPOINTS.analysis.email, { ...options, body });
  },

  gmailMessage: (messageId, options) =>
    request(ENDPOINTS.analysis.gmailMessage, {
      ...options,
      params: { message_id: messageId },
    }),

  status: (options) => request(ENDPOINTS.analysis.status, options),
};

/* ============================ INVESTIGATIONS ============================ */

export const investigations = {
  list: (options) => request(ENDPOINTS.investigations.list, options),

  get: (caseId, options) =>
    request(ENDPOINTS.investigations.get, {
      ...options,
      params: { case_id: caseId },
    }),

  create: ({ title, description, priority, analyst } = {}, options) => {
    const body = {
      title,
      ...(description ? { description } : {}),
      ...(priority ? { priority } : {}),
      ...(analyst ? { analyst } : {}),
    };

    const errors = validateAgainstSchema("InvestigationCreate", body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError("The request was rejected as invalid.", {
        code: "validation",
        fieldErrors: errors,
      });
    }

    return request(ENDPOINTS.investigations.create, { ...options, body });
  },

  update: (caseId, changes = {}, options) => {
    // PATCH is partial: send only what changed, so a field the caller left
    // out is not overwritten with null.
    const body = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );

    const errors = validateAgainstSchema("InvestigationUpdate", body);

    if (Object.keys(errors).length > 0) {
      throw new ApiError("The request was rejected as invalid.", {
        code: "validation",
        fieldErrors: errors,
      });
    }

    return request(ENDPOINTS.investigations.update, {
      ...options,
      params: { case_id: caseId },
      body,
    });
  },

  remove: (caseId, options) =>
    request(ENDPOINTS.investigations.remove, {
      ...options,
      params: { case_id: caseId },
    }),

  analyzeGmail: (caseId, messageId, options) =>
    request(ENDPOINTS.investigations.analyzeGmail, {
      ...options,
      params: { case_id: caseId, message_id: messageId },
    }),
};

/* ================================ REPORTS ================================ */

export const reports = {
  get: (caseId, options) =>
    request(ENDPOINTS.reports.get, { ...options, params: { case_id: caseId } }),

  /** The PDF is a download, so the browser is pointed at it directly. */
  pdfUrl: (caseId) =>
    isApiConfigured()
      ? `${API_BASE_URL}${buildPath(ENDPOINTS.reports.pdf.path, { case_id: caseId })}`
      : null,
};

/* ================================ HEALTH ================================ */

export const health = {
  basic: (options) => request(ENDPOINTS.health.basic, options),
  database: (options) => request(ENDPOINTS.health.database, options),
  threatIntel: (options) => request(ENDPOINTS.health.threatIntel, options),
  services: (options) => request(ENDPOINTS.health.services, options),
  full: (options) => request(ENDPOINTS.health.full, options),
};

export const api = {
  auth,
  gmail,
  analysis,
  investigations,
  reports,
  health,
  googleLoginUrl,
  isApiConfigured,
};

export default api;
