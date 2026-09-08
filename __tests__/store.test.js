import { describe, expect, it } from "vitest";

import {
  reducer,
  initialState,
  nextId,
  activeEmails,
  archivedEmails,
  deletedEmails,
  openInvestigations,
  serialize,
  deserialize,
} from "@/lib/store/reducer";

/**
 * Console state transitions.
 *
 * The reducer is the system of record for every mutation in the dashboard, so
 * it is tested directly — a broken transition fails here before it can reach
 * a component test.
 */

const run = (actions, from = initialState()) =>
  actions.reduce((state, action) => reducer(state, action), from);

describe("initialState", () => {
  it("layers console-owned flags over the evidence records", () => {
    const state = initialState();

    expect(state.emails.length).toBeGreaterThan(0);

    for (const email of state.emails) {
      expect(email.archived).toBe(false);
      expect(email.deleted).toBe(false);
      expect(typeof email.starred).toBe("boolean");
    }
  });

  it("starts at revision zero so the seed is never persisted over stored state", () => {
    expect(initialState().revision).toBe(0);
  });

  it("seeds settings from the published groups", () => {
    const state = initialState();

    expect(Object.keys(state.settings).length).toBeGreaterThan(0);
    expect(
      Object.values(state.settings).every((value) => typeof value === "boolean"),
    ).toBe(true);
  });
});

describe("nextId", () => {
  it("continues an existing sequence", () => {
    const items = [{ id: "IR-2026-018" }, { id: "IR-2026-012" }];

    expect(nextId(items, "IR", 2026)).toBe("IR-2026-019");
  });

  it("starts at 001 for an empty list", () => {
    expect(nextId([], "RPT", 2026)).toBe("RPT-2026-001");
  });

  it("ignores ids with no trailing number", () => {
    expect(nextId([{ id: "malformed" }], "IR", 2026)).toBe("IR-2026-001");
  });
});

describe("email transitions", () => {
  it("toggles a star", () => {
    const target = initialState().emails[0];

    const once = reducer(initialState(), {
      type: "email/toggleStar",
      id: target.id,
    });

    expect(once.emails[0].starred).toBe(!target.starred);

    const twice = reducer(once, { type: "email/toggleStar", id: target.id });

    expect(twice.emails[0].starred).toBe(target.starred);
  });

  it("archives without destroying the record", () => {
    const target = initialState().emails[0];

    const state = reducer(initialState(), {
      type: "email/setArchived",
      ids: [target.id],
      archived: true,
    });

    // Still present — just not in the active view.
    expect(state.emails).toHaveLength(initialState().emails.length);
    expect(archivedEmails(state).map((e) => e.id)).toContain(target.id);
    expect(activeEmails(state).map((e) => e.id)).not.toContain(target.id);
  });

  it("soft-deletes so undo is exact rather than a re-insert", () => {
    const target = initialState().emails[0];

    const deleted = reducer(initialState(), {
      type: "email/setDeleted",
      ids: [target.id],
      deleted: true,
    });

    expect(deletedEmails(deleted).map((e) => e.id)).toEqual([target.id]);

    const restored = reducer(deleted, {
      type: "email/setDeleted",
      ids: [target.id],
      deleted: false,
    });

    expect(restored.emails.find((e) => e.id === target.id)).toMatchObject({
      subject: target.subject,
      risk: target.risk,
      deleted: false,
    });
  });

  it("keeps a deleted message out of the archived view", () => {
    const target = initialState().emails[0];

    const state = run([
      { type: "email/setArchived", ids: [target.id], archived: true },
      { type: "email/setDeleted", ids: [target.id], deleted: true },
    ]);

    expect(archivedEmails(state)).toHaveLength(0);
    expect(deletedEmails(state)).toHaveLength(1);
  });

  it("marks messages read and unread in bulk", () => {
    const ids = initialState().emails.slice(0, 3).map((email) => email.id);

    const read = reducer(initialState(), {
      type: "email/setRoutine",
      ids,
      read: true,
    });

    expect(
      read.emails.filter((email) => ids.includes(email.id)).every((e) => !e.unread),
    ).toBe(true);

    const unread = reducer(read, {
      type: "email/setRoutine",
      ids,
      read: false,
    });

    expect(
      unread.emails.filter((e) => ids.includes(e.id)).every((e) => e.unread),
    ).toBe(true);
  });

  it("assigns a case and recounts rather than incrementing", () => {
    const base = initialState();
    const caseId = base.investigations[0].case_id;
    const ids = base.emails.slice(0, 2).map((email) => email.id);

    // Assigning the same messages twice must not inflate the count.
    const once = reducer(base, { type: "email/assignCase", ids, caseId });
    const twice = reducer(once, { type: "email/assignCase", ids, caseId });

    const linked = twice.emails.filter((email) => email.caseId === caseId);
    const record = twice.investigations.find((item) => item.case_id === caseId);

    expect(record.emails).toBe(linked.length);
  });

  it("detaches messages when their case is deleted", () => {
    const base = initialState();
    const caseId = base.investigations[0].case_id;

    const state = run(
      [
        {
          type: "email/assignCase",
          ids: base.emails.slice(0, 2).map((e) => e.id),
          caseId,
        },
        { type: "case/delete", id: caseId },
      ],
      base,
    );

    expect(
      state.emails.every((email) => email.caseId !== caseId),
    ).toBe(true);
  });
});

