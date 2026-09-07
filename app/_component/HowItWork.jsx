"use client";

import React from "react";
import {
  FaEnvelope,
  FaSearch,
  FaShieldAlt,
  FaNetworkWired,
  FaBrain,
  FaProjectDiagram,
  FaFileAlt,
  FaArrowRight,
  FaCheck,
  FaDatabase,
  FaGlobe,
  FaFingerprint,
  FaServer,
  FaChartLine,
} from "react-icons/fa";

const workflow = [
  {
    id: "01",
    label: "INGESTION",
    title: "Start with the original email.",
    description:
      "The investigation begins with the original suspicious email. MAILTRACE preserves the message as the primary evidence source before any analysis begins.",
    icon: FaEnvelope,
    items: [
      "Original message preserved",
      "Investigation record created",
      "Evidence integrity maintained",
    ],
  },
  {
    id: "02",
    label: "FORENSICS",
    title: "Reconstruct the message.",
    description:
      "The email is parsed to uncover the technical information hidden behind the visible message, including headers, routing paths and authentication results.",
    icon: FaFingerprint,
    items: [
      "Header extraction",
      "Received-path analysis",
      "SPF / DKIM / DMARC checks",
    ],
  },
  {
    id: "03",
    label: "INTELLIGENCE",
    title: "Understand the infrastructure.",
    description:
      "MAILTRACE enriches extracted indicators with network and domain intelligence to provide context around the infrastructure associated with the email.",
    icon: FaNetworkWired,
    items: [
      "DNS intelligence",
      "RDAP information",
      "IP / ASN / GeoIP context",
    ],
  },
  {
    id: "04",
    label: "DETECTION",
    title: "Measure the threat.",
    description:
      "Deterministic security rules and explainable machine learning evaluate the available signals and contribute to the overall investigation.",
    icon: FaBrain,
    items: [
      "Phishing indicators",
      "BEC signals",
      "Explainable risk assessment",
    ],
  },
  {
    id: "05",
    label: "CORRELATION",
    title: "Connect the evidence.",
    description:
      "Related domains, IP addresses, indicators and investigations are connected to reveal relationships that may not be visible from an individual email.",
    icon: FaProjectDiagram,
    items: [
      "Indicator relationships",
      "Infrastructure correlation",
      "Campaign connections",
    ],
  },
  {
    id: "06",
    label: "REPORTING",
    title: "Produce a defensible conclusion.",
    description:
      "The investigation is transformed into a structured result showing the evidence, analytical findings, confidence and remaining uncertainty.",
    icon: FaFileAlt,
    items: [
      "Evidence-backed findings",
      "Confidence information",
      "Investigation report",
    ],
  },
];

const evidence = [
  {
    number: "01",
    title: "Observed",
    text:
      "Information directly extracted or verified from the original message and available intelligence sources.",
  },
  {
    number: "02",
    title: "Derived",
    text:
      "Findings calculated from available evidence, such as authentication results, routing and infrastructure relationships.",
  },
  {
    number: "03",
    title: "Inferred",
    text:
      "Analytical conclusions produced by combining multiple signals and associated with an appropriate confidence level.",
  },
  {
    number: "04",
    title: "Unknown",
    text:
      "Information that cannot be reliably established from available evidence remains explicitly unknown.",
  },
];

