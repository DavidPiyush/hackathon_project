"use client";

import { useState } from "react";

import { settingsGroups } from "@/lib/data/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Interactive";

/**
 * Settings groups with working switches.
 *
 * State is local and resets on reload — there is no persistence layer in this
 * build, and the banner says so rather than implying the choices are saved.
 */
export function SettingsPanels() {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      settingsGroups.flatMap((group) =>
        group.options.map((option) => [
          `${group.title}:${option.name}`,
          option.enabled,
        ]),
      ),
    ),
  );

  const [dirty, setDirty] = useState(false);

  const set = (key) => (next) => {
    setValues((previous) => ({ ...previous, [key]: next }));
    setDirty(true);
  };

  const reset = () => {
    setValues(
      Object.fromEntries(
        settingsGroups.flatMap((group) =>
          group.options.map((option) => [
            `${group.title}:${option.name}`,
            option.enabled,
          ]),
        ),
      ),
    );

    setDirty(false);
  };

  const enabledCount = Object.values(values).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Persistence notice — honest about what this build does. */}
      <Card tone="info" className="p-4">
        <p className="flex items-start gap-3 text-xs leading-6 text-ink-soft">
          <Icon name="info" className="mt-0.5 shrink-0 text-info" />
          <span>
            This build has no persistence layer, so changes here apply to the
            current session only and reset on reload.
          </span>
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card key={group.title} className="p-6">
            <CardHeader
              icon={group.icon}
              title={group.title}
              subtitle={group.description}
              level={2}
              actions={
                <Badge tone="neutral" size="xs">
                  {group.options.filter(
                    (option) => values[`${group.title}:${option.name}`],
                  ).length}
                  /{group.options.length}
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
                    checked={values[key]}
                    onChange={set(key)}
                  />
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Action bar */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-muted">
          <strong className="font-mono font-semibold text-ink">
            {enabledCount}
          </strong>{" "}
          of{" "}
          <strong className="font-mono font-semibold text-ink">
            {Object.keys(values).length}
          </strong>{" "}
          options enabled
          {dirty && (
            <span className="ml-2 text-warn">· unsaved changes</span>
          )}
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            icon="refresh"
            onClick={reset}
            disabled={!dirty}
          >
            Revert
          </Button>

          <Button icon="check" disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPanels;
