/** Data behind the dashboard pages. Pure data — no UI imports. */

/** Seven-day detection trend, rendered as an inline SVG area chart. */
export const threatTrend = [
  { day: "Mon", total: 148, high: 12 },
  { day: "Tue", total: 176, high: 19 },
  { day: "Wed", total: 132, high: 8 },
  { day: "Thu", total: 214, high: 27 },
  { day: "Fri", total: 268, high: 34 },
  { day: "Sat", total: 96, high: 6 },
  { day: "Sun", total: 84, high: 4 },
];

/** Detected threat categories, rendered as a horizontal distribution. */
export const threatDistribution = [
  { label: "Credential Phishing", value: 42, tone: "critical" },
  { label: "Business Email Compromise", value: 23, tone: "high" },
  { label: "Brand Impersonation", value: 18, tone: "warn" },
  { label: "Malware Delivery", value: 11, tone: "info" },
  { label: "Spam / Bulk", value: 6, tone: "safe" },
];

/** Platform service health, shown in the overview right rail. */
export const serviceStatus = [
  { name: "Detection Engine", detail: "Classifier and rule pack", state: "operational", latency: "38 ms" },
  { name: "URL Intelligence", detail: "Link reputation lookups", state: "operational", latency: "112 ms" },
  { name: "Attachment Scanner", detail: "Static malware analysis", state: "degraded", latency: "1.4 s" },
  { name: "Threat Intelligence", detail: "Indicator correlation", state: "operational", latency: "64 ms" },
  { name: "GeoIP Resolver", detail: "Network and location context", state: "operational", latency: "27 ms" },
];

/** Open investigations. */
export const investigations = [
  {
    id: "IR-2026-018",
    title: "Invoice fraud targeting finance",
    analyst: "DFIR Lead",
    opened: "2026-09-07",
    updated: "2 hours ago",
    state: "Active",
    priority: "critical",
    risk: 92,
    emails: 4,
    indicators: 11,
    summary:
      "A newly registered domain is impersonating a supplier and requesting a change of banking details across the finance team.",
  },
  {
    id: "IR-2026-017",
    title: "Microsoft brand impersonation wave",
    analyst: "Threat Intel",
    opened: "2026-09-06",
    updated: "5 hours ago",
    state: "Active",
    priority: "high",
    risk: 81,
    emails: 9,
    indicators: 7,
    summary:
      "Homoglyph domains passing their own SPF and DKIM checks are being used to harvest Microsoft 365 credentials.",
  },
  {
    id: "IR-2026-015",
    title: "Mailbox quota credential phishing",
    analyst: "SOC Analyst",
    opened: "2026-09-04",
    updated: "1 day ago",
    state: "Pending Review",
    priority: "high",
    risk: 77,
    emails: 6,
    indicators: 5,
    summary:
      "A cloned webmail portal on a typosquatted domain is collecting credentials behind a storage-quota pretext.",
  },
  {
    id: "IR-2026-012",
    title: "Supplier reconnaissance attempts",
    analyst: "DFIR Lead",
    opened: "2026-08-29",
    updated: "4 days ago",
    state: "Monitoring",
    priority: "medium",
    risk: 48,
    emails: 3,
    indicators: 4,
    summary:
      "Low-volume probing messages with no payload, likely mapping which mailboxes are active before a later campaign.",
  },
  {
    id: "IR-2026-009",
    title: "Bulk mail misclassification review",
    analyst: "SOC Analyst",
    opened: "2026-08-21",
    updated: "12 days ago",
    state: "Closed",
    priority: "low",
    risk: 14,
    emails: 12,
    indicators: 0,
    summary:
      "A marketing sender was repeatedly flagged as suspicious. Tuned the rule pack and closed the case as benign.",
  },
];