describe("investigation transitions", () => {
  it("creates a case with a sequential id and open state", () => {
    const state = reducer(initialState(), {
      type: "case/create",
      title: "New supplier impersonation",
      description: "A look-alike domain is requesting invoice payment.",
      analyst: "SOC Analyst",
      priority: "high",
      risk: 70,
    });

    const created = state.investigations[0];

    expect(created.case_id).toMatch(/^IR-\d{4}-\d{3}$/);
    expect(created.status).toBe("active");
    expect(created.emails).toBe(0);
    expect(openInvestigations(state)).toContainEqual(created);
  });

  it("updates a case and stamps it as touched", () => {
    const base = initialState();
    const id = base.investigations[0].case_id;

    const state = reducer(base, {
      type: "case/update",
      id,
      change: { title: "Renamed case", risk: 55 },
    });

    const updated = state.investigations.find((item) => item.case_id === id);

    expect(updated.title).toBe("Renamed case");
    expect(updated.risk).toBe(55);
    expect(updated.updated).toBe("just now");
  });

  it("moves a case between states", () => {
    const base = initialState();
    const id = base.investigations[0].case_id;

    const closed = reducer(base, {
      type: "case/setStatus",
      id,
      status: "closed",
    });

    expect(openInvestigations(closed).map((i) => i.case_id)).not.toContain(id);
  });

  it("deletes and restores a case", () => {
    const base = initialState();
    const target = base.investigations[0];

    const deleted = reducer(base, { type: "case/delete", id: target.case_id });

    expect(deleted.investigations.map((i) => i.case_id)).not.toContain(target.case_id);

    const restored = reducer(deleted, { type: "case/restore", item: target });

    expect(restored.investigations.map((i) => i.case_id)).toContain(target.case_id);
  });
});

describe("indicator transitions", () => {
  it("creates an indicator as unknown, never pre-judged", () => {
    const state = reducer(initialState(), {
      type: "indicator/create",
      value: "brand-new-domain.example",
      indicatorType: "Domain",
      caseId: null,
      context: "",
    });

    const created = state.indicators[0];

    expect(created.value).toBe("brand-new-domain.example");
    expect(created.verdict).toBe("unknown");
    expect(created.sightings).toBe(1);
    expect(created.context).toBeTruthy();
  });

  it("links a new indicator to a case when asked", () => {
    const state = reducer(initialState(), {
      type: "indicator/create",
      value: "linked.example",
      indicatorType: "Domain",
      caseId: "IR-2026-018",
    });

    expect(state.indicators[0].cases).toEqual(["IR-2026-018"]);
  });

  it("sets a verdict and clears the enriching flag", () => {
    const base = initialState();
    const value = base.indicators[0].value;

    const state = run(
      [
        { type: "indicator/setEnriching", value, enriching: true },
        { type: "indicator/setVerdict", value, verdict: "benign" },
      ],
      base,
    );

    const updated = state.indicators.find((item) => item.value === value);

    expect(updated.verdict).toBe("benign");
    expect(updated.enriching).toBe(false);
  });

  it("deletes and restores an indicator", () => {
    const base = initialState();
    const target = base.indicators[0];

    const deleted = reducer(base, {
      type: "indicator/delete",
      value: target.value,
    });

    expect(deleted.indicators.map((i) => i.value)).not.toContain(target.value);

    const restored = reducer(deleted, {
      type: "indicator/restore",
      item: target,
    });

    expect(restored.indicators.map((i) => i.value)).toContain(target.value);
  });
});

