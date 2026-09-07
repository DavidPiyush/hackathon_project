"use client";

import React from "react";

import {
  FaShieldAlt,
  FaEnvelope,
  FaFingerprint,
  FaSearch,
  FaBrain,
  FaNetworkWired,
  FaProjectDiagram,
  FaMapMarkedAlt,
  FaFileAlt,
  FaDatabase,
  FaLock,
  FaChartLine,
  FaCheck,
  FaArrowRight,
  FaServer,
  FaGlobe,
  FaExclamationTriangle,
} from "react-icons/fa";


/* =========================================================
   FEATURE DATA
========================================================= */

const features = [
  {
    number: "01",
    category: "EMAIL FORENSICS",
    title: "Deep Email Analysis",
    description:
      "Extract and reconstruct the technical evidence hidden inside a suspicious email instead of relying only on its visible content.",
    icon: FaEnvelope,
    points: [
      "Header and metadata extraction",
      "Received-path reconstruction",
      "Sender and recipient analysis",
      "Message structure inspection",
    ],
  },

  {
    number: "02",
    category: "AUTHENTICATION",
    title: "Authentication Analysis",
    description:
      "Evaluate the trust signals associated with the message and identify inconsistencies between the claimed sender and technical evidence.",
    icon: FaShieldAlt,
    points: [
      "SPF verification",
      "DKIM verification",
      "DMARC evaluation",
      "Authentication alignment",
    ],
  },

  {
    number: "03",
    category: "INDICATOR EXTRACTION",
    title: "IOC Extraction",
    description:
      "Automatically identify useful investigation indicators from the email and organize them for further analysis.",
    icon: FaFingerprint,
    points: [
      "IP addresses",
      "Domains",
      "URLs",
      "Email addresses",
    ],
  },

  {
    number: "04",
    category: "THREAT INTELLIGENCE",
    title: "Infrastructure Intelligence",
    description:
      "Enrich extracted indicators with technical context to help analysts understand the infrastructure associated with a suspicious message.",
    icon: FaNetworkWired,
    points: [
      "DNS information",
      "RDAP information",
      "ASN context",
      "Infrastructure relationships",
    ],
  },

  {
    number: "05",
    category: "AI DETECTION",
    title: "Explainable Threat Detection",
    description:
      "Use machine learning alongside deterministic security rules to identify suspicious patterns while keeping the reasoning understandable.",
    icon: FaBrain,
    points: [
      "Phishing detection",
      "BEC indicators",
      "Feature-based analysis",
      "Explainable risk scoring",
    ],
  },

  {
    number: "06",
    category: "EVIDENCE GRAPH",
    title: "Investigation Correlation",
    description:
      "Connect emails, domains, IP addresses, indicators and investigations to reveal relationships across cases.",
    icon: FaProjectDiagram,
    points: [
      "Indicator relationships",
      "Case correlation",
      "Infrastructure clustering",
      "Campaign connections",
    ],
  },

  {
    number: "07",
    category: "GEOLOCATION",
    title: "Network & Location Context",
    description:
      "Provide network and geographical context for observable infrastructure without making unsupported claims about a person's physical location.",
    icon: FaMapMarkedAlt,
    points: [
      "IP geolocation",
      "Network provider context",
      "ASN information",
      "Observable origin analysis",
    ],
  },

  {
    number: "08",
    category: "REPORTING",
    title: "Defensible Reporting",
    description:
      "Convert the investigation into a structured report that preserves evidence, findings, confidence and uncertainty.",
    icon: FaFileAlt,
    points: [
      "Investigation summary",
      "Evidence references",
      "Risk classification",
      "Audit-ready reporting",
    ],
  },
];


const platformCapabilities = [
  {
    icon: FaSearch,
    label: "FORENSICS",
    title: "Evidence-first analysis",
    text:
      "Start with the original message and progressively build the investigation from observable evidence.",
  },

  {
    icon: FaBrain,
    label: "AI / ML",
    title: "Explainable intelligence",
    text:
      "Combine machine learning signals with deterministic rules instead of hiding the investigation behind a single black-box score.",
  },

  {
    icon: FaProjectDiagram,
    label: "CORRELATION",
    title: "Connected investigations",
    text:
      "Move beyond individual indicators by connecting infrastructure and cases into a broader evidence graph.",
  },

  {
    icon: FaFileAlt,
    label: "REPORTING",
    title: "Reproducible output",
    text:
      "Preserve the reasoning behind the investigation so another analyst can understand how the conclusion was reached.",
  },
];