/** Indicator registry for the threat-intelligence page. */
export const indicatorRegistry = [
  {
    value: "secure-payments.com",
    type: "Domain",
    verdict: "malicious",
    firstSeen: "2026-09-03",
    sightings: 14,
    cases: ["IR-2026-018"],
    context: "Registered 4 days before first use. NameSilo, privacy-protected WHOIS.",
  },
  {
    value: "185.203.116.42",
    type: "IPv4",
    verdict: "malicious",
    firstSeen: "2026-09-03",
    sightings: 22,
    cases: ["IR-2026-018", "IR-2026-012"],
    context: "AS204915 Hostkey B.V. No PTR record. Hosts three related look-alike domains.",
  },
  {
    value: "micr0soft-security.com",
    type: "Domain",
    verdict: "malicious",
    firstSeen: "2026-08-31",
    sightings: 31,
    cases: ["IR-2026-017"],
    context: "Homoglyph of microsoft.com. Publishes its own valid SPF and DKIM records.",
  },
  {
    value: "company-it-support.net",
    type: "Domain",
    verdict: "malicious",
    firstSeen: "2026-08-28",
    sightings: 19,
    cases: ["IR-2026-015"],
    context: "Typosquat of the corporate domain, serving a cloned Outlook Web App portal.",
  },
  {
    value: "91.204.14.203",
    type: "IPv4",
    verdict: "suspicious",
    firstSeen: "2026-08-28",
    sightings: 8,
    cases: ["IR-2026-015"],
    context: "AS200651 Flokinet Ltd, a privacy-focused host frequently used for phishing pages.",
  },
  {
    value: "b41d8cd98f00b204e9800998ecf8427e",
    type: "MD5",
    verdict: "suspicious",
    firstSeen: "2026-09-07",
    sightings: 2,
    cases: ["IR-2026-018"],
    context: "Macro-enabled Word document. Macro downloads a second-stage payload on open.",
  },
  {
    value: "203.0.113.24",
    type: "IPv4",
    verdict: "benign",
    firstSeen: "2025-04-11",
    sightings: 1840,
    cases: [],
    context: "AS64500 Company Mail Services. Known corporate relay, allow-listed.",
  },
];

/** Campaign clusters formed by correlating indicators across cases. */
export const campaigns = [
  {
    name: "Ledger Drift",
    theme: "Invoice fraud / BEC",
    firstSeen: "2026-08-24",
    cases: 2,
    indicators: 15,
    confidence: "high",
    tone: "critical",
    note: "Shared hosting range and a consistent banking-change pretext link these cases.",
  },
  {
    name: "Homoglyph Harvest",
    theme: "Brand impersonation",
    firstSeen: "2026-08-19",
    cases: 3,
    indicators: 12,
    confidence: "high",
    tone: "high",
    note: "Character-substituted domains that publish their own authentication records.",
  },
  {
    name: "Quota Pretext",
    theme: "Credential phishing",
    firstSeen: "2026-08-28",
    cases: 1,
    indicators: 5,
    confidence: "medium",
    tone: "warn",
    note: "Reused portal template across several typosquatted corporate domains.",
  },
];

/**
 * Observed sending origins.
 *
 * `x` and `y` are percentage positions on an equirectangular world map, which
 * is what the schematic map on the GeoIP page plots against.
 */
export const geoOrigins = [
  { city: "Amsterdam", country: "Netherlands", code: "NL", ip: "185.203.116.42", asn: "AS204915", network: "Hostkey B.V.", volume: 34, risk: 92, x: 49.6, y: 26.5 },
  { city: "Saint Petersburg", country: "Russia", code: "RU", ip: "45.133.1.87", asn: "AS49505", network: "Selectel", volume: 28, risk: 81, x: 58.4, y: 22.0 },
  { city: "Reykjavik", country: "Iceland", code: "IS", ip: "91.204.14.203", asn: "AS200651", network: "Flokinet Ltd", volume: 16, risk: 77, x: 43.9, y: 20.5 },
  { city: "Lagos", country: "Nigeria", code: "NG", ip: "102.89.34.7", asn: "AS36873", network: "Cobranet", volume: 12, risk: 64, x: 51.5, y: 53.0 },
  { city: "Singapore", country: "Singapore", code: "SG", ip: "128.199.72.19", asn: "AS14061", network: "DigitalOcean", volume: 9, risk: 41, x: 76.5, y: 54.5 },
  { city: "London", country: "United Kingdom", code: "GB", ip: "203.0.113.24", asn: "AS64500", network: "Company Mail Services", volume: 61, risk: 6, x: 47.0, y: 24.5 },
];

