"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { useData } from "@/components/providers/DataProvider";
import { Icon } from "@/components/ui/Icon";
import { Card, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function getDomain(email) {
  const value = String(email?.senderEmail || "")
    .trim()
    .toLowerCase();
  const at = value.lastIndexOf("@");
  return at >= 0 ? value.slice(at + 1) : "";
}

function getEmailIocs(email) {
  const values = [
    ...(Array.isArray(email?.indicators) ? email.indicators : []),
    ...(Array.isArray(email?.analysis?.email?.ips)
      ? email.analysis.email.ips
      : []),
    ...(Array.isArray(email?.analysis?.email?.domains)
      ? email.analysis.email.domains
      : []),
    ...(Array.isArray(email?.analysis?.email?.urls)
      ? email.analysis.email.urls
      : []),
  ];

  return [
    ...new Set(values.map((item) => String(item).trim()).filter(Boolean)),
  ];
}

function getTheme(email) {
  const findings = Array.isArray(email?.analysis?.findings)
    ? email.analysis.findings
    : [];

  const text = findings
    .map((item) =>
      `${item?.type || ""} ${item?.description || ""}`.toLowerCase(),
    )
    .join(" ");

  if (/payment|invoice|wire|bec|bank/.test(text)) {
    return "Business email compromise / payment diversion";
  }

  if (/credential|login|password|harvest|phish/.test(text)) {
    return "Credential harvesting / phishing";
  }

  if (/executive|impersonat/.test(text)) {
    return "Executive impersonation";
  }

  if (/urgent|urgency|social.engineer/.test(text)) {
    return "Social engineering / urgency";
  }

  return email?.classification && email.classification !== "unknown"
    ? String(email.classification)
    : "Infrastructure-linked email activity";
}

function deriveTone(emails) {
  const risks = emails.map((email) =>
    Number(email?.analysis?.risk?.score ?? email?.risk ?? 0),
  );

  const maxRisk = Math.max(0, ...risks);

  if (maxRisk >= 80) return "critical";
  if (maxRisk >= 60) return "warn";
  return "info";
}

function deriveConfidence(emailCount, sharedIocCount, maxRisk) {
  let score = 35;

  if (emailCount >= 2) score += 20;
  if (emailCount >= 4) score += 10;
  if (sharedIocCount >= 1) score += 15;
  if (sharedIocCount >= 3) score += 10;
  if (maxRisk >= 70) score += 10;

  return Math.min(score, 95);
}

export function DynamicCampaignClusters() {
  const { emails, backendLoading } = useData();

  const clusters = useMemo(() => {
    const analyzed = emails.filter((email) => email?.analysis);

    if (!analyzed.length) return [];

    const groups = new Map();

    for (const email of analyzed) {
      const domain = getDomain(email);
      const iocs = getEmailIocs(email);

      const key = domain
        ? `domain:${domain}`
        : iocs[0]
          ? `ioc:${iocs[0]}`
          : `email:${email.id}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(email);
    }

    return [...groups.entries()]
      .map(([key, members]) => {
        const iocSets = members.map((email) => new Set(getEmailIocs(email)));

        const counts = new Map();

        for (const set of iocSets) {
          for (const value of set) {
            counts.set(value, (counts.get(value) || 0) + 1);
          }
        }

        const sharedIocs = [...counts.entries()]
          .filter(([, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .map(([value]) => value);

        const risks = members.map((email) =>
          Number(email?.analysis?.risk?.score ?? email?.risk ?? 0),
        );

        const maxRisk = Math.max(0, ...risks);
        const theme = getTheme(members[0]);
        const domain = getDomain(members[0]);

        return {
          key,
          name: domain
            ? `${domain} activity cluster`
            : sharedIocs[0]
              ? `IOC-linked activity cluster`
              : `Email activity cluster`,
          theme,
          note: domain
            ? `${members.length} analyzed message${
                members.length === 1 ? "" : "s"
              } share the sender domain ${domain}.`
            : `${members.length} analyzed message${
                members.length === 1 ? "" : "s"
              } are linked by observed infrastructure indicators.`,
          cases: new Set(members.map((email) => email.caseId).filter(Boolean))
            .size,
          indicators: new Set(members.flatMap((email) => getEmailIocs(email)))
            .size,
          emails: members.length,
          firstSeen:
            members
              .map((email) => email.receivedAt || email.internalDate)
              .filter(Boolean)
              .sort()[0] || "—",
          confidence: deriveConfidence(
            members.length,
            sharedIocs.length,
            maxRisk,
          ),
          tone: deriveTone(members),
          sharedIocs,
        };
      })
      .sort((a, b) => {
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return b.emails - a.emails;
      })
      .slice(0, 8);
  }, [emails]);

  if (backendLoading && !emails.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Icon name="refresh" className="animate-spin text-accent" />
          Building clusters from analyzed email metadata…
        </div>
      </Card>
    );
  }

  if (!clusters.length) {
    return (
      <EmptyState
        icon="nodes"
        title="No campaign clusters yet"
        description={
          emails.length
            ? "Campaign clusters appear after Gmail messages complete forensic analysis."
            : "Load Gmail messages to build clusters from sender and infrastructure relationships."
        }
      />
    );
  }

  return (
    <ul className="space-y-4">
      {clusters.map((campaign) => {
        const t = resolveTone(campaign.tone);

        return (
          <li key={campaign.key}>
            <Card interactive className={cn("p-5", t.border)}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                        t.bg,
                        t.border,
                        t.text,
                      )}
                    >
                      <Icon name="nodes" className="text-xs" />
                    </span>

                    <h3 className="text-base font-semibold text-ink">
                      {campaign.name}
                    </h3>

                    <Badge tone={campaign.tone} size="xs" uppercase>
                      {campaign.confidence}% derived confidence
                    </Badge>
                  </div>

                  <p className="mt-3 text-xs text-ink-muted">
                    {campaign.theme}
                  </p>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                    {campaign.note}
                  </p>

                  {campaign.sharedIocs.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {campaign.sharedIocs.slice(0, 4).map((ioc) => (
                        <Badge key={ioc} tone="neutral" size="xs">
                          {ioc}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                <dl className="flex shrink-0 gap-2">
                  {[
                    { label: "Emails", value: campaign.emails },
                    { label: "IOCs", value: campaign.indicators },
                    { label: "Cases", value: campaign.cases },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-line bg-raise px-3 py-2 text-center"
                    >
                      <dt className="text-[9px] uppercase tracking-wider text-ink-faint">
                        {item.label}
                      </dt>
                      <dd className="mt-1 font-mono text-[11px] font-semibold text-ink">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

export default DynamicCampaignClusters;
