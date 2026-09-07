"use client";

import React from "react";
import {
  FaCode,
  FaServer,
  FaDatabase,
  FaBrain,
  FaNetworkWired,
  FaMapMarkedAlt,
  FaShieldAlt,
  FaSearch,
  FaFingerprint,
  FaFileAlt,
  FaProjectDiagram,
  FaLock,
  FaArrowRight,
  FaCheckCircle,
  FaTerminal,
  FaBug,
  FaGlobe,
} from "react-icons/fa";

export default function About() {
  const technologies = [
    {
      icon: FaCode,
      title: "Frontend",
      value: "Next.js",
    },
    {
      icon: FaServer,
      title: "Backend",
      value: "FastAPI",
    },
    {
      icon: FaDatabase,
      title: "Storage",
      value: "MongoDB",
    },
    {
      icon: FaBrain,
      title: "Machine Learning",
      value: "scikit-learn",
    },
    {
      icon: FaNetworkWired,
      title: "Evidence Graph",
      value: "Cytoscape.js",
    },
    {
      icon: FaMapMarkedAlt,
      title: "Visualization",
      value: "Leaflet",
    },
  ];

  const capabilities = [
    {
      number: "01",
      icon: FaFingerprint,
      title: "Email Forensics",
      description:
        "Analyze raw email headers, authentication results, Received hops and trust boundaries to reconstruct the message path.",
    },
    {
      number: "02",
      icon: FaBrain,
      title: "AI Threat Detection",
      description:
        "Combine explainable machine learning with deterministic rules to identify phishing, spoofing and business email compromise.",
    },
    {
      number: "03",
      icon: FaNetworkWired,
      title: "Threat Intelligence",
      description:
        "Correlate domains, IPs, ASN, DNS, RDAP and infrastructure intelligence to provide deeper investigation context.",
    },
    {
      number: "04",
      icon: FaProjectDiagram,
      title: "Evidence Correlation",
      description:
        "Connect indicators, cases and campaigns through an evidence graph to reveal relationships across investigations.",
    },
  ];

  const team = [
    {
      id: "M1",
      role: "Team Lead / DFIR",
      title: "Digital Forensics",
      description:
        "Evidence schema, parser, header forensics, trust boundary, chain of custody and report content.",
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
        "DNS, RDAP, GeoIP, domain intelligence, graph correlation, campaign clustering and IOC registry.",
    },
    {
      id: "M4",
      role: "Backend",
      title: "Platform Engineering",
      description:
        "FastAPI, authentication, RBAC, MongoDB, orchestration, reports and audit chain.",
    },
    {
      id: "M5",
      role: "Frontend / DevOps",
      title: "Product Experience",
      description:
        "Next.js interface, dashboard, investigation screen, graph, map, reports and deployment.",
    },
  ];

  const principles = [
    "Evidence first",
    "Explainable analysis",
    "Infrastructure intelligence",
    "Defensible reporting",
  ];

  return (
    <main className="min-h-screen bg-[#0A1628] text-[#E6EEF7]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-[#22456E]">

        {/* subtle grid */}
        <div
          className="
            pointer-events-none absolute inset-0
            opacity-[0.08]
            [background-image:linear-gradient(#22456E_1px,transparent_1px),linear-gradient(90deg,#22456E_1px,transparent_1px)]
            [background-size:50px_50px]
          "
        />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">

          {/* LEFT */}

          <div>

            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              <span className="h-2 w-2 rounded-full bg-[#22D3EE]" />
              MAILTRACE // ABOUT THE PLATFORM
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">

              Email security,

              <br />

              <span className="text-[#22D3EE]">
                built for investigation.
              </span>

            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#8FA9C4] sm:text-lg">
              MAILTRACE is an evidence-first email threat investigation
              platform designed to turn a raw email into structured,
              explainable and reproducible intelligence.
            </p>


            {/* META */}

            <div className="mt-12 flex flex-wrap gap-8">

              <div className="border-l border-[#22456E] pl-4">
                <p className="font-mono text-[9px] uppercase text-[#8FA9C4]">
                  Project
                </p>

                <p className="mt-1 text-sm font-medium">
                  SIH26106
                </p>
              </div>


              <div className="border-l border-[#22456E] pl-4">
                <p className="font-mono text-[9px] uppercase text-[#8FA9C4]">
                  Domain
                </p>

                <p className="mt-1 text-sm font-medium">
                  Cybersecurity
                </p>
              </div>


              <div className="border-l border-[#22456E] pl-4">
                <p className="font-mono text-[9px] uppercase text-[#8FA9C4]">
                  Team
                </p>

                <p className="mt-1 text-sm font-medium">
                  05 Members
                </p>
              </div>

            </div>

          </div>


          {/* TERMINAL */}

          <div className="border border-[#22456E] bg-[#0F2138]">

            <div className="flex h-11 items-center gap-4 border-b border-[#22456E] px-4">

              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#22456E]" />
                <span className="h-2 w-2 rounded-full bg-[#22456E]" />
                <span className="h-2 w-2 rounded-full bg-[#22456E]" />
              </div>

              <span className="font-mono text-[10px] text-[#8FA9C4]">
                mailtrace://core
              </span>

            </div>


            <div className="p-7 font-mono text-xs">

              <div className="mb-6">
                <span className="mr-2 text-[#22D3EE]">$</span>
                initialize_investigation
              </div>


              {[
                "Evidence engine online",
                "Authentication analysis ready",
                "Threat intelligence ready",
                "Evidence graph ready",
                "Report engine ready",
              ].map((item) => (

                <div
                  key={item}
                  className="flex gap-3 border-b border-[#22456E]/60 py-3 text-[#8FA9C4]"
                >
                  <span className="text-[#10B981]">
                    ✓
                  </span>

                  {item}
                </div>

              ))}


              <div className="my-6 h-px bg-[#22456E]" />

              <div className="text-[9px] leading-7 text-[#22D3EE]">
                RAW EMAIL
                <span className="mx-2 text-[#8FA9C4]">→</span>
                EVIDENCE
                <span className="mx-2 text-[#8FA9C4]">→</span>
                INTELLIGENCE
                <span className="mx-2 text-[#8FA9C4]">→</span>
                REPORT
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          WHY MAILTRACE
      ====================================================== */}

      <section className="border-b border-[#22456E]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">

          <div className="mb-14">

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              01 / WHY MAILTRACE
            </p>

            <h2 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              From scattered tools
              <br />
              <span className="text-[#22D3EE]">
                to one investigation.
              </span>
            </h2>

          </div>


          <div className="grid gap-10 lg:grid-cols-2">

            <div className="space-y-6 text-sm leading-8 text-[#8FA9C4] sm:text-base">

              <p>
                Investigating a suspicious email often requires analysts
                to move between multiple tools for headers,
                authentication, threat intelligence, infrastructure
                analysis and reporting.
              </p>

              <p>
                MAILTRACE brings these investigation steps together
                into one evidence-first workflow, allowing analysts
                to move from the original message to a defensible
                conclusion.
              </p>

              <p>
                Every important finding should be traceable back to
                evidence.
              </p>

            </div>


            <div className="border border-[#22456E] bg-[#0F2138]">

              <div className="border-b border-[#22456E] px-6 py-5">
                <p className="font-mono text-[10px] tracking-widest text-[#8FA9C4]">
                  CORE PRINCIPLES
                </p>
              </div>


              {principles.map((item, index) => (

                <div
                  key={item}
                  className="flex items-center gap-4 border-b border-[#22456E] px-6 py-5 last:border-0"
                >

                  <span className="font-mono text-xs text-[#22D3EE]">
                    0{index + 1}
                  </span>

                  <span className="text-sm">
                    {item}
                  </span>

                  <FaCheckCircle className="ml-auto text-[#10B981]" />

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CAPABILITIES
      ====================================================== */}

      <section className="border-b border-[#22456E]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">

          <div className="mb-14">

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              02 / WHAT WE BUILD
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One platform.
              <br />
              <span className="text-[#22D3EE]">
                Multiple investigation layers.
              </span>
            </h2>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {capabilities.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.number}
                  className="
                    group relative min-h-[330px]
                    border border-[#22456E]
                    bg-[#0F2138]
                    p-6
                    transition-all duration-200
                    hover:-translate-y-1
                    hover:border-[#22D3EE]
                  "
                >

                  <div className="flex items-center justify-between">

                    <span className="font-mono text-xs text-[#22D3EE]">
                      {item.number}
                    </span>

                    <Icon className="text-lg text-[#22D3EE]" />

                  </div>


                  <h3 className="mt-20 text-xl font-semibold">
                    {item.title}
                  </h3>


                  <p className="mt-4 text-sm leading-7 text-[#8FA9C4]">
                    {item.description}
                  </p>


                  <FaArrowRight
                    className="
                      absolute bottom-6 right-6
                      text-sm text-[#22D3EE]
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          WORKFLOW
      ====================================================== */}

      <section className="border-b border-[#22456E]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">

          <div className="mb-16">

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              03 / INVESTIGATION WORKFLOW
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Follow the evidence,
              <br />
              <span className="text-[#22D3EE]">
                not assumptions.
              </span>
            </h2>

          </div>


          <div className="grid gap-8 md:grid-cols-4">

            {[
              {
                icon: FaFileAlt,
                step: "01",
                title: "Ingest",
                text: "Upload the original .eml file and preserve its cryptographic identity.",
              },
              {
                icon: FaSearch,
                step: "02",
                title: "Analyze",
                text: "Extract headers, authentication, content, URLs and infrastructure evidence.",
              },
              {
                icon: FaNetworkWired,
                step: "03",
                title: "Correlate",
                text: "Connect indicators with previous cases and campaigns.",
              },
              {
                icon: FaFileAlt,
                step: "04",
                title: "Report",
                text: "Produce an explainable report containing evidence and limitations.",
              },
            ].map((item, index) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.step}
                  className="relative border border-[#22456E] bg-[#0F2138] p-6"
                >

                  <div className="flex h-12 w-12 items-center justify-center border border-[#22456E] text-[#22D3EE]">
                    <Icon />
                  </div>

                  <p className="mt-8 font-mono text-[10px] text-[#22D3EE]">
                    STEP {item.step}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#8FA9C4]">
                    {item.text}
                  </p>

                  {index !== 3 && (
                    <FaArrowRight className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-[#22D3EE] md:block" />
                  )}

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          TECHNOLOGY
      ====================================================== */}

      <section className="border-b border-[#22456E]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">

          <div className="mb-14">

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              04 / TECHNOLOGY
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Engineered for
              <br />
              <span className="text-[#22D3EE]">
                speed and explainability.
              </span>
            </h2>

          </div>


          <div className="grid border-l border-t border-[#22456E] sm:grid-cols-2 lg:grid-cols-3">

            {technologies.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="
                    group flex items-center gap-5
                    border-b border-r border-[#22456E]
                    bg-[#0F2138]
                    p-7
                    transition-colors
                    hover:bg-[#16304D]
                  "
                >

                  <Icon className="text-xl text-[#22D3EE]" />

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#8FA9C4]">
                      {item.title}
                    </p>

                    <p className="mt-1 font-mono text-sm">
                      {item.value}
                    </p>

                  </div>

                  <FaArrowRight className="ml-auto text-xs text-[#22456E] transition-colors group-hover:text-[#22D3EE]" />

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =====================================================
          TEAM
      ====================================================== */}

      <section className="border-b border-[#22456E]">

        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">

          <div className="mb-14">

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              05 / THE TEAM
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Five disciplines.
              <br />
              <span className="text-[#22D3EE]">
                One investigation workflow.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#8FA9C4]">
              A focused engineering team covering digital forensics,
              AI/ML, threat intelligence, backend engineering and
              frontend/DevOps.
            </p>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            {team.map((member) => (

              <div
                key={member.id}
                className="
                  group min-h-[320px]
                  border border-[#22456E]
                  bg-[#0F2138]
                  p-5
                  transition-all duration-200
                  hover:border-[#22D3EE]
                "
              >

                <div className="flex items-center justify-between">

                  <span className="font-mono text-xl font-bold text-[#22D3EE]">
                    {member.id}
                  </span>

                  <span className="font-mono text-[8px] text-[#10B981]">
                    ACTIVE
                  </span>

                </div>


                <p className="mt-10 font-mono text-[9px] uppercase tracking-wider text-[#8FA9C4]">
                  {member.role}
                </p>


                <h3 className="mt-3 text-lg font-semibold">
                  {member.title}
                </h3>


                <p className="mt-4 text-xs leading-6 text-[#8FA9C4]">
                  {member.description}
                </p>


                <div className="mt-8 h-px bg-[#22456E] transition-colors group-hover:bg-[#22D3EE]" />

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECURITY PRINCIPLE
      ====================================================== */}

      <section className="border-b border-[#22456E] bg-[#0F2138]">

        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-2 lg:px-8">

          <div>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              06 / OUR FORENSIC PRINCIPLE
            </p>

            <h2 className="mt-6 text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl">

              We investigate

              <br />

              infrastructure,

              <br />

              <span className="text-[#22D3EE]">
                not people.
              </span>

            </h2>

          </div>


          <div>

            <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#22456E] text-[#22D3EE]">
              <FaShieldAlt />
            </div>


            <p className="max-w-xl text-sm leading-8 text-[#8FA9C4] sm:text-base">
              MAILTRACE does not claim to identify an attacker or
              their physical location. It reports the earliest reliable
              observable infrastructure, its network context and the
              confidence behind that finding.
            </p>


            <div className="mt-8 border border-[#22456E] p-5">

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                UNKNOWN ≠ FAILURE
              </div>

              <p className="mt-3 pl-5 text-xs leading-6 text-[#8FA9C4]">
                When evidence is insufficient, the platform says so.
                Explicit uncertainty is better than unsupported attribution.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section>

        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 py-28 md:flex-row md:items-end lg:px-8">

          <div>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#22D3EE]">
              MAILTRACE
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">

              Turn suspicious email

              <br />

              into defensible evidence.

            </h2>

          </div>


          <button
            className="
              flex items-center gap-4
              border border-[#22D3EE]
              bg-transparent
              px-6 py-4
              font-mono text-[11px]
              text-[#22D3EE]
              transition-all
              hover:bg-[#22D3EE]
              hover:text-[#0A1628]
            "
          >
            START INVESTIGATION
            <FaArrowRight />
          </button>

        </div>

      </section>

    </main>
  );
}