/** Generated investigation reports. */
export const reports = [
  {
    id: "RPT-2026-041",
    title: "IR-2026-018 — Invoice fraud targeting finance",
    caseId: "IR-2026-018",
    generated: "2026-09-07 12:10 UTC",
    author: "DFIR Lead",
    format: "PDF",
    pages: 14,
    state: "Final",
    risk: 92,
  },
  {
    id: "RPT-2026-040",
    title: "IR-2026-017 — Microsoft brand impersonation wave",
    caseId: "IR-2026-017",
    generated: "2026-09-06 18:42 UTC",
    author: "Threat Intel",
    format: "PDF",
    pages: 11,
    state: "Final",
    risk: 81,
  },
  {
    id: "RPT-2026-038",
    title: "IR-2026-015 — Mailbox quota credential phishing",
    caseId: "IR-2026-015",
    generated: "2026-09-05 09:15 UTC",
    author: "SOC Analyst",
    format: "PDF",
    pages: 9,
    state: "Draft",
    risk: 77,
  },
  {
    id: "RPT-2026-035",
    title: "Monthly threat summary — August 2026",
    caseId: null,
    generated: "2026-09-01 07:00 UTC",
    author: "Automated",
    format: "PDF",
    pages: 22,
    state: "Final",
    risk: 0,
  },
];

/** Sections every generated report contains, listed on the reports page. */
export const reportSections = [
  { name: "Executive summary", detail: "Plain-language outcome and recommended action" },
  { name: "Evidence inventory", detail: "Every artefact with its classification and source" },
  { name: "Authentication analysis", detail: "SPF, DKIM, DMARC and alignment results" },
  { name: "Infrastructure intelligence", detail: "DNS, RDAP, ASN and GeoIP context" },
  { name: "Detection reasoning", detail: "Model signals and the rules that fired, with weights" },
  { name: "Correlation graph", detail: "Related indicators, cases and campaign clusters" },
  { name: "Confidence and uncertainty", detail: "What is established, and what stays unknown" },
  { name: "Chain of custody", detail: "Timestamped audit trail of every analyst action" },
];

/** Settings groups. Toggle state is local to the settings page. */
export const settingsGroups = [
  {
    title: "Detection",
    icon: "brain",
    description: "Tune how aggressively the engine escalates a message.",
    options: [
      { name: "Explainable scoring", detail: "Always attach model reasoning to a verdict", enabled: true },
      { name: "Auto-escalate BEC signals", detail: "Open a case when banking-change language is detected", enabled: true },
      { name: "Quarantine on critical", detail: "Hold messages scoring 90 or above", enabled: false },
    ],
  },
  {
    title: "Intelligence",
    icon: "network",
    description: "Control which enrichment sources are queried.",
    options: [
      { name: "DNS and RDAP enrichment", detail: "Resolve domain and registration context", enabled: true },
      { name: "GeoIP resolution", detail: "Attach network and location context to origins", enabled: true },
      { name: "Share indicators upstream", detail: "Contribute confirmed IOCs to the shared registry", enabled: false },
    ],
  },
  {
    title: "Notifications",
    icon: "bell",
    description: "Decide what reaches an analyst immediately.",
    options: [
      { name: "Critical detections", detail: "Notify on any message scoring 90 or above", enabled: true },
      { name: "Case assignments", detail: "Notify when a case is assigned to you", enabled: true },
      { name: "Weekly digest", detail: "Summary of detections and open cases", enabled: true },
    ],
  },
  {
    title: "Evidence handling",
    icon: "lock",
    description: "Retention and custody rules for stored evidence.",
    options: [
      { name: "Preserve original message", detail: "Retain the unmodified source of every analysed email", enabled: true },
      { name: "Immutable audit trail", detail: "Append-only record of analyst actions", enabled: true },
      { name: "Redact attachment contents", detail: "Store hashes and metadata only", enabled: false },
    ],
  },
];

