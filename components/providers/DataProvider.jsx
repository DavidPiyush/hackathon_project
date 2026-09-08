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

  const unread = labelIds.includes("UNREAD");

  const deleted = labelIds.includes("TRASH");

  const archived = !labelIds.includes("INBOX") && !deleted;

  const starred = labelIds.includes("STARRED");

  return {
    id: message.id || metadata.message_id,

    gmailMessageId: message.id || metadata.message_id,

    threadId: message.threadId || metadata.thread_id || null,

    sender: sender.name,

    senderEmail: sender.email,

    subject,

    preview: metadata.snippet || message.snippet || body.text.slice(0, 180),

    receivedAt,

    time: receivedAt,

    body: body.text,

    bodyText: body.text,

    bodyHtml: body.html,

    snippet: message.snippet || metadata.snippet || "",

    labels: labelIds,

    headers: headers.map((header) => ({
      name: header.name,
      value: header.value,
    })),

    risk: 0,

    classification: "unknown",

    authentication: {
      spf: "unknown",
      dkim: "unknown",
      dmarc: "unknown",
    },

    analysis: null,

    identityAnalysis: null,

    behavioralAnalysis: null,

    threatIntelligence: null,

    infrastructure: {},

    indicators: [],

    findings: [],

    attachments,

    attachment: attachments.length > 0,

    link:
      /https?:\/\/|www\./i.test(body.text) ||
      /https?:\/\/|www\./i.test(body.html),

    starred,

    unread,

    archived,

    deleted,

    caseId: null,

    internalDate: message.internalDate || metadata.internal_date || null,

    sizeEstimate: message.sizeEstimate || metadata.size_estimate || 0,

    historyId: message.historyId || null,

    messageId: headerValue(headers, "Message-ID") || null,

    replyTo: headerValue(headers, "Reply-To") || null,

    returnPath: headerValue(headers, "Return-Path") || null,

    to: metadata.to || headerValue(headers, "To") || "",
  };
}

function resultForIndicator(data, value) {
  const needle = String(value).toLowerCase();
  const results = [
    ...(Array.isArray(data?.ips) ? data.ips : []),
    ...(Array.isArray(data?.domains) ? data.domains : []),
    ...(Array.isArray(data?.urls) ? data.urls : []),
  ];

  return results.find(
    (item) => String(item?.indicator || "").toLowerCase() === needle,
  );
}

function toEnrichment(data, result, fallbackType = null) {
  if (!result) return null;

  return {
    analyzedAt: data?.analyzed_at || null,
    indicator: result.indicator || null,
    indicatorType: result.indicator_type || fallbackType,
    available: result.available ?? true,
    reputation: String(result.reputation || "unknown").toLowerCase(),
    threatScore: Number(result.threat_score || 0),
    abuseConfidence: Number(result.abuse_confidence || 0),
    malicious: Boolean(result.malicious),
    suspicious: Boolean(result.suspicious),
    country: result.country || null,
    countryCode: result.country_code || null,
    asn: result.asn || null,
    organization: result.organization || null,
    isp: result.isp || null,
    isTor: Boolean(result.is_tor),
    isVpn: Boolean(result.is_vpn),
    isProxy: Boolean(result.is_proxy),
    isOpenRelay: Boolean(result.is_open_relay),
    categories: Array.isArray(result.categories)
      ? result.categories
      : result.categories
        ? [result.categories]
        : [],
    reports: Number(result.reports || 0),
    finalUrl: result.final_url || null,
    domain: result.domain || null,
    registrar: result.registrar || null,
    creationDate: result.creation_date || null,
    expirationDate: result.expiration_date || null,
    nameServers: Array.isArray(result.name_servers) ? result.name_servers : [],
    resolutions: Array.isArray(result.resolutions) ? result.resolutions : [],
    evidence: Array.isArray(result.evidence) ? result.evidence : [],
    providers: result.providers || {},
    errors: Array.isArray(result.errors) ? result.errors : [],
  };
}

function deriveIndicatorVerdict(result, emailRisk = 0) {
  if (!result) {
    return Number(emailRisk) >= 70 ? "suspicious" : "unknown";
  }

  const reputation = String(result.reputation || "unknown").toLowerCase();
  const score = Number(result.threat_score || 0);

  if (
    reputation === "malicious" &&
    (score >= 80 || result.malicious === true)
  ) {
    return "malicious";
  }

  if (
    reputation === "malicious" ||
    reputation === "suspicious" ||
    result.suspicious === true ||
    score >= 60 ||
    Number(emailRisk) >= 70
  ) {
    return "suspicious";
  }

  return "unknown";
}

