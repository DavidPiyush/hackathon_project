"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  reducer,
  initialState,
  deserialize,
  serialize,
  STORAGE_KEY,
} from "@/lib/store/reducer";

import { useToast } from "@/components/providers/ToastProvider";

const DataContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* ============================================================
   API
   ============================================================ */

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/* ============================================================
   GMAIL HELPERS
   ============================================================ */

function headerValue(headers, name) {
  const header = (headers || []).find(
    (item) => String(item?.name || "").toLowerCase() === name.toLowerCase(),
  );

  return header?.value || "";
}

function decodeBase64Url(value) {
  if (!value) {
    return "";
  }

  try {
    const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");

    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

    const binary = window.atob(padded);

    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );

    return new TextDecoder("utf-8").decode(bytes);
  } catch (error) {
    console.warn("[DataProvider] Failed to decode Gmail body:", error);

    return "";
  }
}

/**
 * Gmail's full message is a MIME tree.
 *
 * Walk every part because body.data may not be directly
 * located on payload.body.
 */
function collectMessageParts(part, result) {
  if (!part) {
    return;
  }

  const mimeType = String(part.mimeType || "").toLowerCase();

  if (
    (mimeType === "text/plain" || mimeType === "text/html") &&
    part.body?.data
  ) {
    const decoded = decodeBase64Url(part.body.data);

    if (mimeType === "text/plain") {
      result.plain.push(decoded);
    }

    if (mimeType === "text/html") {
      result.html.push(decoded);
    }
  }

  for (const child of part.parts || []) {
    collectMessageParts(child, result);
  }
}

function extractMessageBody(message) {
  const result = {
    plain: [],
    html: [],
  };

  collectMessageParts(message?.payload, result);

  /*
   * Some Gmail messages may have body.data directly
   * on payload rather than inside parts.
   */
  if (
    !result.plain.length &&
    !result.html.length &&
    message?.payload?.body?.data
  ) {
    const mimeType = String(message?.payload?.mimeType || "").toLowerCase();

    const decoded = decodeBase64Url(message.payload.body.data);

    if (mimeType === "text/html") {
      result.html.push(decoded);
    } else {
      result.plain.push(decoded);
    }
  }

  return {
    text: result.plain.join("\n\n").trim(),
    html: result.html.join("\n").trim(),
  };
}

function parseSender(value) {
  if (!value) {
    return {
      name: "Unknown sender",
      email: "",
    };
  }

  const match = String(value).match(/^(.*?)\s*<([^<>]+)>$/);

  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, "").trim(),
      email: match[2].trim(),
    };
  }

  return {
    name: String(value).trim(),
    email: String(value).trim(),
  };
}

function extractAttachments(part, attachments = []) {
  if (!part) {
    return attachments;
  }

  if (part.filename) {
    attachments.push({
      filename: part.filename,
      mimeType: part.mimeType || "application/octet-stream",
      size: part.body?.size || 0,
      attachmentId: part.body?.attachmentId || null,
    });
  }

  for (const child of part.parts || []) {
    extractAttachments(child, attachments);
  }

  return attachments;
}

/* ============================================================
   GMAIL -> EXISTING UI MODEL
   ============================================================ */