const intelligence = [
  {
    icon: FaShieldAlt,
    label: "AUTHENTICATION",
    title: "Trust signals",
    text:
      "Authentication mechanisms provide important evidence about whether a message aligns with its claimed sending infrastructure.",
  },
  {
    icon: FaServer,
    label: "INFRASTRUCTURE",
    title: "Network context",
    text:
      "IP addresses, domains, ASN and related infrastructure provide technical context around the message.",
  },
  {
    icon: FaBrain,
    label: "ANALYSIS",
    title: "Explainable detection",
    text:
      "Machine learning contributes an analytical signal while keeping the important supporting evidence visible to the analyst.",
  },
];

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-[#071426] text-[#E7EEF7]" id='how-it-works'>

      <section
        className="
          relative overflow-hidden
          border-b border-[#193552]
          bg-[#071426]
        "
      >

        {/* subtle grid */}

        <div
          className="
            pointer-events-none absolute inset-0
            opacity-30
          "
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
            px-6 py-24
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
                  text-[11px]
                  tracking-[0.22em]
                  text-[#22D3EE]
                "
              >
                MAILTRACE // HOW IT WORKS
              </p>


              <h1
                className="
                  max-w-[850px]
                  text-5xl
                  font-semibold
                  leading-[0.95]
                  tracking-[-0.04em]
                  text-[#EDF4FC]
                  sm:text-6xl
                  lg:text-8xl
                "
              >
                From raw email,
                <br />

                <span className="text-[#22D3EE]">
                  to one investigation.
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
                MAILTRACE transforms a suspicious email into structured,
                explainable and reproducible intelligence through a
                continuous evidence-first investigation workflow.
              </p>


              {/* META */}

              <div className="mt-12 flex flex-wrap">

                <MetaItem
                  label="INPUT"
                  value="Raw Email"
                />

                <MetaItem
                  label="PROCESS"
                  value="6 Investigation Stages"
                />

                <MetaItem
                  label="OUTPUT"
                  value="Evidence + Report"
                />

              </div>

            </div>


            {/* RIGHT TERMINAL */}

            <div
              className="
                border border-[#24496B]
                bg-[#0A1A2E]
                shadow-[0_20px_70px_rgba(0,0,0,0.25)]
              "
            >

              <div
                className="
                  flex items-center
                  border-b border-[#24496B]
                  px-6 py-4
                "
              >

                <div className="flex gap-2">

                  <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />

                </div>

                <span
                  className="
                    ml-4
                    font-mono
                    text-[10px]
                    tracking-[0.16em]
                    text-[#6687A8]
                  "
                >
                  INVESTIGATION_PIPELINE
                </span>

              </div>


              <div className="p-7">

                {[
                  ["01", "EMAIL INGESTION"],
                  ["02", "FORENSIC EXTRACTION"],
                  ["03", "THREAT INTELLIGENCE"],
                  ["04", "AI + RULE ANALYSIS"],
                  ["05", "EVIDENCE CORRELATION"],
                  ["06", "INVESTIGATION REPORT"],
                ].map(([number, text], index) => (

                  <React.Fragment key={number}>

                    <div className="flex items-center gap-4 border-b border-[#193552] py-4">

                      <span className="font-mono text-[10px] text-[#22D3EE]">
                        {number}
                      </span>

                      <span className="font-mono text-xs text-[#A7BED7]">
                        {text}
                      </span>

                      <FaCheck
                        className="ml-auto text-[#10B981]"
                        size={10}
                      />

                    </div>

                    {index < 5 && (
                      <div className="pl-1 font-mono text-[10px] text-[#345879]">
                        ↓
                      </div>
                    )}

                  </React.Fragment>

                ))}


                <div
                  className="
                    mt-7
                    border-t border-[#24496B]
                    pt-6
                    font-mono
                    text-[9px]
                    tracking-[0.1em]
                    text-[#22D3EE]
                  "
                >
                  RAW EMAIL&nbsp;&nbsp;→&nbsp;&nbsp; EVIDENCE&nbsp;&nbsp;
                  →&nbsp;&nbsp; INTELLIGENCE&nbsp;&nbsp; →&nbsp;&nbsp; REPORT
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 01
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="01"
            label="THE INVESTIGATION"
            title={
              <>
                One suspicious email.
                <br />
                <span>Multiple layers of evidence.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">

            <div className="max-w-[720px] space-y-7">

              <p className="text-lg leading-8 text-[#8FAECC]">
                A suspicious email can contain much more information
                than its visible message. Headers reveal routing
                history, authentication records provide trust signals,
                and infrastructure indicators expose the technical
                systems connected to the message.
              </p>

              <p className="text-lg leading-8 text-[#8FAECC]">
                MAILTRACE brings these layers together so analysts can
                move from the original message to a structured
                investigation without losing the connection to the
                underlying evidence.
              </p>

            </div>


            <div
              className="
                border border-[#24496B]
                bg-[#0A1A2E]
                p-8
              "
            >

              <p
                className="
                  font-mono
                  text-[10px]
                  tracking-[0.18em]
                  text-[#22D3EE]
                "
              >
                CORE PRINCIPLE
              </p>

              <h3
                className="
                  mt-5
                  text-2xl
                  font-medium
                  leading-tight
                  text-[#EDF4FC]
                "
              >
                Don't just classify the email.
                <br />
                Understand the evidence behind it.
              </h3>

              <p className="mt-5 text-sm leading-7 text-[#7897B7]">
                Every investigation progressively adds context while
                maintaining a clear boundary between what was
                observed, what was derived and what was inferred.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 02 — WORKFLOW
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="02"
            label="HOW MAILTRACE WORKS"
            title={
              <>
                Six stages from message
                <br />
                <span>to investigation.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-px bg-[#193552] md:grid-cols-2 lg:grid-cols-3">

            {workflow.map((step) => {

              const Icon = step.icon;

              return (
                <article
                  key={step.id}
                  className="
                    group
                    relative
                    min-h-[420px]
                    bg-[#071426]
                    p-8
                    transition
                    duration-300
                    hover:bg-[#0A1A2E]
                  "
                >

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
                      {step.id}
                    </span>


                    <Icon
                      className="
                        text-[#2C506F]
                        transition
                        group-hover:text-[#22D3EE]
                      "
                      size={22}
                    />

                  </div>


                  <p
                    className="
                      mt-12
                      font-mono
                      text-[9px]
                      tracking-[0.2em]
                      text-[#22D3EE]
                    "
                  >
                    {step.label}
                  </p>


                  <h3
                    className="
                      mt-4
                      text-2xl
                      font-medium
                      leading-tight
                      text-[#E7EEF7]
                    "
                  >
                    {step.title}
                  </h3>


                  <p
                    className="
                      mt-5
                      text-sm
                      leading-7
                      text-[#7897B7]
                    "
                  >
                    {step.description}
                  </p>


                  <div className="mt-7 space-y-3">

                    {step.items.map((item) => (

                      <div
                        key={item}
                        className="
                          flex items-center gap-3
                          font-mono
                          text-[10px]
                          text-[#8FAECC]
                        "
                      >

                        <span className="text-[#22D3EE]">
                          +
                        </span>

                        {item}

                      </div>

                    ))}

                  </div>


                  <div
                    className="
                      absolute
                      bottom-7
                      right-7
                      text-[#294966]
                      transition
                      group-hover:text-[#22D3EE]
                    "
                  >
                    <FaArrowRight size={14} />
                  </div>

                </article>
              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 03 — FORENSIC PIPELINE
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="03"
            label="INSIDE THE PIPELINE"
            title={
              <>
                What happens after
                <br />
                <span>submission?</span>
              </>
            }
          />


          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <PipelineCard
              icon={FaEnvelope}
              number="01"
              label="MESSAGE"
              value="Original Email"
            />

            <PipelineCard
              icon={FaFingerprint}
              number="02"
              label="HEADERS"
              value="Routing + Metadata"
            />

            <PipelineCard
              icon={FaShieldAlt}
              number="03"
              label="AUTHENTICATION"
              value="SPF / DKIM / DMARC"
            />

            <PipelineCard
              icon={FaNetworkWired}
              number="04"
              label="INDICATORS"
              value="IP / Domain / URL"
            />

            <PipelineCard
              icon={FaGlobe}
              number="05"
              label="INTELLIGENCE"
              value="DNS / RDAP / ASN / GeoIP"
            />

            <PipelineCard
              icon={FaBrain}
              number="06"
              label="DETECTION"
              value="Rules + Explainable ML"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 04 — EVIDENCE MODEL
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="04"
            label="EVIDENCE MODEL"
            title={
              <>
                Every finding has
                <br />
                <span>an evidence boundary.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-px bg-[#193552] sm:grid-cols-2 lg:grid-cols-4">

            {evidence.map((item) => (

              <article
                key={item.number}
                className="
                  bg-[#071426]
                  p-7
                  transition
                  hover:bg-[#0A1A2E]
                "
              >

                <div className="font-mono text-3xl text-[#22D3EE]">
                  {item.number}
                </div>

                <h3 className="mt-10 text-xl font-medium">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#7897B7]">
                  {item.text}
                </p>

                <div className="mt-8 h-px bg-[#193552]" />

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 05 — INTELLIGENCE
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="05"
            label="DETECTION INTELLIGENCE"
            title={
              <>
                AI assists the analyst.
                <br />
                <span>Evidence supports the decision.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-6 lg:grid-cols-3">

            {intelligence.map((item) => {

              const Icon = item.icon;

              return (

                <article
                  key={item.label}
                  className="
                    border border-[#24496B]
                    bg-[#0A1A2E]
                    p-8
                    transition
                    hover:border-[#22D3EE]
                  "
                >

                  <Icon
                    className="text-[#22D3EE]"
                    size={22}
                  />

                  <p
                    className="
                      mt-8
                      font-mono
                      text-[9px]
                      tracking-[0.18em]
                      text-[#6E8EAF]
                    "
                  >
                    {item.label}
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-[#7897B7]">
                    {item.text}
                  </p>

                </article>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECTION 06 — CORRELATION
      ===================================================== */}

      <section className="border-b border-[#193552]">

        <div className="mx-auto max-w-[1400px] px-6 py-28 lg:px-12">

          <SectionHeading
            number="06"
            label="EVIDENCE CORRELATION"
            title={
              <>
                Connect individual indicators
                <br />
                <span>into infrastructure intelligence.</span>
              </>
            }
          />


          <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:items-center">

            <div className="max-w-[650px]">

              <p className="text-lg leading-8 text-[#8FAECC]">
                A suspicious email rarely exists in isolation. Its
                domains, IP addresses, hosting infrastructure and
                related indicators can reveal relationships with
                previous investigations.
              </p>

              <p className="mt-7 text-lg leading-8 text-[#8FAECC]">
                MAILTRACE represents these relationships as connected
                evidence, helping analysts investigate infrastructure
                without making unsupported claims about an individual
                attacker.
              </p>


              <div className="mt-10 space-y-4">

                {[
                  "Email → Domain",
                  "Domain → IP",
                  "IP → ASN",
                  "Indicator → Case",
                ].map((item, index) => (

                  <div
                    key={item}
                    className="
                      flex items-center
                      border-b border-[#193552]
                      pb-4
                      font-mono
                      text-xs
                      text-[#8FAECC]
                    "
                  >

                    <span className="mr-5 text-[#22D3EE]">
                      0{index + 1}
                    </span>

                    {item}

                  </div>

                ))}

              </div>

            </div>


            {/* GRAPH */}

            <div
              className="
                relative
                h-[420px]
                overflow-hidden
                border border-[#24496B]
                bg-[#0A1A2E]
              "
            >

              <div
                className="
                  absolute inset-0 opacity-30
                "
                style={{
                  backgroundImage:
                    "linear-gradient(#173654 1px, transparent 1px), linear-gradient(90deg, #173654 1px, transparent 1px)",
                  backgroundSize: "35px 35px",
                }}
              />


              {/* lines */}

              <div className="absolute left-[30%] top-[35%] h-px w-[40%] rotate-[18deg] bg-[#2B5B7D]" />

              <div className="absolute left-[38%] top-[52%] h-px w-[35%] -rotate-[20deg] bg-[#2B5B7D]" />

              <div className="absolute left-[42%] top-[60%] h-px w-[30%] rotate-[35deg] bg-[#2B5B7D]" />


              <GraphNode
                className="left-[15%] top-[25%]"
                label="EMAIL"
              />

              <GraphNode
                className="left-[50%] top-[38%]"
                label="DOMAIN"
              />

              <GraphNode
                className="left-[72%] top-[25%]"
                label="IP"
              />

              <GraphNode
                className="left-[60%] top-[65%]"
                label="ASN"
              />

              <GraphNode
                className="left-[25%] top-[70%]"
                label="CASE"
              />

              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  font-mono
                  text-[9px]
                  tracking-widest
                  text-[#527592]
                "
              >
                INFRASTRUCTURE RELATIONSHIP GRAPH
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL SECTION
      ===================================================== */}

      <section className="bg-[#06111F]">

        <div className="mx-auto max-w-[1400px] px-6 py-32 lg:px-12">

          <p
            className="
              font-mono
              text-[10px]
              tracking-[0.2em]
              text-[#22D3EE]
            "
          >
            07 / THE RESULT
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
            A suspicious email becomes
            <br />

            <span className="text-[#22D3EE]">
              a structured investigation.
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
            Instead of ending with a simple phishing or benign label,
            MAILTRACE produces an investigation that preserves
            evidence, explains findings and records what remains
            uncertain.
          </p>


          {/* FINAL FLOW */}

          <div
            className="
              mt-16
              grid
              border-y border-[#193552]
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >

            <ResultItem
              number="01"
              label="INPUT"
              value="RAW EMAIL"
            />

            <ResultItem
              number="02"
              label="ANALYSIS"
              value="EVIDENCE"
            />

            <ResultItem
              number="03"
              label="CONTEXT"
              value="INTELLIGENCE"
            />

            <ResultItem
              number="04"
              label="OUTPUT"
              value="REPORT"
            />

          </div>


          {/* UNKNOWN */}

          <div
            className="
              mt-12
              max-w-[850px]
              border border-[#24496B]
              bg-[#0A1A2E]
              p-7
            "
          >

            <div className="flex items-center gap-3">

              <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />

              <span
                className="
                  font-mono
                  text-[10px]
                  tracking-[0.18em]
                  text-[#F59E0B]
                "
              >
                EVIDENCE BOUNDARY
              </span>

            </div>

            <p className="mt-5 text-sm leading-7 text-[#7897B7]">
              If the available evidence cannot establish something
              reliably, MAILTRACE keeps it explicitly unknown instead
              of presenting speculation as fact.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <section
        className="
          border-t border-[#193552]
          bg-[#071426]
        "
      >

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
              Investigate the evidence.
              <br />
              Understand the threat.
            </h2>

          </div>


          <button
            className="
              flex
              w-fit
              items-center
              gap-3
              border border-[#22D3EE]
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
            START INVESTIGATION

            <FaArrowRight size={11} />

          </button>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   COMPONENTS
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
          max-w-[950px]
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
        border-l border-[#24496B]
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


function PipelineCard({
  icon: Icon,
  number,
  label,
  value,
}) {

  return (

    <div
      className="
        border border-[#24496B]
        bg-[#0A1A2E]
        p-7
        transition
        hover:border-[#22D3EE]
      "
    >

      <div className="flex items-center justify-between">

        <span className="font-mono text-2xl text-[#173654]">
          {number}
        </span>

        <Icon
          className="text-[#22D3EE]"
          size={17}
        />

      </div>

      <p
        className="
          mt-9
          font-mono
          text-[9px]
          tracking-[0.18em]
          text-[#6687A8]
        "
      >
        {label}
      </p>

      <h3 className="mt-3 text-lg font-medium text-[#DDE8F4]">
        {value}
      </h3>

    </div>

  );
}


function GraphNode({
  className,
  label,
}) {

  return (

    <div
      className={`
        absolute
        ${className}
        flex
        h-16
        w-16
        items-center
        justify-center
        border
        border-[#22D3EE]
        bg-[#071426]
        font-mono
        text-[8px]
        tracking-wider
        text-[#22D3EE]
        shadow-[0_0_25px_rgba(34,211,238,0.08)]
      `}
    >
      {label}
    </div>

  );
}


function ResultItem({
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