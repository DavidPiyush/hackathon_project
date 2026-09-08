import { cn } from "@/lib/utils/cn";
import {
  tone as resolveTone,
  AUTH_TONES,
  VERDICT_TONES,
  EVIDENCE_TONES,
} from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader, KeyValue, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IndicatorRow } from "@/components/ui/Interactive";

/**
 * Evidence panels.
 *
 * Each one renders a single slice of an investigation and is used by both the
 * inbox detail dialog and the full analysis page, so the two views can never
 * describe the same message differently.
 */

/** SPF / DKIM / DMARC / alignment results. */
export function AuthenticationPanel({ authentication, className }) {
  const rows = [
    { key: "spf", label: "SPF", hint: "Is the sending IP authorised?" },
    { key: "dkim", label: "DKIM", hint: "Is the signature valid?" },
    { key: "dmarc", label: "DMARC", hint: "Is the domain policy satisfied?" },
    {
      key: "alignment",
      label: "Alignment",
      hint: "Does the visible sender match the authenticated one?",
    },
  ];

  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="lock"
        title="Authentication"
        subtitle="Trust signals attached to the message"
      />

      <ul className="mt-5 space-y-2.5">
        {rows.map((row) => {
          const result = authentication?.[row.key];

          if (!result) {
            return null;
          }

          const t = resolveTone(AUTH_TONES[result.result] ?? "neutral");

          return (
            <li
              key={row.key}
              className="rounded-lg border border-line bg-raise p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
                    {row.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-faint">
                    {row.hint}
                  </p>
                </div>

                <Badge tone={AUTH_TONES[result.result] ?? "neutral"} size="xs" uppercase>
                  {result.result}
                </Badge>
              </div>

              <p className={cn("mt-2.5 text-[11px] leading-5", t.text)}>
                {result.detail}
              </p>
            </li>
          );
        })}
      </ul>

      {/* The single most misunderstood point in email security. */}
      <p className="mt-5 flex items-start gap-2 rounded-lg border border-info/20 bg-info/[0.06] p-3 text-[11px] leading-5 text-ink-soft">
        <Icon name="info" className="mt-0.5 shrink-0 text-info" />
        <span>
          A pass proves the message came from infrastructure authorised for{" "}
          <em className="not-italic text-ink">that</em> domain — not that the
          domain itself is trustworthy.
        </span>
      </p>
    </Card>
  );
}

/** Origin address, network, ASN and registration context. */
export function InfrastructurePanel({ infrastructure, className }) {
  if (!infrastructure) {
    return null;
  }

  const fields = [
    { label: "Origin IP", value: infrastructure.originIp, mono: true },
    { label: "Reverse DNS", value: infrastructure.reverseDns, mono: true },
    { label: "ASN", value: infrastructure.asn, mono: true },
    { label: "Network", value: infrastructure.network },
    {
      label: "Location",
      value:
        infrastructure.city && infrastructure.city !== "—"
          ? `${infrastructure.city}, ${infrastructure.country}`
          : infrastructure.country,
    },
    { label: "Domain age", value: infrastructure.domainAge },
    { label: "Registrar", value: infrastructure.registrar },
  ];

  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="server"
        title="Infrastructure"
        subtitle="Network context for the observed origin"
      />

      <dl className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {fields.map((field) => (
          <KeyValue
            key={field.label}
            label={field.label}
            value={field.value}
            mono={field.mono}
          />
        ))}
      </dl>

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-ink-muted">
        <Icon name="pin" className="mt-0.5 shrink-0 text-ink-faint" />
        Location describes where the infrastructure is registered, not where any
        person is.
      </p>
    </Card>
  );
}

/** Extracted indicators of compromise. */
export function IndicatorPanel({ indicators = [], className }) {
  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="fingerprint"
        title="Extracted indicators"
        subtitle={`${indicators.length} indicator${indicators.length === 1 ? "" : "s"} available for correlation`}
      />

      {indicators.length === 0 ? (
        <EmptyState
          icon="fingerprint"
          title="No indicators extracted"
          description="This message contained no addresses, domains, URLs or attachments worth registering."
          className="py-10"
        />
      ) : (
        <ul className="mt-5 space-y-2">
          {indicators.map((indicator) => (
            <li key={indicator.value}>
              <IndicatorRow
                indicator={indicator}
                verdictTone={VERDICT_TONES[indicator.verdict] ?? "neutral"}
              />

              {indicator.note && (
                <p className="mt-1 pl-[4.75rem] text-[10px] text-ink-faint">
                  {indicator.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/**
 * Analytical findings, each tagged with how it was established. This is the
 * evidence model from the landing page, applied to a real message.
 */
export function FindingsPanel({ findings = [], className }) {
  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="scale"
        title="Findings"
        subtitle="Every conclusion labelled by how it was established"
      />

      <ul className="mt-5 space-y-2.5">
        {findings.map((finding) => {
          const t = resolveTone(EVIDENCE_TONES[finding.evidence] ?? "neutral");

          return (
            <li
              key={finding.text}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-raise p-3",
                t.border,
              )}
            >
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider",
                  t.bg,
                  t.text,
                )}
              >
                {finding.evidence}
              </span>

              <p className="min-w-0 flex-1 text-xs leading-5 text-ink-soft">
                {finding.text}
              </p>

              {finding.confidence && (
                <Badge tone="info" size="xs" uppercase className="shrink-0">
                  {finding.confidence}
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** Attachments with their static-analysis verdict. */
export function AttachmentPanel({ attachments = [], className }) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="paperclip"
        title="Attachments"
        subtitle="Held for static analysis — never opened automatically"
      />

      <ul className="mt-5 space-y-2">
        {attachments.map((file) => {
          const verdictTone = VERDICT_TONES[file.verdict] ?? "neutral";
          const t = resolveTone(verdictTone);

          return (
            <li
              key={file.name}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-raise p-3",
                t.border,
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  t.bg,
                  t.text,
                )}
              >
                <Icon name="shield-file" className="text-xs" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="ioc truncate font-medium text-ink">{file.name}</p>
                <p className="mt-0.5 text-[10px] text-ink-faint">
                  {file.type} · {file.size}
                </p>
              </div>

              <Badge tone={verdictTone} size="xs" uppercase>
                {file.verdict}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** The rendered message body, presented as quoted evidence. */
/** The rendered message body, presented as quoted evidence. */
export function MessagePanel({ email, className }) {
  const body =
    typeof email?.body === "string"
      ? email.body
      : email?.body?.text ||
        email?.body?.paragraphs?.join("\n\n") ||
        "";

  const paragraphs = body
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Card className={cn("p-5", className)}>
      <CardHeader
        icon="envelope"
        title="Message content"
        subtitle="Rendered as plain text — remote content and scripts are stripped"
      />

      <div className="mt-5 rounded-lg border border-line bg-canvas p-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 40)}`}
              className={cn(
                "text-sm leading-7 text-ink-soft",
                index > 0 && "mt-3",
              )}
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-sm text-ink-muted">
            No message body available.
          </p>
        )}
      </div>
    </Card>
  );
}