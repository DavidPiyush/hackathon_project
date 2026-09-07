"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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

/**
 * Console data store.
 *
 * There is no backend, so this is the system of record: a reducer over the
 * seed data, persisted to localStorage so an analyst's work survives a reload.
 * Every mutation reports through a toast, and destructive ones offer undo,
 * which is why the reducer soft-deletes rather than dropping rows.
 *
 * Pages stay server components; only the interactive islands inside them
 * consume this, and they sit below the provider in the React tree.
 */
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const { push } = useToast();
  const hydrated = useRef(false);

  /** Restore a stored snapshot once, on mount. */
  useEffect(() => {
    let stored = null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      // Corrupt or blocked storage — carry on with the seed rather than
      // leaving the console empty.
      stored = null;
    }

    if (stored) {
      dispatch({ type: "state/hydrate", state: deserialize(stored) });
    }

    hydrated.current = true;
  }, []);

  /** Persist after every mutation, but never write the seed over stored state. */
  useEffect(() => {
    if (!hydrated.current || state.revision === 0) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(state)));
    } catch {
      // Quota exceeded or storage blocked. The session still works; the work
      // simply will not survive a reload.
    }
  }, [state]);

  /* ---------------- Email actions ---------------- */

  const emailById = useCallback(
    (id) => state.emails.find((email) => email.id === id),
    [state.emails],
  );

  const toggleStar = useCallback(
    (id) => {
      const email = emailById(id);

      dispatch({ type: "email/toggleStar", id });

      push({
        title: email?.starred ? "Star removed" : "Message starred",
        description: email?.subject,
        tone: "info",
        duration: 2500,
      });
    },
    [emailById, push],
  );

  const setRead = useCallback(
    (id, read) => {
      dispatch({ type: "email/setRead", id, read });
    },
    [],
  );

  const archiveEmails = useCallback(
    (ids) => {
      dispatch({ type: "email/setArchived", ids, archived: true });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} archived`,
        description: "Removed from the triage queue. Evidence is retained.",
        tone: "safe",
        action: {
          label: "Undo",
          onClick: () =>
            dispatch({ type: "email/setArchived", ids, archived: false }),
        },
      });
    },
    [push],
  );

  const unarchiveEmails = useCallback(
    (ids) => {
      dispatch({ type: "email/setArchived", ids, archived: false });

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
      dispatch({ type: "email/setDeleted", ids, deleted: true });

      push({
        title: `${ids.length} message${ids.length === 1 ? "" : "s"} deleted`,
        description:
          "Soft-deleted — the original evidence record is never destroyed.",
        tone: "critical",
        action: {
          label: "Undo",
          onClick: () =>
            dispatch({ type: "email/setDeleted", ids, deleted: false }),
        },
      });
    },
    [push],
  );

  const restoreEmails = useCallback(
    (ids) => {
      dispatch({ type: "email/setDeleted", ids, deleted: false });

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
      dispatch({ type: "email/setRoutine", ids, read });

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

      dispatch({ type: "email/assignCase", ids, caseId });

      push({
        title: caseId ? `Added to ${caseId}` : "Removed from case",
        description: `${ids.length} message${ids.length === 1 ? "" : "s"} updated.`,
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

  /* ---------------- Investigation actions ---------------- */

  const createCase = useCallback(
    (draft) => {
      dispatch({ type: "case/create", ...draft });

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
      dispatch({ type: "case/update", id, change });

      push({ title: `${id} updated`, tone: "safe", duration: 3000 });
    },
    [push],
  );

  const setCaseState = useCallback(
    (id, nextState) => {
      const previous = state.investigations.find((item) => item.id === id);

      dispatch({ type: "case/setState", id, state: nextState });

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

      dispatch({ type: "case/delete", id });

      push({
        title: `${id} deleted`,
        description: "Linked messages were detached from the case.",
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () => dispatch({ type: "case/restore", item }),
            }
          : undefined,
      });
    },
    [state.investigations, push],
  );

  /* ---------------- Indicator actions ---------------- */

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

      dispatch({ type: "indicator/create", ...draft });

      push({
        title: "Indicator registered",
        description: `${draft.value} added as unknown, pending enrichment.`,
        tone: "safe",
      });

      return true;
    },
    [state.indicators, push],
  );

  /**
   * Enrichment is the one operation with a deliberate delay.
   *
   * In a real deployment this is several network round trips (DNS, RDAP,
   * reputation), so showing progress is honest rather than theatrical — and it
   * is the only way the verdict could ever move off `unknown`.
   */
  const enrichIndicator = useCallback(
    async (value) => {
      dispatch({ type: "indicator/setEnriching", value, enriching: true });

      await new Promise((resolve) => setTimeout(resolve, 900));

      const indicator = state.indicators.find((item) => item.value === value);

      // Derive a verdict from what the registry already knows, rather than
      // inventing one at random.
      const verdict =
        indicator?.cases?.length > 1
          ? "malicious"
          : indicator?.cases?.length === 1
            ? "suspicious"
            : "unknown";

      dispatch({ type: "indicator/setVerdict", value, verdict });

      push({
        title: `Enrichment complete`,
        description:
          verdict === "unknown"
            ? `${value} remains unknown — no corroborating sighting.`
            : `${value} assessed as ${verdict}.`,
        tone: verdict === "malicious" ? "critical" : verdict === "suspicious" ? "warn" : "info",
      });
    },
    [state.indicators, push],
  );

  const setIndicatorVerdict = useCallback(
    (value, verdict) => {
      const previous = state.indicators.find((item) => item.value === value);

      dispatch({ type: "indicator/setVerdict", value, verdict });

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

      dispatch({ type: "indicator/delete", value });

      push({
        title: "Indicator removed",
        description: value,
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () => dispatch({ type: "indicator/restore", item }),
            }
          : undefined,
      });
    },
    [state.indicators, push],
  );

  /* ---------------- Report actions ---------------- */

  const createReport = useCallback(
    (draft) => {
      dispatch({ type: "report/create", ...draft });

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
      dispatch({ type: "report/finalize", id });

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

      dispatch({ type: "report/delete", id });

      push({
        title: `${id} deleted`,
        tone: "critical",
        action: item
          ? {
              label: "Undo",
              onClick: () => dispatch({ type: "report/restore", item }),
            }
          : undefined,
      });
    },
    [state.reports, push],
  );

  /* ---------------- Settings actions ---------------- */

  const setSetting = useCallback((key, value) => {
    dispatch({ type: "settings/set", key, value });
  }, []);

  const saveSettings = useCallback(
    (settings) => {
      dispatch({ type: "settings/replace", settings });

      push({
        title: "Settings saved",
        description: "Stored in this browser. There is no server to sync to.",
        tone: "safe",
      });
    },
    [push],
  );

  const resetSettings = useCallback(() => {
    dispatch({ type: "settings/reset" });

    push({ title: "Settings restored to defaults", tone: "info" });
  }, [push]);

  const resetAll = useCallback(() => {
    dispatch({ type: "state/reset" });

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

  const value = useMemo(
    () => ({
      ...state,
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