function buildLiveIndicators(emails) {
  const registry = new Map();

  for (const email of Array.isArray(emails) ? emails : []) {
    const analysis = email?.analysis;
    const parsed = analysis?.email || {};

    const emailRisk = Number(analysis?.risk?.score ?? email?.risk ?? 0);

    const senderDomain =
      String(email?.senderEmail || "")
        .split("@")
        .pop()
        ?.toLowerCase() || "";

    const sources = [
      ...(Array.isArray(parsed.ips) ? parsed.ips : []).map((value) => ({
        value,
        type: "IPv4",
      })),
      ...(Array.isArray(parsed.domains) ? parsed.domains : []).map((value) => ({
        value,
        type: "Domain",
      })),
      ...(Array.isArray(parsed.urls) ? parsed.urls : []).map((value) => ({
        value,
        type: "URL",
      })),
    ];

    for (const source of sources) {
      const value = String(source.value || "").trim();
      if (!value) continue;

      const key = value.toLowerCase();
      const existing = registry.get(key);

      let tiResult = resultForIndicator(analysis?.threat_intelligence, value);

      if (!tiResult) {
        const infrastructure = analysis?.infrastructure || {};
        tiResult =
          resultForIndicator(infrastructure?.threat_intelligence, value) ||
          resultForIndicator(infrastructure, value);
      }

      const enrichment = toEnrichment(
        analysis?.threat_intelligence ||
          analysis?.infrastructure?.threat_intelligence ||
          {},
        tiResult,
      );

      const caseIds = new Set(existing?.cases || []);
      if (email.caseId) caseIds.add(email.caseId);

      const current = {
        value,
        type: source.type,
        verdict: deriveIndicatorVerdict(tiResult, emailRisk),
        firstSeen:
          existing?.firstSeen ||
          String(email.receivedAt || email.internalDate || "").slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
        sightings: Number(existing?.sightings || 0) + 1,
        cases: [...caseIds],
        context:
          existing?.context ||
          `Observed in ${email.subject || "analyzed email"}${
            senderDomain ? ` · ${senderDomain}` : ""
          }`,
        enriching: false,
        enrichment: enrichment || existing?.enrichment || null,
      };

      if (existing) {
        const rank = {
          unknown: 0,
          suspicious: 1,
          malicious: 2,
        };

        if ((rank[current.verdict] || 0) < (rank[existing.verdict] || 0)) {
          current.verdict = existing.verdict;
        }

        if (
          existing.enrichment &&
          (!current.enrichment ||
            Number(existing.enrichment.threatScore || 0) >
              Number(current.enrichment.threatScore || 0))
        ) {
          current.enrichment = existing.enrichment;
        }
      }

      registry.set(key, current);
    }
  }

  return [...registry.values()];
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const { push } = useToast();

  const hydrated = useRef(false);

  const [backendLoading, setBackendLoading] = useState(true);

  const [backendError, setBackendError] = useState(null);

  const [backendConnected, setBackendConnected] = useState(false);

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

  useEffect(() => {
    if (!hydrated.current || state.revision === 0) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(serialize(state)),
      );
    } catch {}
  }, [state]);

  const loadGmailMessages = useCallback(async () => {
    setBackendLoading(true);
    setBackendError(null);

    try {
      const listResponse = await apiFetch("/gmail/messages?max_results=20");

      const messageRefs = Array.isArray(listResponse?.messages)
        ? listResponse.messages
        : [];

      console.log(
        `[DataProvider] Gmail list returned ${messageRefs.length} messages.`,
      );

      const fullMessages = [];
      const CONCURRENCY = 5;

      for (let index = 0; index < messageRefs.length; index += CONCURRENCY) {
        const batch = messageRefs.slice(index, index + CONCURRENCY);

        const results = await Promise.all(
          batch.map(async (item) => {
            if (!item?.id) return null;

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

        fullMessages.push(...results.filter(Boolean));

        if (results.some(Boolean)) {
          dispatch({
            type: "backend/sync",
            emails: results.filter(Boolean),
          });
        }
      }

      const emails = fullMessages;

      setBackendConnected(true);
      setBackendLoading(false);

      console.log(`[DataProvider] Loaded ${emails.length} Gmail messages.`);

      const analyzeInBackground = async () => {
        const ANALYSIS_CONCURRENCY = 3;

        for (
          let index = 0;
          index < emails.length;
          index += ANALYSIS_CONCURRENCY
        ) {
          const batch = emails.slice(index, index + ANALYSIS_CONCURRENCY);

          await Promise.all(
            batch.map(async (email) => {
              if (!email?.gmailMessageId) return;

              if (email.analysis) return;

              try {
                const response = await apiFetch(
                  `/analysis/gmail/${encodeURIComponent(email.gmailMessageId)}`,
                  {
                    method: "POST",
                  },
                );

                const analysis = response?.data || response || null;

                if (!analysis) return;

                const analyzedEmail = {
                  ...email,
                  analysis,
                  risk: Number(analysis?.risk?.score ?? email.risk ?? 0),
                  classification:
                    analysis?.risk?.classification ||
                    analysis?.classification ||
                    "unknown",
                  authentication:
                    analysis?.authentication || email.authentication,
                  identityAnalysis: analysis?.identity_analysis || null,
                  behavioralAnalysis: analysis?.behavioral_analysis || null,
                  threatIntelligence: analysis?.threat_intelligence || null,
                  infrastructure:
                    analysis?.infrastructure || email.infrastructure || {},
                  indicators: [
                    ...(Array.isArray(analysis?.email?.ips)
                      ? analysis.email.ips
                      : []),
                    ...(Array.isArray(analysis?.email?.domains)
                      ? analysis.email.domains
                      : []),
                    ...(Array.isArray(analysis?.email?.urls)
                      ? analysis.email.urls
                      : []),
                  ],
                  findings: Array.isArray(analysis?.findings)
                    ? analysis.findings
                    : [
                        ...(analysis?.identity_analysis?.findings || []),
                        ...(analysis?.behavioral_analysis?.findings || []),
                      ],
                };

                dispatch({
                  type: "backend/sync",
                  emails: [analyzedEmail],
                  indicators: buildLiveIndicators([analyzedEmail]),
                });
              } catch (error) {
                console.error(
                  `[DataProvider] Background analysis failed for Gmail message ${email.gmailMessageId}:`,
                  error,
                );
              }
            }),
          );
        }

        console.log(
          "[DataProvider] Background Gmail forensic analysis complete.",
        );
      };

      if (typeof window !== "undefined") {
        window.setTimeout(analyzeInBackground, 0);
      } else {
        analyzeInBackground();
      }

      return emails;
    } catch (error) {
      console.error("[DataProvider] Gmail backend load failed:", error);

      setBackendConnected(false);
      setBackendError(error);
      setBackendLoading(false);

      return [];
    }
  }, []);

  useEffect(() => {
    loadGmailMessages();
  }, [loadGmailMessages]);

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

      try {
        const indicator = state.indicators.find((item) => item.value === value);

        if (!indicator) {
          throw new Error(`Indicator ${value} is not registered.`);
        }

        const normalizedType = String(indicator.type || "")
          .trim()
          .toLowerCase();

        const payload = {
          ips: [],
          domains: [],
          urls: [],
        };

        if (
          normalizedType === "ip" ||
          normalizedType === "ipv4" ||
          normalizedType === "ipv6"
        ) {
          payload.ips = [value];
        } else if (normalizedType === "domain") {
          payload.domains = [value];
        } else if (normalizedType === "url") {
          payload.urls = [value];
        } else {
          throw new Error(
            `Threat-intelligence enrichment does not support ${indicator.type || "this indicator type"}.`,
          );
        }

        const response = await apiFetch("/threat-intelligence/enrich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = response?.data || {};

        const results = [
          ...(Array.isArray(data.ips) ? data.ips : []),
          ...(Array.isArray(data.domains) ? data.domains : []),
          ...(Array.isArray(data.urls) ? data.urls : []),
        ];

        const enriched = results.find(
          (entry) =>
            String(entry?.indicator || "").toLowerCase() ===
            String(value).toLowerCase(),
        );

        if (!enriched) {
          throw new Error(`No enrichment result was returned for ${value}.`);
        }

        const reputation = String(
          enriched.reputation || "unknown",
        ).toLowerCase();

        const threatScore = Number(enriched.threat_score || 0);
        const sightings = Number(indicator.sightings || 0);
        const cases = Array.isArray(indicator.cases)
          ? indicator.cases.length
          : 0;

        dispatch({
          type: "indicator/setEnrichment",
          value,
          enrichment: toEnrichment(data, enriched, normalizedType),
        });

        let verdict = "unknown";

        if (
          reputation === "malicious" &&
          (threatScore >= 80 || cases > 0 || sightings > 0)
        ) {
          verdict = "malicious";
        } else if (
          reputation === "malicious" ||
          reputation === "suspicious" ||
          enriched.suspicious === true ||
          threatScore >= 60 ||
          cases > 0 ||
          sightings > 0
        ) {
          verdict = "suspicious";
        }

        dispatch({
          type: "indicator/setVerdict",
          value,
          verdict,
        });

        push({
          title: "Enrichment complete",
          description:
            verdict === "unknown"
              ? `${value} remains unknown — no corroborating threat evidence.`
              : `${value} assessed as ${verdict} from live threat intelligence.`,
          tone:
            verdict === "malicious"
              ? "critical"
              : verdict === "suspicious"
                ? "warn"
                : "info",
        });

        return enriched;
      } catch (error) {
        console.error(
          `[DataProvider] Threat-intelligence enrichment failed for ${value}:`,
          error,
        );

        push({
          title: "Enrichment failed",
          description: error?.message || `Unable to enrich ${value}.`,
          tone: "critical",
        });

        return null;
      } finally {
        dispatch({
          type: "indicator/setEnriching",
          value,
          enriching: false,
        });
      }
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
    } catch {}

    push({
      title: "Console reset",
      description: "All local changes discarded; seed data restored.",
      tone: "warn",
    });
  }, [push]);

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
