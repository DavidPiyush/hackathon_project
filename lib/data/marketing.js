/** Content for the landing page. Pure data — no UI imports. */

export const heroHighlights = [
  "Evidence-first analysis",
  "Threat intelligence",
  "DFIR workflows",
];

/** The live-looking analysis panel beside the hero headline. */
export const heroAnalysis = {
  subject: "Urgent: invoice payment required",
  sender: "finance@secure-payments.com",
  score: 72,
  checks: [
    {
      icon: "warning",
      title: "Threat Detection",
      detail: "Credential-harvesting language detected",
      state: "REVIEW",
      tone: "warn",
    },
    {
      icon: "lock",
      title: "Authentication",
      detail: "SPF soft-fail, DKIM absent, DMARC none",
      state: "FAILED",
      tone: "critical",
    },
    {
      icon: "network",
      title: "Infrastructure",
      detail: "Domain registered 4 days ago",
      state: "SUSPICIOUS",
      tone: "high",
    },
    {
      icon: "shield",
      title: "Threat Intelligence",
      detail: "2 indicators correlated to open cases",
      state: "ANALYZED",
      tone: "safe",
    },
  ],
};

/** The eight platform capabilities, the core of the features section. */
export const features = [
  {
    number: "01",
    category: "Email Forensics",
    title: "Deep Email Analysis",
    description:
      "Extract and reconstruct the technical evidence hidden inside a suspicious email instead of relying only on its visible content.",
    icon: "envelope",
    points: [
      "Header and metadata extraction",
      "Received-path reconstruction",
      "Sender and recipient analysis",
      "Message structure inspection",
    ],
  },
  {
    number: "02",
    category: "Authentication",
    title: "Authentication Analysis",
    description:
      "Evaluate the trust signals attached to a message and surface inconsistencies between the claimed sender and the technical evidence.",
    icon: "shield",
    points: [
      "SPF verification",
      "DKIM verification",
      "DMARC evaluation",
      "Authentication alignment",
    ],
  },
  {
    number: "03",
    category: "Indicator Extraction",
    title: "IOC Extraction",
    description:
      "Automatically identify useful investigation indicators from the email and organise them for further analysis.",
    icon: "fingerprint",
    points: ["IP addresses", "Domains", "URLs", "Email addresses"],
  },
  {
    number: "04",
    category: "Threat Intelligence",
    title: "Infrastructure Intelligence",
    description:
      "Enrich extracted indicators with technical context so analysts understand the infrastructure behind a suspicious message.",
    icon: "network",
    points: [
      "DNS information",
      "RDAP information",
      "ASN context",
      "Infrastructure relationships",
    ],
  },
  {
    number: "05",
    category: "AI Detection",
    title: "Explainable Threat Detection",
    description:
      "Use machine learning alongside deterministic security rules to identify suspicious patterns while keeping the reasoning understandable.",
    icon: "brain",
    points: [
      "Phishing detection",
      "BEC indicators",
      "Feature-based analysis",
      "Explainable risk scoring",
    ],
  },
  {
    number: "06",
    category: "Evidence Graph",
    title: "Investigation Correlation",
    description:
      "Connect emails, domains, IP addresses, indicators and investigations to reveal relationships across cases.",
    icon: "graph",
    points: [
      "Indicator relationships",
      "Case correlation",
      "Infrastructure clustering",
      "Campaign connections",
    ],
  },
  {
    number: "07",
    category: "Geolocation",
    title: "Network & Location Context",
    description:
      "Provide network and geographical context for observable infrastructure without making unsupported claims about the physical location of a person.",
    icon: "map",
    points: [
      "IP geolocation",
      "Network provider context",
      "ASN information",
      "Observable origin analysis",
    ],
  },
  {
    number: "08",
    category: "Reporting",
    title: "Defensible Reporting",
    description:
      "Turn the investigation into a structured report that preserves evidence, findings, confidence and uncertainty.",
    icon: "file",
    points: [
      "Investigation summary",
      "Evidence references",
      "Risk classification",
      "Audit-ready reporting",
    ],
  },
];

