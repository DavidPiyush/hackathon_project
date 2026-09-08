"use client";

import { useState } from "react";

import { clampScore } from "@/lib/utils/risk";
import { PRIORITIES } from "@/lib/api/schema";
import { validateAgainstSchema } from "@/lib/api/schema";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";

const ANALYSTS = ["SOC Analyst", "DFIR Lead", "Threat Intel"];

const EMPTY = {
  title: "",
  description: "",
  analyst: "SOC Analyst",
  priority: "high",
  risk: "60",
  notes: "",
};

/**
 * Create / edit form for an investigation.
 *
 * Extracted from `InvestigationsClient` so the draft lives here. When it lived
 * in the parent, every keystroke re-rendered the whole case list and its stat
 * tiles — invisible with five cases, but the wrong shape, and it made the
 * integration tests slow enough to time out. The parent now re-renders only
 * when the store or the filters change.
 *
 * `key` is set by the caller to the case being edited, so switching cases
 * remounts this with a fresh draft rather than needing a syncing effect.
 */
export function CaseFormModal({ open, mode, initial, onClose, onSubmit }) {
  const [draft, setDraft] = useState(() =>
    initial ? { ...EMPTY, ...initial, risk: String(initial.risk ?? 60) } : EMPTY,
  );

  const [errors, setErrors] = useState({});

  const set = (field) => (event) =>
    setDraft((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      analyst: draft.analyst,
      priority: draft.priority,
    };

    // The API's own constraints first, so a title the backend would reject
    // never leaves the browser.
    const next = validateAgainstSchema(
      mode === "edit" ? "InvestigationUpdate" : "InvestigationCreate",
      payload,
    );

    // Then the product's stricter rules, which the spec does not encode.
    if (payload.title.length > 0 && payload.title.length < 6) {
      next.title = "Give the case a title of at least 6 characters.";
    }

    if (payload.description.length < 20) {
      next.description = "Summarise the case in at least 20 characters.";
    }

    const risk = Number(draft.risk);

    if (!Number.isFinite(risk) || risk < 0 || risk > 100) {
      next.risk = "Risk must be a number between 0 and 100.";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    onSubmit({ ...payload, risk: clampScore(draft.risk), notes: draft.notes });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      subtitle={mode === "edit" ? `Editing ${initial?.case_id}` : "New case"}
      title={mode === "edit" ? "Update investigation" : "Open an investigation"}
      size="md"
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field id="case-title" label="Title" error={errors.title} required>
          {(field) => (
            <Input
              {...field}
              value={draft.title}
              onChange={set("title")}
              placeholder="Invoice fraud targeting finance"
              error={errors.title}
            />
          )}
        </Field>

        <Field
          id="case-description"
          label="Description"
          error={errors.description}
          hint="What is happening, and why it warranted a case."
          required
        >
          {(field) => (
            <Textarea
              {...field}
              rows={4}
              value={draft.description}
              onChange={set("description")}
              placeholder="A newly registered domain is impersonating a supplier and requesting a change of banking details."
              error={errors.description}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="case-analyst" label="Analyst">
            {(field) => (
              <Select {...field} value={draft.analyst} onChange={set("analyst")}>
                {ANALYSTS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field id="case-priority" label="Priority">
            {(field) => (
              <Select
                {...field}
                value={draft.priority}
                onChange={set("priority")}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field id="case-risk" label="Risk score" error={errors.risk}>
            {(field) => (
              <Input
                {...field}
                type="number"
                min={0}
                max={100}
                value={draft.risk}
                onChange={set("risk")}
                error={errors.risk}
                className="font-mono"
              />
            )}
          </Field>
        </div>

        {/* `notes` only exists on InvestigationUpdate, so it is edit-only. */}
        {mode === "edit" && (
          <Field
            id="case-notes"
            label="Analyst notes"
            error={errors.notes}
            hint="Working notes. Included in the case record, not the report summary."
          >
            {(field) => (
              <Textarea
                {...field}
                rows={3}
                value={draft.notes}
                onChange={set("notes")}
                placeholder="Escalated to the supplier's security team."
                error={errors.notes}
              />
            )}
          </Field>
        )}

        <div className="flex items-center gap-3 border-t border-line pt-5">
          <Button type="submit" icon={mode === "edit" ? "save" : "plus"}>
            {mode === "edit" ? "Save changes" : "Open case"}
          </Button>

          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CaseFormModal;
