"use client";

import {
  FaShieldHalved,
  FaArrowRight,
  FaCircleCheck,
  FaTriangleExclamation,
  FaEnvelope,
  FaLock,
} from "react-icons/fa6";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050b14] text-white">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-250px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-150px] top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* ================= LEFT CONTENT ================= */}

          <div>

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs font-medium text-cyan-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              AI-POWERED EMAIL SECURITY
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">

              Detect.
              <span className="block text-cyan-400">
                Investigate.
              </span>
              <span className="block">
                Defend.
              </span>

            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
              ThreatDetect is an AI-assisted email threat detection and
              forensic intelligence platform designed to analyze suspicious
              emails, identify malicious indicators, and help security teams
              investigate threats faster.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <a
                href="#analysis"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-[#03101a] transition hover:bg-cyan-300"
              >
                Analyze an Email

                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#forensics"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
              >
                Explore Platform
              </a>

            </div>

            {/* Trust Indicators */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-500">

              <div className="flex items-center gap-2">
                <FaCircleCheck className="text-emerald-400" />
                Evidence-first analysis
              </div>

              <div className="flex items-center gap-2">
                <FaCircleCheck className="text-emerald-400" />
                Threat intelligence
              </div>

              <div className="flex items-center gap-2">
                <FaCircleCheck className="text-emerald-400" />
                DFIR workflows
              </div>

            </div>

          </div>


          {/* ================= RIGHT SECURITY PANEL ================= */}

          <div className="relative">

            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-3xl bg-cyan-400/10 blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 bg-[#091522]/90 p-5 shadow-2xl backdrop-blur-xl">

              {/* Window Header */}
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                    <FaShieldHalved className="text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Threat Analysis
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Email Security Engine
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active
                </div>

              </div>


              {/* Email */}
              <div className="rounded-xl border border-white/10 bg-[#050b14] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
                    <FaEnvelope className="text-gray-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Incoming Email
                    </p>

                    <p className="truncate text-sm font-medium text-white">
                      suspicious-message@email.com
                    </p>
                  </div>

                </div>

              </div>


              {/* Analysis */}
              <div className="mt-4 space-y-3">

                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">

                  <div className="flex items-center gap-3">

                    <FaTriangleExclamation className="text-yellow-400" />

                    <div>
                      <p className="text-xs font-medium text-white">
                        Threat Detection
                      </p>

                      <p className="text-[10px] text-gray-500">
                        Suspicious indicators detected
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] text-yellow-400">
                    REVIEW
                  </span>

                </div>


                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">

                  <div className="flex items-center gap-3">

                    <FaLock className="text-cyan-400" />

                    <div>
                      <p className="text-xs font-medium text-white">
                        Authentication
                      </p>

                      <p className="text-[10px] text-gray-500">
                        SPF / DKIM / DMARC analysis
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                    CHECKED
                  </span>

                </div>


                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">

                  <div className="flex items-center gap-3">

                    <FaShieldHalved className="text-emerald-400" />

                    <div>
                      <p className="text-xs font-medium text-white">
                        Threat Intelligence
                      </p>

                      <p className="text-[10px] text-gray-500">
                        Indicators correlated
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">
                    ANALYZED
                  </span>

                </div>

              </div>


              {/* Risk Score */}
              <div className="mt-5 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs text-gray-500">
                      Overall Risk Score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-white">
                      72<span className="text-sm text-gray-500">/100</span>
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-xs font-medium text-yellow-400">
                      HIGH RISK
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      Investigation recommended
                    </p>

                  </div>

                </div>

                {/* Progress */}
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: "72%" }}
                  />

                </div>

              </div>

            </div>


            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-white/10 bg-[#091522] p-4 shadow-xl sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
                  <FaShieldHalved className="text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs font-medium text-white">
                    System Operational
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Security engine online
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