/** Cross-cutting principles, shown as a four-up band under the features. */
export const platformPrinciples = [
  {
    icon: "search",
    label: "Forensics",
    title: "Evidence-first analysis",
    text: "Start with the original message and build the investigation up from observable evidence.",
  },
  {
    icon: "brain",
    label: "AI / ML",
    title: "Explainable intelligence",
    text: "Combine machine-learning signals with deterministic rules rather than hiding the verdict behind a single black-box score.",
  },
  {
    icon: "graph",
    label: "Correlation",
    title: "Connected investigations",
    text: "Move past isolated indicators by joining infrastructure and cases into a shared evidence graph.",
  },
  {
    icon: "file",
    label: "Reporting",
    title: "Reproducible output",
    text: "Preserve the reasoning so a second analyst can follow exactly how a conclusion was reached.",
  },
];

/** The six-stage investigation pipeline. */
export const workflow = [
  {
    id: "01",
    label: "Ingestion",
    title: "Start with the original email.",
    description:
      "The investigation begins with the original suspicious email. ThreatDetect preserves the message as the primary evidence source before any analysis runs.",
    icon: "envelope",
    items: [
      "Original message preserved",
      "Investigation record created",
      "Evidence integrity maintained",
    ],
  },
  {
    id: "02",
    label: "Forensics",
    title: "Reconstruct the message.",
    description:
      "The email is parsed to uncover the technical information behind the visible message — headers, routing path and authentication results.",
    icon: "fingerprint",
    items: [
      "Header extraction",
      "Received-path analysis",
      "SPF / DKIM / DMARC checks",
    ],
  },
  {
    id: "03",
    label: "Intelligence",
    title: "Understand the infrastructure.",
    description:
      "Extracted indicators are enriched with network and domain intelligence to give context on the infrastructure behind the email.",
    icon: "network",
    items: ["DNS intelligence", "RDAP information", "IP / ASN / GeoIP context"],
  },
  {
    id: "04",
    label: "Detection",
    title: "Measure the threat.",
    description:
      "Deterministic security rules and explainable machine learning weigh the available signals and contribute to the overall assessment.",
    icon: "brain",
    items: [
      "Phishing indicators",
      "BEC signals",
      "Explainable risk assessment",
    ],
  },
  {
    id: "05",
    label: "Correlation",
    title: "Connect the evidence.",
    description:
      "Related domains, addresses, indicators and investigations are linked to reveal relationships invisible from a single email.",
    icon: "graph",
    items: [
      "Indicator relationships",
      "Infrastructure correlation",
      "Campaign connections",
    ],
  },
  {
    id: "06",
    label: "Reporting",
    title: "Produce a defensible conclusion.",
    description:
      "The investigation becomes a structured result showing evidence, analytical findings, confidence and remaining uncertainty.",
    icon: "file",
    items: [
      "Evidence-backed findings",
      "Confidence information",
      "Investigation report",
    ],
  },
];

/**
 * The evidence classification model. This is the intellectual core of the
 * product — every finding is labelled with how it was established.
 */
export const evidenceClasses = [
  {
    number: "01",
    title: "Observed",
    tone: "safe",
    text: "Information extracted or verified directly from the original message and available intelligence sources.",
  },
  {
    number: "02",
    title: "Derived",
    tone: "info",
    text: "Findings calculated from available evidence, such as authentication results, routing and infrastructure relationships.",
  },
  {
    number: "03",
    title: "Inferred",
    tone: "warn",
    text: "Analytical conclusions produced by combining multiple signals, always paired with a confidence level.",
  },
  {
    number: "04",
    title: "Unknown",
    tone: "neutral",
    text: "Anything that cannot be reliably established from the available evidence stays explicitly unknown.",
  },
];