/** Help-centre topics. */
export const helpTopics = [
  {
    icon: "book",
    title: "Getting started",
    detail: "Submit your first email, read the risk score and open an investigation.",
    href: "/docs",
  },
  {
    icon: "shield",
    title: "Reading authentication results",
    detail: "What SPF, DKIM, DMARC and alignment do — and do not — prove about a sender.",
    href: "/docs",
  },
  {
    icon: "scale",
    title: "The evidence model",
    detail: "How observed, derived, inferred and unknown findings differ, and why it matters.",
    href: "/docs",
  },
  {
    icon: "code",
    title: "API reference",
    detail: "Submit messages and retrieve investigation results programmatically.",
    href: "/docs/api",
  },
];

/** Frequently asked questions, rendered as an accordion. */
export const faqs = [
  {
    question: "Does a passing SPF or DKIM check mean an email is safe?",
    answer:
      "No. Authentication proves a message was sent by infrastructure authorised for that domain — it says nothing about whether the domain itself is trustworthy. A look-alike domain can publish perfectly valid SPF and DKIM records, which is exactly what the brand-impersonation cases in this platform demonstrate.",
  },
  {
    question: "Why is the risk score a number rather than a simple verdict?",
    answer:
      "A single number lets the platform rank a queue, and the severity band derived from it drives every colour and label in the interface. The score is always shown alongside the signals that produced it, so an analyst can disagree with the weighting rather than being handed an unexplained verdict.",
  },
  {
    question: "What does the platform do when evidence is inconclusive?",
    answer:
      "It records the gap explicitly. Findings are classified as observed, derived, inferred or unknown, and anything that cannot be established from available evidence stays marked unknown instead of being quietly rounded into a conclusion.",
  },
  {
    question: "Can GeoIP tell me where an attacker physically is?",
    answer:
      "No, and the platform never claims that. GeoIP resolves the network and approximate registration location of an address. That is context about infrastructure, not about a person, and proxies, VPNs and hosting providers routinely break any connection between the two.",
  },
  {
    question: "Is the original email preserved after analysis?",
    answer:
      "Yes, when the preserve-original setting is on. The unmodified source is kept as the primary evidence artefact, and every analyst action against it is appended to an immutable audit trail so a report stays defensible.",
  },
];

/** Feature signals shown on the single-email analysis page. */
export const analysisSignals = [
  { name: "Banking-detail change request", weight: 0.28, direction: "malicious", family: "BEC language" },
  { name: "Sender domain age under 30 days", weight: 0.21, direction: "malicious", family: "Infrastructure" },
  { name: "Authentication alignment failure", weight: 0.18, direction: "malicious", family: "Authentication" },
  { name: "Urgency and deadline pressure", weight: 0.12, direction: "malicious", family: "Social engineering" },
  { name: "Macro-enabled attachment", weight: 0.11, direction: "malicious", family: "Payload" },
  { name: "No prior correspondence with sender", weight: 0.06, direction: "malicious", family: "Relationship" },
  { name: "Plausible business context", weight: 0.04, direction: "benign", family: "Content" },
];

/** Chain-of-custody entries for the analysis page timeline. */
export const custodyTrail = [
  { time: "10:42:03", actor: "Ingestion", action: "Original message preserved", detail: "SHA-256 recorded, evidence record EM-2041 created" },
  { time: "10:42:04", actor: "Parser", action: "Headers extracted", detail: "41 headers, 4 Received hops reconstructed" },
  { time: "10:42:05", actor: "Authentication", action: "SPF, DKIM, DMARC evaluated", detail: "softfail / none / fail — alignment failed" },
  { time: "10:42:07", actor: "Intelligence", action: "Indicators enriched", detail: "DNS, RDAP and GeoIP resolved for 4 indicators" },
  { time: "10:42:09", actor: "Detection", action: "Risk assessed", detail: "Score 92, seven contributing signals recorded" },
  { time: "10:42:10", actor: "Correlation", action: "Campaign matched", detail: "Linked to cluster Ledger Drift at high confidence" },
  { time: "11:04:22", actor: "DFIR Lead", action: "Case opened", detail: "IR-2026-018 created and assigned" },
];
