import { emails as seedEmails } from "@/lib/data/emails";
import {
  investigations as seedInvestigations,
  indicatorRegistry as seedIndicators,
  reports as seedReports,
  settingsGroups,
} from "@/lib/data/dashboard";

/**
 * Console state and its transitions.
 *
 * Kept as a plain reducer, separate from the React provider, for two reasons:
 * every transition is unit-testable without rendering anything, and the rules
 * about what a mutation is allowed to do live in one readable place.
 *
 * There is no backend, so this is the system of record — persisted to
 * localStorage by the provider. Destructive actions are soft: an email is
 * flagged `deleted`, never dropped, which is what makes undo reliable rather
 * than a re-insert that loses field values.
 */

export const STORAGE_KEY = "threatdetect:console:v1";

/** Flat map of settings toggles, keyed `Group:Option`. */
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

/** Fields the console owns, layered over the immutable evidence record. */
function normalizeEmail(email) {
  return {
    ...email,
    starred: Boolean(email.starred),
    unread: Boolean(email.unread),
    archived: false,
    deleted: false,
  };
}

export function initialState() {
  return {
    emails: seedEmails.map(normalizeEmail),
    investigations: seedInvestigations.map((item) => ({ ...item })),
    indicators: seedIndicators.map((item) => ({ ...item, enriching: false })),
    reports: seedReports.map((item) => ({ ...item })),
    settings: seedSettings(),
    // Bumped on every mutation, so a persistence effect can skip the initial
    // render and avoid writing the seed straight back over stored state.
    revision: 0,
  };
}

/** Next id in a prefixed sequence, e.g. IR-2026-019. */
export function nextId(items, prefix, year = new Date().getFullYear()) {
  const highest = items.reduce((max, item) => {
    // Investigations are keyed by `case_id` to match the API contract;
    // reports still use `id`.
    const match = String(item.case_id ?? item.id).match(/(\d+)$/);

    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${year}-${String(highest + 1).padStart(3, "0")}`;
}

const map = (items, id, change) =>
  items.map((item) => (item.id === id ? { ...item, ...change } : item));

/** Investigations are addressed by `case_id`, so they need their own updater. */
const mapCase = (items, caseId, change) =>
  items.map((item) =>
    item.case_id === caseId ? { ...item, ...change } : item,
  );

const mapMany = (items, ids, change) =>
  items.map((item) => (ids.includes(item.id) ? { ...item, ...change } : item));

export function reducer(state, action) {
  const bump = (patch) => ({ ...state, ...patch, revision: state.revision + 1 });

  switch (action.type) {
    /* ---------------- Emails ---------------- */

    case "email/toggleStar":
      return bump({
        emails: state.emails.map((email) =>
          email.id === action.id ? { ...email, starred: !email.starred } : email,
        ),
      });

    case "email/setRead":
      return bump({
        emails: map(state.emails, action.id, { unread: !action.read }),
      });

    case "email/setArchived":
      return bump({
        emails: mapMany(state.emails, action.ids, { archived: action.archived }),
      });

    case "email/setDeleted":
      return bump({
        emails: mapMany(state.emails, action.ids, { deleted: action.deleted }),
      });

    case "email/setRoutine":
      // Bulk "mark as read" / "mark as unread".
      return bump({
        emails: mapMany(state.emails, action.ids, { unread: !action.read }),
      });

    case "email/assignCase":
      return bump({
        emails: mapMany(state.emails, action.ids, { caseId: action.caseId }),
        investigations: action.caseId
          ? state.investigations.map((item) =>
              item.case_id === action.caseId
                ? {
                    ...item,
                    // Recount rather than increment, so repeated assignment of
                    // the same message cannot inflate the total.
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

    /* ---------------- Investigations ---------------- */

    case "case/create": {
      const caseId = nextId(state.investigations, "IR");

      return bump({
        investigations: [
          {
            // Field names follow the InvestigationCreate schema.
            case_id: caseId,
            title: action.title,
            description: action.description,
            analyst: action.analyst,
            priority: action.priority,
            risk: action.risk,
            status: "active",
            notes: "",
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
        investigations: mapCase(state.investigations, action.id, {
          ...action.change,
          updated: "just now",
        }),
      });

    case "case/setStatus":
      return bump({
        investigations: mapCase(state.investigations, action.id, {
          status: action.status,
          updated: "just now",
        }),
      });

    case "case/delete":
      return bump({
        investigations: state.investigations.filter(
          (item) => item.case_id !== action.id,
        ),
        // Detach any message that pointed at the removed case, so no row is
        // left referencing a case that no longer exists.
        emails: state.emails.map((email) =>
          email.caseId === action.id ? { ...email, caseId: null } : email,
        ),
      });

    case "case/restore":
      return bump({
        investigations: [action.item, ...state.investigations].sort((a, b) =>
          a.case_id < b.case_id ? 1 : -1,
        ),
      });

    /* ---------------- Indicators ---------------- */

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
          },
          ...state.indicators,
        ],
      });

    case "indicator/setVerdict":
      return bump({
        indicators: state.indicators.map((item) =>
          item.value === action.value
            ? { ...item, verdict: action.verdict, enriching: false }
            : item,
        ),
      });

    case "indicator/setEnriching":
      return bump({
        indicators: state.indicators.map((item) =>
          item.value === action.value
            ? { ...item, enriching: action.enriching }
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

    /* ---------------- Reports ---------------- */

    case "report/create": {
      const id = nextId(state.reports, "RPT");

      return bump({
        reports: [
          {
            id,
            title: action.title,
            case_id: action.caseId ?? null,
            generated: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
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
        reports: map(state.reports, action.id, { state: "Final" }),
      });

    case "report/delete":
      return bump({
        reports: state.reports.filter((item) => item.id !== action.id),
      });

    case "report/restore":
      return bump({ reports: [action.item, ...state.reports] });

    /* ---------------- Settings ---------------- */

    case "settings/set":
      return bump({
        settings: { ...state.settings, [action.key]: action.value },
      });

    case "settings/replace":
      return bump({ settings: { ...action.settings } });

    case "settings/reset":
      return bump({ settings: seedSettings() });

    /* ---------------- Whole-state ---------------- */

    case "state/hydrate":
      // Merge rather than replace: a stored snapshot from an older build may
      // be missing keys a newer one expects.
      return { ...initialState(), ...action.state, revision: 0 };

    case "state/reset":
      return { ...initialState(), revision: state.revision + 1 };

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

/* ---------------- Derived selectors ---------------- */

/** Messages an analyst should see: not archived, not deleted. */
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
  return state.investigations.filter((item) => item.status !== "closed");
}

/** Only the fields worth persisting — derived values are recomputed on load. */
export function serialize(state) {
  return {
    emails: state.emails.map((email) => ({
      id: email.id,
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

/**
 * Rebuild full state from a persisted snapshot.
 *
 * Email evidence (headers, findings, infrastructure) always comes from the
 * seed — only the console-owned flags are restored. That way a stored
 * snapshot can never resurrect stale forensic data after the corpus changes.
 */
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
          }
        : email;
    }),
    investigations: Array.isArray(stored.investigations)
      ? stored.investigations
      : base.investigations,
    indicators: Array.isArray(stored.indicators)
      ? stored.indicators.map((item) => ({ ...item, enriching: false }))
      : base.indicators,
    reports: Array.isArray(stored.reports) ? stored.reports : base.reports,
    settings: { ...base.settings, ...(stored.settings ?? {}) },
    revision: 0,
  };
}