/** Signal categories highlighted in the closing band of the pipeline section. */
export const intelligenceSignals = [
  {
    icon: "shield",
    label: "Authentication",
    title: "Trust signals",
    text: "Authentication mechanisms are strong evidence of whether a message aligns with the infrastructure it claims to come from.",
  },
  {
    icon: "server",
    label: "Infrastructure",
    title: "Network context",
    text: "Addresses, domains, ASN and related infrastructure supply the technical context around a message.",
  },
  {
    icon: "brain",
    label: "Analysis",
    title: "Explainable detection",
    text: "Machine learning contributes an analytical signal while keeping the supporting evidence visible to the analyst.",
  },
];

/** Capabilities summarised on the about section. */
export const capabilities = [
  {
    number: "01",
    icon: "fingerprint",
    title: "Email Forensics",
    description:
      "Analyse raw headers, authentication results, Received hops and trust boundaries to reconstruct the path a message took.",
  },
  {
    number: "02",
    icon: "brain",
    title: "AI Threat Detection",
    description:
      "Combine explainable machine learning with deterministic rules to identify phishing, spoofing and business email compromise.",
  },
  {
    number: "03",
    icon: "network",
    title: "Threat Intelligence",
    description:
      "Correlate domains, addresses, ASN, DNS and RDAP intelligence to deepen investigation context.",
  },
  {
    number: "04",
    icon: "graph",
    title: "Evidence Correlation",
    description:
      "Join indicators, cases and campaigns through an evidence graph to expose relationships across investigations.",
  },
];

/** Technology stack, shown as a chip grid on the about section. */
export const technologyStack = [
  { label: "Frontend", value: "Next.js", icon: "code" },
  { label: "Backend", value: "FastAPI", icon: "server" },
  { label: "Storage", value: "MongoDB", icon: "database" },
  { label: "Machine Learning", value: "scikit-learn", icon: "brain" },
  { label: "Evidence Graph", value: "Cytoscape.js", icon: "graph" },
  { label: "Visualization", value: "Leaflet", icon: "map" },
];

/** Delivery team, described by discipline rather than by name. */
export const team = [
  {
    id: "M1",
    role: "Team Lead / DFIR",
    title: "Digital Forensics",
    description:
      "Evidence schema, parser, header forensics, trust boundaries, chain of custody and report content.",
  },
  {
    id: "M2",
    role: "AI / ML",
    title: "Threat Detection",
    description:
      "Dataset, feature pipeline, classifier, calibration, BEC engine, model evaluation and explainability.",
  },
  {
    id: "M3",
    role: "Threat Intelligence",
    title: "Infrastructure Intelligence",
    description:
      "DNS, RDAP, GeoIP, domain intelligence, graph correlation, campaign clustering and the IOC registry.",
  },
  {
    id: "M4",
    role: "Backend",
    title: "Platform Engineering",
    description:
      "FastAPI, authentication, RBAC, MongoDB, orchestration, reports and the audit chain.",
  },
  {
    id: "M5",
    role: "Frontend / DevOps",
    title: "Product Experience",
    description:
      "Next.js interface, dashboard, investigation screen, graph, map, reports and deployment.",
  },
];

/** Guiding principles, rendered as a chip row. */
export const principles = [
  "Evidence first",
  "Explainable analysis",
  "Infrastructure intelligence",
  "Defensible reporting",
];

/** Inquiry categories for the contact form. */
export const inquiryTypes = [
  { value: "general", label: "General Question" },
  { value: "security", label: "Security Issue" },
  { value: "threat", label: "Threat Investigation" },
  { value: "feedback", label: "Product Feedback" },
  { value: "other", label: "Other" },
];

/** Contact channels shown alongside the form. */
export const contactChannels = [
  {
    icon: "envelope",
    label: "Email",
    value: "contact@threatdetect.com",
    detail: "We aim to respond within one business day.",
  },
  {
    icon: "headset",
    label: "Security Operations",
    value: "Analyst on call",
    detail: "For active incidents, mark your subject line URGENT.",
  },
  {
    icon: "clock",
    label: "Hours",
    value: "Mon–Fri, 09:00–18:00 UTC",
    detail: "Critical escalations are monitored continuously.",
  },
];