function normalizeGmailMessage(response) {
  const message = response?.message || {};
  const metadata = response?.metadata || {};
  const payload = message.payload || {};
  const headers = payload.headers || [];

  const sender = parseSender(metadata.from || headerValue(headers, "From"));

  const subject =
    metadata.subject || headerValue(headers, "Subject") || "(No subject)";

  const receivedAt = metadata.date || headerValue(headers, "Date") || "";

  const body = extractMessageBody(message);

  const attachments = extractAttachments(payload);

  const labelIds = Array.isArray(message.labelIds)
    ? message.labelIds
    : Array.isArray(metadata.label_ids)
      ? metadata.label_ids
      : [];

  /*
   * Gmail system labels
   */
  const unread = labelIds.includes("UNREAD");

  const deleted = labelIds.includes("TRASH");

  /*
   * Gmail does not normally expose an "ARCHIVE" label.
   *
   * A message is archived when it is no longer in INBOX
   * and is not in TRASH.
   */
  const archived = !labelIds.includes("INBOX") && !deleted;

  const starred = labelIds.includes("STARRED");

  return {
    /*
     * Identity
     */
    id: message.id || metadata.message_id,

    gmailMessageId: message.id || metadata.message_id,

    threadId: message.threadId || metadata.thread_id || null,

    /*
     * Existing inbox fields
     */
    sender: sender.name,

    senderEmail: sender.email,

    subject,

    preview: metadata.snippet || message.snippet || body.text.slice(0, 180),

    receivedAt,

    time: receivedAt,

    /*
     * Content
     */
    body: body.text,

    bodyText: body.text,

    bodyHtml: body.html,

    /*
     * Raw Gmail information
     */
    snippet: message.snippet || metadata.snippet || "",

    labels: labelIds,

    headers: headers.map((header) => ({
      name: header.name,
      value: header.value,
    })),

    /*
     * Existing threat UI.
     *
     * Gmail itself does not return a ThreatDetect
     * risk verdict.
     */
    risk: 0,

    classification: "unknown",

    authentication: {
      spf: "unknown",
      dkim: "unknown",
      dmarc: "unknown",
    },

    infrastructure: {},

    indicators: [],

    findings: [],

    attachments,

    attachment: attachments.length > 0,

    link:
      /https?:\/\/|www\./i.test(body.text) ||
      /https?:\/\/|www\./i.test(body.html),

    /*
     * Existing local-console state
     */
    starred,

    unread,

    archived,

    deleted,

    caseId: null,

    /*
     * Evidence metadata
     */
    internalDate: message.internalDate || metadata.internal_date || null,

    sizeEstimate: message.sizeEstimate || metadata.size_estimate || 0,

    historyId: message.historyId || null,

    messageId: headerValue(headers, "Message-ID") || null,

    replyTo: headerValue(headers, "Reply-To") || null,

    returnPath: headerValue(headers, "Return-Path") || null,

    to: metadata.to || headerValue(headers, "To") || "",
  };
}