const technologyStack = [
  {
    label: "FRONTEND",
    value: "Next.js",
    icon: FaGlobe,
  },

  {
    label: "BACKEND",
    value: "FastAPI",
    icon: FaServer,
  },

  {
    label: "DATABASE",
    value: "MongoDB",
    icon: FaDatabase,
  },

  {
    label: "MACHINE LEARNING",
    value: "scikit-learn",
    icon: FaBrain,
  },

  {
    label: "GRAPH",
    value: "Cytoscape.js",
    icon: FaProjectDiagram,
  },

  {
    label: "VISUALIZATION",
    value: "Leaflet",
    icon: FaMapMarkedAlt,
  },
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Features() {
  return (

    <main className="min-h-screen bg-[#071426] text-[#E7EEF7]">


      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative overflow-hidden
          border-b border-[#193552]
        "
      >

        {/* BACKGROUND GRID */}

        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(#16304b 1px, transparent 1px), linear-gradient(90deg, #16304b 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />


        <div
          className="
            relative mx-auto
            max-w-[1400px]
            px-6
            py-24
            lg:px-12
            lg:py-32
          "
        >

          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">


            {/* LEFT */}

            <div>

              <p
                className="
                  mb-7
                  font-mono
                  text-[10px]
                  tracking-[0.22em]
                  text-[#22D3EE]
                "
              >
                MAILTRACE // PLATFORM FEATURES
              </p>


              <h1
                className="
                  max-w-[900px]
                  text-5xl
                  font-semibold
                  leading-[0.95]
                  tracking-[-0.045em]
                  text-[#EDF4FC]
                  sm:text-6xl
                  lg:text-8xl
                "
              >
                Every layer of the
                <br />

                <span className="text-[#22D3EE]">
                  investigation.
                </span>
              </h1>


              <p
                className="
                  mt-9
                  max-w-[780px]
                  text-lg
                  leading-8
                  text-[#91B0D0]
                  lg:text-xl
                "
              >
                MAILTRACE combines email forensics, authentication
                analysis, threat intelligence, explainable AI,
                infrastructure correlation and reporting into one
                evidence-first investigation platform.
              </p>


              {/* META */}

              <div className="mt-12 flex flex-wrap">

                <MetaItem
                  label="ANALYSIS"
                  value="Forensics + AI"
                />

                <MetaItem
                  label="INTELLIGENCE"
                  value="Infrastructure"
                />

                <MetaItem
                  label="OUTPUT"
                  value="Evidence + Report"
                />

              </div>

            </div>


            {/* RIGHT FEATURE TERMINAL */}

            <div
              className="
                border border-[#24496B]
                bg-[#0A1A2E]
              "
            >

              <div
                className="
                  border-b
                  border-[#24496B]
                  px-6 py-4
                  font-mono
                  text-[9px]
                  tracking-[0.18em]
                  text-[#6687A8]
                "
              >
                MAILTRACE_FEATURE_MATRIX
              </div>


              <div className="p-6">

                {[
                  ["01", "EMAIL FORENSICS"],
                  ["02", "AUTHENTICATION"],
                  ["03", "IOC INTELLIGENCE"],
                  ["04", "AI DETECTION"],
                  ["05", "EVIDENCE GRAPH"],
                  ["06", "REPORTING"],
                ].map(([number, label]) => (

                  <div
                    key={number}
                    className="
                      flex items-center
                      gap-4
                      border-b
                      border-[#193552]
                      py-4
                    "
                  >

                    <span
                      className="
                        font-mono
                        text-[10px]
                        text-[#22D3EE]
                      "
                    >
                      {number}
                    </span>

                    <span
                      className="
                        font-mono
                        text-xs
                        text-[#A7BED7]
                      "
                    >
                      {label}
                    </span>

                    <FaCheck
                      className="ml-auto text-[#10B981]"
                      size={10}
                    />

                  </div>

                ))}


                <div
                  className="
                    mt-6
                    font-mono
                    text-[9px]
                    tracking-wider
                    text-[#22D3EE]
                  "
                >
                  FORENSICS → INTELLIGENCE → DECISION
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 01 — OVERVIEW
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="01"
            label="PLATFORM CAPABILITIES"
            title={
              <>
                Built around the
                <br />
                <span>investigation workflow.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-6 lg:grid-cols-4">

            {platformCapabilities.map((item) => {

              const Icon = item.icon;

              return (

                <article
                  key={item.label}
                  className="
                    border border-[#24496B]
                    bg-[#0A1A2E]
                    p-7
                    transition
                    duration-300
                    hover:border-[#22D3EE]
                    hover:bg-[#0C1E33]
                  "
                >

                  <Icon
                    className="text-[#22D3EE]"
                    size={20}
                  />


                  <p
                    className="
                      mt-8
                      font-mono
                      text-[9px]
                      tracking-[0.18em]
                      text-[#6687A8]
                    "
                  >
                    {item.label}
                  </p>


                  <h3
                    className="
                      mt-3
                      text-xl
                      font-medium
                      text-[#E7EEF7]
                    "
                  >
                    {item.title}
                  </h3>


                  <p
                    className="
                      mt-4
                      text-sm
                      leading-7
                      text-[#7897B7]
                    "
                  >
                    {item.text}
                  </p>

                </article>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 02 — ALL FEATURES
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="02"
            label="FEATURES"
            title={
              <>
                Eight capabilities.
                <br />
                <span>One security workspace.</span>
              </>
            }
          />


          <div
            className="
              mt-16
              grid
              gap-px
              bg-[#193552]
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            {features.map((feature) => {

              const Icon = feature.icon;

              return (

                <article
                  key={feature.number}
                  className="
                    group
                    relative
                    min-h-[460px]
                    bg-[#071426]
                    p-7
                    transition
                    duration-300
                    hover:bg-[#0A1A2E]
                  "
                >

                  {/* TOP */}

                  <div className="flex items-start justify-between">

                    <span
                      className="
                        font-mono
                        text-4xl
                        font-semibold
                        text-[#173654]
                        transition
                        group-hover:text-[#22D3EE]
                      "
                    >
                      {feature.number}
                    </span>


                    <Icon
                      className="
                        text-[#2C506F]
                        transition
                        group-hover:text-[#22D3EE]
                      "
                      size={20}
                    />

                  </div>


                  {/* LABEL */}

                  <p
                    className="
                      mt-12
                      font-mono
                      text-[9px]
                      tracking-[0.2em]
                      text-[#22D3EE]
                    "
                  >
                    {feature.category}
                  </p>


                  {/* TITLE */}

                  <h3
                    className="
                      mt-4
                      text-2xl
                      font-medium
                      leading-tight
                      text-[#E7EEF7]
                    "
                  >
                    {feature.title}
                  </h3>


                  {/* DESCRIPTION */}

                  <p
                    className="
                      mt-5
                      text-sm
                      leading-7
                      text-[#7897B7]
                    "
                  >
                    {feature.description}
                  </p>


                  {/* POINTS */}

                  <div className="mt-7 space-y-3">

                    {feature.points.map((point) => (

                      <div
                        key={point}
                        className="
                          flex
                          items-center
                          gap-3
                          font-mono
                          text-[10px]
                          text-[#8FAECC]
                        "
                      >

                        <span className="text-[#22D3EE]">
                          +
                        </span>

                        {point}

                      </div>

                    ))}

                  </div>


                  {/* ARROW */}

                  <FaArrowRight
                    className="
                      absolute
                      bottom-7
                      right-7
                      text-[#294966]
                      transition
                      group-hover:text-[#22D3EE]
                    "
                    size={13}
                  />

                </article>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 03 — FORENSICS
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="03"
            label="EMAIL FORENSICS"
            title={
              <>
                See beyond the visible
                <br />
                <span>message.</span>
              </>
            }
          />


          <div
            className="
              mt-16
              grid
              gap-6
              lg:grid-cols-[1fr_1.3fr]
            "
          >

            {/* LEFT */}

            <div
              className="
                border
                border-[#24496B]
                bg-[#0A1A2E]
                p-8
              "
            >

              <FaEnvelope
                className="text-[#22D3EE]"
                size={24}
              />


              <h3
                className="
                  mt-8
                  text-3xl
                  font-medium
                "
              >
                Message
                <br />
                reconstruction.
              </h3>


              <p
                className="
                  mt-6
                  text-sm
                  leading-7
                  text-[#7897B7]
                "
              >
                MAILTRACE looks beyond the visible body of an email
                and reconstructs the technical path and metadata
                surrounding the message.
              </p>

            </div>


            {/* RIGHT */}

            <div className="grid gap-px bg-[#193552] sm:grid-cols-2">

              <ForensicItem
                icon={FaFingerprint}
                title="Headers"
                text="Extract sender, recipient, Message-ID and routing information."
              />

              <ForensicItem
                icon={FaNetworkWired}
                title="Received Path"
                text="Reconstruct the sequence of observable mail servers."
              />

              <ForensicItem
                icon={FaShieldAlt}
                title="Authentication"
                text="Evaluate SPF, DKIM and DMARC signals."
              />

              <ForensicItem
                icon={FaSearch}
                title="Indicators"
                text="Extract domains, URLs, IP addresses and other investigation artifacts."
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 04 — AI
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="04"
            label="AI-ASSISTED DETECTION"
            title={
              <>
                Intelligence without
                <br />
                <span>the black box.</span>
              </>
            }
          />


          <div
            className="
              mt-16
              grid
              gap-6
              lg:grid-cols-3
            "
          >

            <DetectionCard
              number="01"
              title="Security Rules"
              text="Deterministic checks identify known security signals and authentication anomalies."
            />

            <DetectionCard
              number="02"
              title="Machine Learning"
              text="Explainable models evaluate relevant features and contribute to threat classification."
              featured
            />

            <DetectionCard
              number="03"
              title="Analyst Review"
              text="The analyst can inspect the supporting evidence before accepting the final investigation result."
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 05 — INFRASTRUCTURE
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="05"
            label="INFRASTRUCTURE INTELLIGENCE"
            title={
              <>
                Follow the indicators.
                <br />
                <span>Understand the infrastructure.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-6 lg:grid-cols-2">


            {/* NETWORK */}

            <div
              className="
                border
                border-[#24496B]
                bg-[#0A1A2E]
                p-8
              "
            >

              <div className="flex items-center justify-between">

                <FaServer
                  className="text-[#22D3EE]"
                  size={22}
                />

                <span
                  className="
                    font-mono
                    text-[9px]
                    tracking-wider
                    text-[#6687A8]
                  "
                >
                  NETWORK_CONTEXT
                </span>

              </div>


              <h3 className="mt-10 text-2xl font-medium">
                Infrastructure enrichment
              </h3>


              <p
                className="
                  mt-4
                  max-w-[600px]
                  text-sm
                  leading-7
                  text-[#7897B7]
                "
              >
                Extracted indicators can be enriched with domain,
                network and registration context to provide a broader
                understanding of the infrastructure.
              </p>


              <div className="mt-8 grid grid-cols-2 gap-3">

                {[
                  "DNS",
                  "RDAP",
                  "ASN",
                  "IP",
                ].map((item) => (

                  <div
                    key={item}
                    className="
                      border
                      border-[#193552]
                      px-4 py-4
                      font-mono
                      text-xs
                      text-[#8FAECC]
                    "
                  >
                    {item}
                  </div>

                ))}

              </div>

            </div>


            {/* LOCATION */}

            <div
              className="
                border
                border-[#24496B]
                bg-[#0A1A2E]
                p-8
              "
            >

              <div className="flex items-center justify-between">

                <FaMapMarkedAlt
                  className="text-[#22D3EE]"
                  size={22}
                />

                <span
                  className="
                    font-mono
                    text-[9px]
                    tracking-wider
                    text-[#6687A8]
                  "
                >
                  OBSERVABLE_ORIGIN
                </span>

              </div>


              <h3 className="mt-10 text-2xl font-medium">
                Network location context
              </h3>


              <p
                className="
                  mt-4
                  max-w-[600px]
                  text-sm
                  leading-7
                  text-[#7897B7]
                "
              >
                Geolocation and network information can help analysts
                understand where observable infrastructure is located
                without claiming that it identifies an individual.
              </p>


              <div className="mt-8 flex items-center gap-3">

                <div
                  className="
                    flex h-11 w-11
                    items-center
                    justify-center
                    border border-[#24496B]
                    text-[#22D3EE]
                  "
                >
                  <FaGlobe />
                </div>

                <div>

                  <p className="text-sm text-[#DDE8F4]">
                    Observable infrastructure
                  </p>

                  <p className="mt-1 text-xs text-[#6687A8]">
                    Evidence-based network context
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 06 — REPORTING
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="06"
            label="REPORTING"
            title={
              <>
                From detection result
                <br />
                <span>to defensible report.</span>
              </>
            }
          />


          <div
            className="
              mt-16
              border
              border-[#24496B]
              bg-[#0A1A2E]
            "
          >

            {/* REPORT HEADER */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-[#24496B]
                p-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p
                  className="
                    font-mono
                    text-[9px]
                    tracking-[0.18em]
                    text-[#22D3EE]
                  "
                >
                  INVESTIGATION REPORT
                </p>

                <h3 className="mt-2 text-xl font-medium">
                  Evidence-backed findings
                </h3>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  font-mono
                  text-[9px]
                  text-[#10B981]
                "
              >

                <FaCheck />

                EVIDENCE VERIFIED

              </div>

            </div>


            {/* REPORT ROWS */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4">

              <ReportItem
                label="CLASSIFICATION"
                value="Threat Assessment"
              />

              <ReportItem
                label="RISK"
                value="Evidence Based"
              />

              <ReportItem
                label="INDICATORS"
                value="Correlated"
              />

              <ReportItem
                label="CONFIDENCE"
                value="Documented"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 07 — TECHNOLOGY
      ====================================================== */}

      <section className="border-b border-[#193552]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-28
            lg:px-12
          "
        >

          <SectionHeading
            number="07"
            label="TECHNOLOGY"
            title={
              <>
                The engineering behind
                <br />
                <span>the investigation.</span>
              </>
            }
          />


          <div
            className="
              mt-16
              grid
              gap-px
              bg-[#193552]
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {technologyStack.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.label}
                  className="
                    bg-[#071426]
                    p-7
                    transition
                    hover:bg-[#0A1A2E]
                  "
                >

                  <Icon
                    className="text-[#22D3EE]"
                    size={18}
                  />

                  <p
                    className="
                      mt-7
                      font-mono
                      text-[9px]
                      tracking-[0.18em]
                      text-[#6687A8]
                    "
                  >
                    {item.label}
                  </p>

                  <p
                    className="
                      mt-2
                      text-lg
                      font-medium
                      text-[#DDE8F4]
                    "
                  >
                    {item.value}
                  </p>

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-[#06111F]">

        <div
          className="
            mx-auto
            max-w-[1400px]
            px-6 py-32
            lg:px-12
          "
        >

          <p
            className="
              font-mono
              text-[10px]
              tracking-[0.22em]
              text-[#22D3EE]
            "
          >
            08 / THE MAILTRACE ADVANTAGE
          </p>


          <h2
            className="
              mt-8
              max-w-[1000px]
              text-5xl
              font-semibold
              leading-[1]
              tracking-[-0.04em]
              sm:text-6xl
              lg:text-8xl
            "
          >
            One workspace.
            <br />

            <span className="text-[#22D3EE]">
              Complete investigation context.
            </span>
          </h2>


          <p
            className="
              mt-10
              max-w-[760px]
              text-lg
              leading-8
              text-[#8FAECC]
            "
          >
            MAILTRACE brings the technical evidence, intelligence,
            detection and reporting layers together so analysts can
            investigate suspicious email without constantly switching
            between disconnected tools.
          </p>


          {/* ADVANTAGE ROW */}

          <div
            className="
              mt-16
              grid
              border-y
              border-[#193552]
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <Advantage
              number="01"
              label="FORENSICS"
              value="Deep Analysis"
            />

            <Advantage
              number="02"
              label="INTELLIGENCE"
              value="Infrastructure Context"
            />

            <Advantage
              number="03"
              label="DETECTION"
              value="Explainable AI"
            />

            <Advantage
              number="04"
              label="REPORTING"
              value="Defensible Evidence"
            />

          </div>


          {/* PRINCIPLE */}

          <div
            className="
              mt-12
              max-w-[850px]
              border
              border-[#24496B]
              bg-[#0A1A2E]
              p-7
            "
          >

            <div className="flex items-center gap-3">

              <FaExclamationTriangle
                className="text-[#F59E0B]"
                size={13}
              />

              <span
                className="
                  font-mono
                  text-[10px]
                  tracking-[0.18em]
                  text-[#F59E0B]
                "
              >
                FORENSIC PRINCIPLE
              </span>

            </div>


            <p
              className="
                mt-5
                text-sm
                leading-7
                text-[#7897B7]
              "
            >
              MAILTRACE investigates observable infrastructure and
              evidence. It does not claim to identify an attacker or
              their physical location when the available evidence
              cannot support that conclusion.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <section className="border-t border-[#193552]">

        <div
          className="
            mx-auto
            flex max-w-[1400px]
            flex-col
            gap-10
            px-6 py-20
            sm:flex-row
            sm:items-end
            sm:justify-between
            lg:px-12
          "
        >

          <div>

            <p
              className="
                font-mono
                text-[10px]
                tracking-[0.2em]
                text-[#22D3EE]
              "
            >
              MAILTRACE
            </p>

            <h2
              className="
                mt-4
                text-4xl
                font-semibold
                tracking-tight
                text-[#EDF4FC]
                sm:text-5xl
              "
            >
              Investigate deeper.
              <br />
              Decide with evidence.
            </h2>

          </div>


          <button
            className="
              flex
              w-fit
              items-center
              gap-3
              border
              border-[#22D3EE]
              px-6 py-4
              font-mono
              text-xs
              tracking-wider
              text-[#22D3EE]
              transition
              hover:bg-[#22D3EE]
              hover:text-[#071426]
            "
          >

            EXPLORE MAILTRACE

            <FaArrowRight size={11} />

          </button>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SectionHeading({
  number,
  label,
  title,
}) {

  return (

    <div>

      <p
        className="
          font-mono
          text-[10px]
          tracking-[0.22em]
          text-[#22D3EE]
        "
      >
        {number} / {label}
      </p>


      <h2
        className="
          mt-8
          max-w-[1000px]
          text-4xl
          font-semibold
          leading-[1.05]
          tracking-[-0.035em]
          text-[#E7EEF7]
          sm:text-5xl
          lg:text-7xl
        "
      >
        {title}
      </h2>

    </div>

  );
}


function MetaItem({
  label,
  value,
}) {

  return (

    <div
      className="
        border-l
        border-[#24496B]
        px-5
        first:pl-0
      "
    >

      <p
        className="
          font-mono
          text-[8px]
          tracking-[0.18em]
          text-[#22D3EE]
        "
      >
        {label}
      </p>

      <p className="mt-2 text-sm text-[#D6E2EF]">
        {value}
      </p>

    </div>

  );
}


function ForensicItem({
  icon: Icon,
  title,
  text,
}) {

  return (

    <div
      className="
        bg-[#071426]
        p-7
        transition
        hover:bg-[#0A1A2E]
      "
    >

      <Icon
        className="text-[#22D3EE]"
        size={18}
      />

      <h3 className="mt-6 text-lg font-medium">
        {title}
      </h3>

      <p
        className="
          mt-3
          text-sm
          leading-6
          text-[#7897B7]
        "
      >
        {text}
      </p>

    </div>

  );
}


function DetectionCard({
  number,
  title,
  text,
  featured = false,
}) {

  return (

    <article
      className={`
        border
        p-8
        ${
          featured
            ? "border-[#22D3EE] bg-[#0A1A2E]"
            : "border-[#24496B] bg-[#071426]"
        }
      `}
    >

      <span
        className="
          font-mono
          text-3xl
          text-[#22D3EE]
        "
      >
        {number}
      </span>


      <h3 className="mt-10 text-2xl font-medium">
        {title}
      </h3>


      <p
        className="
          mt-5
          text-sm
          leading-7
          text-[#7897B7]
        "
      >
        {text}
      </p>


      <div className="mt-8 h-px bg-[#193552]" />

    </article>

  );
}


function ReportItem({
  label,
  value,
}) {

  return (

    <div
      className="
        border-b
        border-[#193552]
        p-6
        lg:border-r
        lg:last:border-r-0
      "
    >

      <p
        className="
          font-mono
          text-[9px]
          tracking-[0.18em]
          text-[#6687A8]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-3
          text-sm
          font-medium
          text-[#DDE8F4]
        "
      >
        {value}
      </p>

    </div>

  );
}


function Advantage({
  number,
  label,
  value,
}) {

  return (

    <div
      className="
        border-b
        border-[#193552]
        p-7
        sm:border-r
        lg:border-b-0
      "
    >

      <span
        className="
          font-mono
          text-[9px]
          text-[#22D3EE]
        "
      >
        {number}
      </span>


      <p
        className="
          mt-7
          font-mono
          text-[9px]
          tracking-[0.18em]
          text-[#6687A8]
        "
      >
        {label}
      </p>


      <strong
        className="
          mt-2
          block
          text-sm
          font-medium
          text-[#DDE8F4]
        "
      >
        {value}
      </strong>

    </div>

  );
}