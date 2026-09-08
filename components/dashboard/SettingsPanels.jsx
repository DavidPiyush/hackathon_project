"use client";

import { useState } from "react";

import { settingsGroups } from "@/lib/data/dashboard";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Interactive";
import {
  BackendStatus,
  BackendProbes,
  BackendDocsLink,
} from "@/components/dashboard/BackendStatus";
import { Spinner, ConfirmInline } from "@/components/ui/Feedback";

/**
 * Settings, backed by the console store.
 *
 * Edits are held locally until saved, so Revert is meaningful and a stray
 * toggle does not immediately change how the engine behaves. Saving commits to
 * the store, which persists to this browser — stated plainly in the banner
 * rather than implying a server round trip.
 */
export function SettingsPanels() {
  const { settings, actions } = useData();

  const [draft, setDraft] = useState(settings);
  const [committed, setCommitted] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  /**
   * Adopt committed settings whenever they change from outside this form — the
   * store hydrating from localStorage on mount, or a reset elsewhere.
   *
   * Adjusting state during render is React's documented pattern here, and it
   * avoids the extra render pass a syncing effect would cost.
   */
  if (committed !== settings) {
    setCommitted(settings);
    setDraft(settings);
  }

  const dirty = Object.keys(draft).some((key) => draft[key] !== settings[key]);

  const enabledCount = Object.values(draft).filter(Boolean).length;

  const save = async () => {
    setSaving(true);

    // Committing is synchronous, but the write is what a real deployment would
    // send to the server — the brief spinner keeps that mental model honest.
    await new Promise((resolve) => setTimeout(resolve, 350));

    actions.saveSettings(draft);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Backend connection first: it determines what everything else can do. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <BackendStatus />
        <BackendProbes />
      </div>

      <div className="flex justify-end">
        <BackendDocsLink />
      </div>

      <Card tone="info" className="p-4">
        <p className="flex items-start gap-3 text-xs leading-6 text-ink-soft">
          <Icon name="info" className="mt-0.5 shrink-0 text-info" />
          <span>
            The toggles below are stored in this browser, not on the backend, so
            they will not follow you to another device — but they do survive a
            reload.
          </span>
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {settingsGroups.map((group) => {
          const groupKeys = group.options.map(
            (option) => `${group.title}:${option.name}`,
          );

          const activeInGroup = groupKeys.filter((key) => draft[key]).length;

          return (
            <Card key={group.title} className="p-6">
              <CardHeader
                icon={group.icon}
                title={group.title}
                subtitle={group.description}
                level={2}
                actions={
                  <Badge
                    tone={activeInGroup === 0 ? "neutral" : "accent"}
                    size="xs"
                  >
                    {activeInGroup}/{group.options.length}
                  </Badge>
                }
              />

              <div className="mt-6 space-y-5 border-t border-line pt-5">
                {group.options.map((option) => {
                  const key = `${group.title}:${option.name}`;

                  return (
                    <Toggle
                      key={key}
                      label={option.name}
                      description={option.detail}
                      checked={Boolean(draft[key])}
                      onChange={(next) =>
                        setDraft((previous) => ({ ...previous, [key]: next }))
                      }
                    />
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action bar */}
      <Card className="space-y-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            <strong className="font-mono font-semibold text-ink">
              {enabledCount}
            </strong>{" "}
            of{" "}
            <strong className="font-mono font-semibold text-ink">
              {Object.keys(draft).length}
            </strong>{" "}
            options enabled
            {dirty && (
              <span className="ml-2 font-medium text-warn">
                · unsaved changes
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              icon="undo"
              onClick={() => setDraft(settings)}
              disabled={!dirty || saving}
            >
              Revert
            </Button>

            <Button
              variant="secondary"
              icon="refresh"
              onClick={() => setConfirmingReset(true)}
              disabled={saving}
            >
              Restore defaults
            </Button>

            <Button icon={saving ? undefined : "save"} onClick={save} disabled={!dirty || saving}>
              {saving && <Spinner size="xs" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        {confirmingReset && (
          <ConfirmInline
            question="Restore every setting to its shipped default? Unsaved edits are discarded too."
            confirmLabel="Restore defaults"
            onCancel={() => setConfirmingReset(false)}
            onConfirm={() => {
              actions.resetSettings();
              setConfirmingReset(false);
            }}
          />
        )}
      </Card>

      {/* Console-wide reset, kept separate from ordinary settings */}
      <Card tone="critical" className="p-5">
        <CardHeader
          icon="warning"
          iconTone="critical"
          title="Reset the console"
          subtitle="Discards every local change and restores the seed data"
          level={2}
        />

        <p className="mt-4 text-xs leading-6 text-ink-soft">
          Clears archived and deleted messages, stars, case assignments, added
          indicators and generated reports from this browser. Nothing on a
          server is touched, because there is none.
        </p>

        <Button
          variant="danger"
          icon="refresh"
          onClick={actions.resetAll}
          className="mt-4"
        >
          Reset all console data
        </Button>
      </Card>
    </div>
  );
}

export default SettingsPanels;