describe("report transitions", () => {
  it("creates a report as a draft", () => {
    const state = reducer(initialState(), {
      type: "report/create",
      title: "IR-2026-018 — Invoice fraud",
      caseId: "IR-2026-018",
      risk: 92,
    });

    const created = state.reports[0];

    expect(created.id).toMatch(/^RPT-\d{4}-\d{3}$/);
    expect(created.state).toBe("Draft");
  });

  it("finalises a draft", () => {
    const base = initialState();
    const draft = base.reports.find((report) => report.state === "Draft");

    const state = reducer(base, { type: "report/finalize", id: draft.id });

    expect(
      state.reports.find((report) => report.id === draft.id).state,
    ).toBe("Final");
  });

  it("deletes and restores a report", () => {
    const base = initialState();
    const target = base.reports[0];

    const deleted = reducer(base, { type: "report/delete", id: target.id });

    expect(deleted.reports.map((r) => r.id)).not.toContain(target.id);

    const restored = reducer(deleted, { type: "report/restore", item: target });

    expect(restored.reports.map((r) => r.id)).toContain(target.id);
  });
});

describe("settings transitions", () => {
  it("sets a single option", () => {
    const base = initialState();
    const key = Object.keys(base.settings)[0];

    const state = reducer(base, {
      type: "settings/set",
      key,
      value: !base.settings[key],
    });

    expect(state.settings[key]).toBe(!base.settings[key]);
  });

  it("resets to the shipped defaults", () => {
    const base = initialState();
    const key = Object.keys(base.settings)[0];

    const state = run(
      [
        { type: "settings/set", key, value: !base.settings[key] },
        { type: "settings/reset" },
      ],
      base,
    );

    expect(state.settings).toEqual(base.settings);
  });
});

describe("revision tracking", () => {
  it("bumps on every mutation", () => {
    const base = initialState();

    expect(base.revision).toBe(0);

    const once = reducer(base, {
      type: "email/toggleStar",
      id: base.emails[0].id,
    });

    expect(once.revision).toBe(1);
  });

  it("resets to zero on hydrate, so restoring does not trigger a write", () => {
    const state = reducer(initialState(), {
      type: "state/hydrate",
      state: initialState(),
    });

    expect(state.revision).toBe(0);
  });

  it("throws on an unknown action rather than silently ignoring it", () => {
    expect(() => reducer(initialState(), { type: "nope" })).toThrow(
      /Unknown action/,
    );
  });
});

describe("persistence round trip", () => {
  it("restores console flags but always re-reads evidence from the seed", () => {
    const base = initialState();
    const target = base.emails[0];

    const mutated = run(
      [
        { type: "email/setArchived", ids: [target.id], archived: true },
        { type: "email/toggleStar", id: target.id },
      ],
      base,
    );

    const restored = deserialize(JSON.parse(JSON.stringify(serialize(mutated))));
    const email = restored.emails.find((item) => item.id === target.id);

    // Flags survive…
    expect(email.archived).toBe(true);
    expect(email.starred).toBe(!target.starred);

    // …but forensic content comes from the seed, so a stale snapshot can never
    // resurrect old evidence.
    expect(email.authentication).toEqual(target.authentication);
    expect(email.findings).toEqual(target.findings);
  });

  it("does not persist transient flags", () => {
    const serialized = serialize(initialState());

    expect(
      serialized.indicators.every((item) => !("enriching" in item)),
    ).toBe(true);
  });

  it("falls back to the seed for missing or malformed snapshots", () => {
    expect(deserialize(null).emails).toHaveLength(initialState().emails.length);
    expect(deserialize("garbage").reports).toEqual(initialState().reports);
    expect(deserialize({}).settings).toEqual(initialState().settings);
  });

  it("tolerates a snapshot from an older build with missing keys", () => {
    const partial = { settings: { "Detection:Explainable scoring": false } };

    const restored = deserialize(partial);

    expect(restored.investigations).toEqual(initialState().investigations);
    expect(restored.settings["Detection:Explainable scoring"]).toBe(false);
  });

  it("ignores stored flags for messages that no longer exist", () => {
    const restored = deserialize({
      emails: [{ id: "EM-DOES-NOT-EXIST", archived: true }],
    });

    expect(restored.emails).toHaveLength(initialState().emails.length);
    expect(activeEmails(restored)).toHaveLength(initialState().emails.length);
  });
});
