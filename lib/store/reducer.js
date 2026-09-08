import { emails as seedEmails } from "@/lib/data/emails";
import {
  investigations as seedInvestigations,
  indicatorRegistry as seedIndicators,
  reports as seedReports,
  settingsGroups,
} from "@/lib/data/dashboard";

export const STORAGE_KEY = "threatdetect:console:v1";
function seedSettings() {
  return Object.fromEntries(
    settingsGroups.flatMap((group) =>
      group.options.map((option) => [
        `${group.title}:${option.name}`,
        option.enabled,
      ]),
    ),
  );
}
function normalizeEmail(email) {
  return {
    ...email,
    starred: Boolean(email.starred),
    unread: Boolean(email.unread),
    archived: Boolean(email.archived),
    deleted: Boolean(email.deleted),
  };
}

export function initialState() {
  return {
    emails: seedEmails.map(normalizeEmail),
    investigations: seedInvestigations.map((item) => ({ ...item })),
    indicators: seedIndicators.map((item) => ({
      ...item,
      enriching: false,
    })),
    reports: seedReports.map((item) => ({ ...item })),
    settings: seedSettings(),

    // Bumped on every mutation so persistence can skip
    // the initial render.
    revision: 0,
  };
}
export function nextId(items, prefix, year = new Date().getFullYear()) {
  const highest = items.reduce((max, item) => {
    const match = String(item.id).match(/(\d+)$/);

    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${year}-${String(highest + 1).padStart(3, "0")}`;
}

const map = (items, id, change) =>
  items.map((item) =>
    item.id === id
      ? {
          ...item,
          ...change,
        }
      : item,
  );

const mapMany = (items, ids, change) =>
  items.map((item) =>
    ids.includes(item.id)
      ? {
          ...item,
          ...change,
        }
      : item,
  );

export function reducer(state, action) {
  const bump = (patch) => ({
    ...state,
    ...patch,
    revision: state.revision + 1,
  });

  switch (action.type) {
    case "email/toggleStar":
      return bump({
        emails: state.emails.map((email) =>
          email.id === action.id
            ? {
                ...email,
                starred: !email.starred,
              }
            : email,
        ),
      });

    case "email/setRead":
      return bump({
        emails: map(state.emails, action.id, {
          unread: !action.read,
        }),
      });

    case "email/setArchived":
      return bump({
        emails: mapMany(state.emails, action.ids, {
          archived: action.archived,
        }),
      });

    case "email/setDeleted":
      return bump({
        emails: mapMany(state.emails, action.ids, {
          deleted: action.deleted,
        }),
      });

    case "email/setRoutine":
      // Bulk "mark as read" / "mark as unread".
      return bump({
        emails: mapMany(state.emails, action.ids, {
          unread: !action.read,
        }),
      });

    case "email/assignCase":
      return bump({
        emails: mapMany(state.emails, action.ids, {
          caseId: action.caseId,
        }),

        investigations: action.caseId
          ? state.investigations.map((item) =>
              item.id === action.caseId
                ? {
                    ...item,

                    // Recount rather than increment, so repeated
                    // assignment of the same message cannot inflate
                    // the total.
                    emails: state.emails.filter(
                      (email) =>
                        email.caseId === action.caseId ||
                        action.ids.includes(email.id),
                    ).length,

                    updated: "just now",
                  }
                : item,
            )
          : state.investigations,
      });
    case "backend/sync": {
      const incomingIndicators = Array.isArray(action.indicators)
        ? action.indicators
        : [];

      const byValue = new Map(
        state.indicators.map((item) => [
          String(item.value || "").toLowerCase(),
          item,
        ]),
      );

      for (const incoming of incomingIndicators) {
        const key = String(incoming.value || "").toLowerCase();
        if (!key) continue;

        const existing = byValue.get(key);

        if (!existing) {
          byValue.set(key, {
            ...incoming,
            enriching: false,
          });
          continue;
        }

        const rank = {
          unknown: 0,
          suspicious: 1,
          malicious: 2,
        };

        const existingRank = rank[existing.verdict] ?? 0;
        const incomingRank = rank[incoming.verdict] ?? 0;

        byValue.set(key, {
          ...existing,
          ...incoming,
          verdict:
            incomingRank > existingRank ? incoming.verdict : existing.verdict,
          sightings: Math.max(
            Number(existing.sightings || 0),
            Number(incoming.sightings || 0),
          ),
          cases: [
            ...new Set([...(existing.cases || []), ...(incoming.cases || [])]),
          ],
          enrichment: incoming.enrichment || existing.enrichment || null,
          enriching: false,
        });
      }

      const incomingEmails = Array.isArray(action.emails) ? action.emails : [];

      const emailByKey = new Map();

      for (const email of state.emails) {
        const key = email.gmailMessageId || email.id;
        if (key) emailByKey.set(String(key), email);
      }

      for (const incoming of incomingEmails) {
        if (!incoming?.id && !incoming?.gmailMessageId) continue;

        const key = String(incoming.gmailMessageId || incoming.id);
        const existing = emailByKey.get(key);

        emailByKey.set(
          key,
          existing
            ? {
                ...existing,
                ...incoming,
                starred: existing.starred,
                unread: existing.unread,
                archived: existing.archived,
                deleted: existing.deleted,
                caseId: existing.caseId ?? incoming.caseId ?? null,
              }
            : normalizeEmail(incoming),
        );
      }

      return bump({
        emails: [...emailByKey.values()],
        investigations: Array.isArray(action.investigations)
          ? action.investigations
          : state.investigations,
        indicators: [...byValue.values()],
        reports: Array.isArray(action.reports) ? action.reports : state.reports,
      });
    }
    case "email/fullLoaded": {
      const incoming = action.email;

      if (!incoming?.id) {
        return state;
      }

      return bump({
        emails: state.emails.map((email) => {
          const sameEmail =
            email.id === incoming.id ||
            (incoming.gmailMessageId &&
              email.gmailMessageId === incoming.gmailMessageId);

          if (!sameEmail) {
            return email;
          }

          return {
            ...email,
            ...incoming,
          };
        }),
      });
    }

    case "case/create": {
      const id = nextId(state.investigations, "IR");

      return bump({
        investigations: [
          {
            id,

            title: action.title,

            summary: action.summary,

            analyst: action.analyst,

            priority: action.priority,

            risk: action.risk,

            state: "Active",

            opened: new Date().toISOString().slice(0, 10),

            updated: "just now",

            emails: 0,

            indicators: 0,
          },

          ...state.investigations,
        ],
      });
    }

    case "case/update":
      return bump({
        investigations: map(state.investigations, action.id, {
          ...action.change,
          updated: "just now",
        }),
      });

    case "case/setState":
      return bump({
        investigations: map(state.investigations, action.id, {
          state: action.state,

          updated: "just now",
        }),
      });

    case "case/delete":
      return bump({
        investigations: state.investigations.filter(
          (item) => item.id !== action.id,
        ),

        // Detach any message that pointed at
        // the removed case.
        emails: state.emails.map((email) =>
          email.caseId === action.id
            ? {
                ...email,
                caseId: null,
              }
            : email,
        ),
      });

    case "case/restore":
      return bump({
        investigations: [action.item, ...state.investigations].sort((a, b) =>
          a.id < b.id ? 1 : -1,
        ),
      });

    case "indicator/create":
      return bump({
        indicators: [
          {
            value: action.value,

            type: action.indicatorType,

            verdict: "unknown",

            firstSeen: new Date().toISOString().slice(0, 10),

            sightings: 1,

            cases: action.caseId ? [action.caseId] : [],

            context: action.context || "Added manually by an analyst.",

            enriching: false,

            enrichment: null,
          },

          ...state.indicators,
        ],
      });

    case "indicator/setVerdict":
      return bump({
        indicators: state.indicators.map((item) =>
          item.value === action.value
            ? {
                ...item,

                verdict: action.verdict,

                enriching: false,
              }
            : item,
        ),
      });

    case "indicator/setEnrichment":
      return bump({
        indicators: state.indicators.map((item) =>
          item.value === action.value
            ? {
                ...item,
                enrichment: action.enrichment ?? null,
              }
            : item,
        ),
      });

    case "indicator/setEnriching":
      return bump({
        indicators: state.indicators.map((item) =>
          item.value === action.value
            ? {
                ...item,

                enriching: action.enriching,
              }
            : item,
        ),
      });

    case "indicator/delete":
      return bump({
        indicators: state.indicators.filter(
          (item) => item.value !== action.value,
        ),
      });

    case "indicator/restore":
      return bump({
        indicators: [action.item, ...state.indicators],
      });

    case "report/create": {
      const id = nextId(state.reports, "RPT");

      return bump({
        reports: [
          {
            id,

            title: action.title,

            caseId: action.caseId ?? null,

            generated:
              new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",

            author: action.author ?? "Analyst",

            format: action.format ?? "PDF",

            pages: action.pages ?? 12,

            state: "Draft",

            risk: action.risk ?? 0,
          },

          ...state.reports,
        ],
      });
    }

    case "report/finalize":
      return bump({
        reports: map(state.reports, action.id, {
          state: "Final",
        }),
      });

    case "report/delete":
      return bump({
        reports: state.reports.filter((item) => item.id !== action.id),
      });

    case "report/restore":
      return bump({
        reports: [action.item, ...state.reports],
      });

    case "settings/set":
      return bump({
        settings: {
          ...state.settings,

          [action.key]: action.value,
        },
      });

    case "settings/replace":
      return bump({
        settings: {
          ...action.settings,
        },
      });

    case "settings/reset":
      return bump({
        settings: seedSettings(),
      });

    case "state/hydrate":
      // Merge rather than replace: a stored snapshot from
      // an older build may be missing keys a newer one expects.
      return {
        ...initialState(),
        ...action.state,
        revision: 0,
      };

    case "state/reset":
      return {
        ...initialState(),
        revision: state.revision + 1,
      };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

/* ============================================================
 * Derived selectors
 * ============================================================ */
export function activeEmails(state) {
  return state.emails.filter((email) => !email.archived && !email.deleted);
}

export function archivedEmails(state) {
  return state.emails.filter((email) => email.archived && !email.deleted);
}

export function deletedEmails(state) {
  return state.emails.filter((email) => email.deleted);
}

export function openInvestigations(state) {
  return state.investigations.filter((item) => item.state !== "Closed");
}
export function serialize(state) {
  return {
    emails: state.emails.map((email) => ({
      id: email.id,

      gmailMessageId: email.gmailMessageId ?? null,

      starred: email.starred,

      unread: email.unread,

      archived: email.archived,

      deleted: email.deleted,

      caseId: email.caseId,
    })),

    investigations: state.investigations,

    indicators: state.indicators.map(({ enriching, ...rest }) => rest),

    reports: state.reports,

    settings: state.settings,
  };
}
export function deserialize(stored) {
  const base = initialState();

  if (!stored || typeof stored !== "object") {
    return base;
  }

  const flagsById = new Map(
    Array.isArray(stored.emails)
      ? stored.emails.map((email) => [email.id, email])
      : [],
  );

  return {
    emails: base.emails.map((email) => {
      const flags = flagsById.get(email.id);

      return flags
        ? {
            ...email,

            starred: Boolean(flags.starred),

            unread: Boolean(flags.unread),

            archived: Boolean(flags.archived),

            deleted: Boolean(flags.deleted),

            caseId: flags.caseId ?? null,

            gmailMessageId:
              flags.gmailMessageId ?? email.gmailMessageId ?? null,
          }
        : email;
    }),

    investigations: Array.isArray(stored.investigations)
      ? stored.investigations
      : base.investigations,

    indicators: Array.isArray(stored.indicators)
      ? stored.indicators.map((item) => ({
          ...item,
          enriching: false,
        }))
      : base.indicators,

    reports: Array.isArray(stored.reports) ? stored.reports : base.reports,

    settings: {
      ...base.settings,
      ...(stored.settings ?? {}),
    },

    revision: 0,
  };
}