/* ============================================================
   PROVIDER
   ============================================================ */

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const { push } = useToast();

  const hydrated = useRef(false);

  const [backendLoading, setBackendLoading] = useState(true);

  const [backendError, setBackendError] = useState(null);

  const [backendConnected, setBackendConnected] = useState(false);

  /* ==========================================================
     LOCAL STORAGE HYDRATION
     ========================================================== */

  useEffect(() => {
    let stored = null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }

    if (stored) {
      dispatch({
        type: "state/hydrate",
        state: deserialize(stored),
      });
    }

    hydrated.current = true;
  }, []);

  /* ==========================================================
     LOCAL STORAGE PERSISTENCE
     ========================================================== */

  useEffect(() => {
    if (!hydrated.current || state.revision === 0) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(serialize(state)),
      );
    } catch {
      // Storage is optional.
    }
  }, [state]);

  /* ==========================================================
     LOAD REAL GMAIL DATA
     ========================================================== */

  const loadGmailMessages = useCallback(async () => {
    setBackendLoading(true);
    setBackendError(null);

    try {
      /*
       * First request:
       *
       * GET /gmail/messages
       *
       * This returns Gmail message references.
       */
      const listResponse = await apiFetch("/gmail/messages?max_results=20");

      const messageRefs = Array.isArray(listResponse?.messages)
        ? listResponse.messages
        : [];

      console.log(
        `[DataProvider] Gmail list returned ${messageRefs.length} messages.`,
      );

      /*
       * Second request:
       *
       * GET /gmail/messages/{message_id}
       *
       * Fetch complete Gmail message information.
       */
      const fullMessages = await Promise.all(
        messageRefs.map(async (item) => {
          if (!item?.id) {
            return null;
          }

          try {
            const response = await apiFetch(
              `/gmail/messages/${encodeURIComponent(item.id)}`,
            );

            return normalizeGmailMessage(response);
          } catch (error) {
            console.error(
              `[DataProvider] Failed to load Gmail message ${item.id}:`,
              error,
            );

            return null;
          }
        }),
      );

      const emails = fullMessages.filter(Boolean);

      /*
       * Replace the frontend email collection
       * with the real Gmail records.
       *
       * IMPORTANT:
       * The reducer already supports backend/sync.
       */
      if (emails.length > 0) {
        dispatch({
          type: "backend/sync",
          emails,
        });
      }

      setBackendConnected(true);

      console.log(`[DataProvider] Loaded ${emails.length} Gmail messages.`);

      return emails;
    } catch (error) {
      console.error("[DataProvider] Gmail backend load failed:", error);

      setBackendConnected(false);

      setBackendError(error);

      return [];
    } finally {
      setBackendLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGmailMessages();
  }, [loadGmailMessages]);

  /* ==========================================================
     EMAIL ACTIONS
     ========================================================== */

  const emailById = useCallback(
    (id) =>
      state.emails.find(
        (email) => email.id === id || email.gmailMessageId === id,
      ),
    [state.emails],
  );

  const toggleStar = useCallback(
    (id) => {
      const email = emailById(id);

      dispatch({
        type: "email/toggleStar",
        id,
      });

      push({
        title: email?.starred ? "Star removed" : "Message starred",
        description: email?.subject,
        tone: "info",
        duration: 2500,
      });
    },
    [emailById, push],
  );

  const setRead = useCallback((id, read) => {
    dispatch({
      type: "email/setRead",
      id,
      read,
    });
  }, []);

  const archiveEmails = useCallback(
    (ids) => {
      dispatch({
        type: "email/setArchived",
        ids,
        archived: true,
      });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} archived`,
        description: "Removed from the triage queue. Evidence is retained.",
        tone: "safe",
        action: {
          label: "Undo",
          onClick: () =>
            dispatch({
              type: "email/setArchived",
              ids,
              archived: false,
            }),
        },
      });
    },
    [push],
  );

  const unarchiveEmails = useCallback(
    (ids) => {
      dispatch({
        type: "email/setArchived",
        ids,
        archived: false,
      });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} restored`,
        description: "Back in the triage queue.",
        tone: "info",
        duration: 3000,
      });
    },
    [push],
  );

  const deleteEmails = useCallback(
    (ids) => {
      dispatch({
        type: "email/setDeleted",
        ids,
        deleted: true,
      });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} deleted`,
        description:
          "Soft-deleted — the original evidence record is never destroyed.",
        tone: "critical",
        action: {
          label: "Undo",
          onClick: () =>
            dispatch({
              type: "email/setDeleted",
              ids,
              deleted: false,
            }),
        },
      });
    },
    [push],
  );

  const restoreEmails = useCallback(
    (ids) => {
      dispatch({
        type: "email/setDeleted",
        ids,
        deleted: false,
      });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} recovered`,
        description: "Returned to the inbox.",
        tone: "safe",
        duration: 3000,
      });
    },
    [push],
  );

  const markRead = useCallback(
    (ids, read) => {
      dispatch({
        type: "email/setRoutine",
        ids,
        read,
      });

      push({
        title: `Marked ${ids.length} as ${read ? "read" : "unread"}`,
        tone: "info",
        duration: 2500,
      });
    },
    [push],
  );

  const assignCase = useCallback(
    (ids, caseId) => {
      const previous = ids.map((id) => ({
        id,
        caseId: emailById(id)?.caseId ?? null,
      }));

      dispatch({
        type: "email/assignCase",
        ids,
        caseId,
      });

      push({
        title: caseId ? `Added to ${caseId}` : "Removed from case",
        description: `${ids.length} message${
          ids.length === 1 ? "" : "s"
        } updated.`,
        tone: "accent",
        action: {
          label: "Undo",
          onClick: () => {
            for (const item of previous) {
              dispatch({
                type: "email/assignCase",
                ids: [item.id],
                caseId: item.caseId,
              });
            }
          },
        },
      });
    },
    [emailById, push],
  );

  /* ==========================================================
     INVESTIGATION ACTIONS
     ========================================================== */

  const createCase = useCallback(
    (draft) => {
      dispatch({
        type: "case/create",
        ...draft,
      });

      push({
        title: "Investigation opened",
        description: draft.title,
        tone: "safe",
      });
    },
    [push],
  );

  const updateCase = useCallback(
    (id, change) => {
      dispatch({
        type: "case/update",
        id,
        change,
      });

      push({
        title: `${id} updated`,
        tone: "safe",
        duration: 3000,
      });
    },
    [push],
  );

  const setCaseState = useCallback(
    (id, nextState) => {
      const previous = state.investigations.find((item) => item.id === id);

      dispatch({
        type: "case/setState",
        id,
        state: nextState,
      });

      push({
        title: `${id} — ${nextState}`,
        description:
          nextState === "Closed"
            ? "Closed. The report and audit trail stay attached."
            : undefined,
        tone: nextState === "Closed" ? "safe" : "info",
        action: previous
          ? {
              label: "Undo",
              onClick: () =>
                dispatch({
                  type: "case/setState",
                  id,
                  state: previous.state,
                }),
            }
          : undefined,
      });
    },
    [state.investigations, push],
  );

  const deleteCase = useCallback(
    (id) => {
      const item = state.investigations.find((entry) => entry.id === id);

      dispatch({
        type: "case/delete",
        id,
      });

      push({
        title: `${id} deleted`,
        description: "Linked messages were detached from the case.",
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () =>
                dispatch({
                  type: "case/restore",
                  item,
                }),
            }
          : undefined,
      });
    },
    [state.investigations, push],
  );

  /* ==========================================================
     INDICATOR ACTIONS
     ========================================================== */

  const createIndicator = useCallback(
    (draft) => {
      const exists = state.indicators.some(
        (item) => item.value === draft.value,
      );

      if (exists) {
        push({
          title: "Already registered",
          description: `${draft.value} is already in the registry.`,
          tone: "warn",
        });

        return false;
      }

      dispatch({
        type: "indicator/create",
        ...draft,
      });

      push({
        title: "Indicator registered",
        description: `${draft.value} added as unknown, pending enrichment.`,
        tone: "safe",
      });

      return true;
    },
    [state.indicators, push],
  );

  const enrichIndicator = useCallback(
    async (value) => {
      dispatch({
        type: "indicator/setEnriching",
        value,
        enriching: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 900));

      const indicator = state.indicators.find((item) => item.value === value);

      const verdict =
        indicator?.cases?.length > 1
          ? "malicious"
          : indicator?.cases?.length === 1
            ? "suspicious"
            : "unknown";

      dispatch({
        type: "indicator/setVerdict",
        value,
        verdict,
      });

      push({
        title: "Enrichment complete",
        description:
          verdict === "unknown"
            ? `${value} remains unknown — no corroborating sighting.`
            : `${value} assessed as ${verdict}.`,
        tone:
          verdict === "malicious"
            ? "critical"
            : verdict === "suspicious"
              ? "warn"
              : "info",
      });
    },
    [state.indicators, push],
  );

  const setIndicatorVerdict = useCallback(
    (value, verdict) => {
      const previous = state.indicators.find((item) => item.value === value);

      dispatch({
        type: "indicator/setVerdict",
        value,
        verdict,
      });

      push({
        title: `Verdict set to ${verdict}`,
        description: value,
        tone: verdict === "malicious" ? "critical" : "info",
        action: previous
          ? {
              label: "Undo",
              onClick: () =>
                dispatch({
                  type: "indicator/setVerdict",
                  value,
                  verdict: previous.verdict,
                }),
            }
          : undefined,
      });
    },
    [state.indicators, push],
  );

  const deleteIndicator = useCallback(
    (value) => {
      const item = state.indicators.find((entry) => entry.value === value);

      dispatch({
        type: "indicator/delete",
        value,
      });

      push({
        title: "Indicator removed",
        description: value,
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () =>
                dispatch({
                  type: "indicator/restore",
                  item,
                }),
            }
          : undefined,
      });
    },
    [state.indicators, push],
  );

  /* ==========================================================
     REPORT ACTIONS
     ========================================================== */

  const createReport = useCallback(
    (draft) => {
      dispatch({
        type: "report/create",
        ...draft,
      });

      push({
        title: "Report generated",
        description: `${draft.title} — saved as a draft for sign-off.`,
        tone: "safe",
      });
    },
    [push],
  );

  const finalizeReport = useCallback(
    (id) => {
      dispatch({
        type: "report/finalize",
        id,
      });

      push({
        title: `${id} finalised`,
        description: "Content hash recorded. The report is now immutable.",
        tone: "safe",
      });
    },
    [push],
  );

  const deleteReport = useCallback(
    (id) => {
      const item = state.reports.find((entry) => entry.id === id);

      dispatch({
        type: "report/delete",
        id,
      });

      push({
        title: `${id} deleted`,
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () =>
                dispatch({
                  type: "report/restore",
                  item,
                }),
            }
          : undefined,
      });
    },
    [state.reports, push],
  );

  /* ==========================================================
     SETTINGS
     ========================================================== */

  const setSetting = useCallback((key, value) => {
    dispatch({
      type: "settings/set",
      key,
      value,
    });
  }, []);

  const saveSettings = useCallback(
    (settings) => {
      dispatch({
        type: "settings/replace",
        settings,
      });

      push({
        title: "Settings saved",
        description: "Stored in this browser. There is no server to sync to.",
        tone: "safe",
      });
    },
    [push],
  );

  const resetSettings = useCallback(() => {
    dispatch({
      type: "settings/reset",
    });

    push({
      title: "Settings restored to defaults",
      tone: "info",
    });
  }, [push]);

  const resetAll = useCallback(() => {
    dispatch({
      type: "state/reset",
    });

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }

    push({
      title: "Console reset",
      description: "All local changes discarded; seed data restored.",
      tone: "warn",
    });
  }, [push]);

  /* ==========================================================
     CONTEXT
     ========================================================== */

  const value = useMemo(
    () => ({
      ...state,

      backendLoading,

      backendError,

      backendConnected,

      refreshGmail: loadGmailMessages,

      actions: {
        toggleStar,

        setRead,

        archiveEmails,

        unarchiveEmails,

        deleteEmails,

        restoreEmails,

        markRead,

        assignCase,

        createCase,

        updateCase,

        setCaseState,

        deleteCase,

        createIndicator,

        enrichIndicator,

        setIndicatorVerdict,

        deleteIndicator,

        createReport,

        finalizeReport,

        deleteReport,

        setSetting,

        saveSettings,

        resetSettings,

        resetAll,
      },
    }),
    [
      state,

      backendLoading,

      backendError,

      backendConnected,

      loadGmailMessages,

      toggleStar,

      setRead,

      archiveEmails,

      unarchiveEmails,

      deleteEmails,

      restoreEmails,

      markRead,

      assignCase,

      createCase,

      updateCase,

      setCaseState,

      deleteCase,

      createIndicator,

      enrichIndicator,

      setIndicatorVerdict,

      deleteIndicator,

      createReport,

      finalizeReport,

      deleteReport,

      setSetting,

      saveSettings,

      resetSettings,

      resetAll,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useData must be used inside a DataProvider");
  }

  return context;
}

export default DataProvider;
