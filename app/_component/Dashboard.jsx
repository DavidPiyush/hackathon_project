
import {
  FaShieldHalved,
  FaEnvelope,
  FaTriangleExclamation,
  FaCircleCheck,
  FaMagnifyingGlass,
  FaArrowRight,
  FaChartLine,
  FaClock,
  FaBug,
  FaLink,
  FaPaperclip,
  FaFingerprint,
  FaChevronRight,
} from "react-icons/fa6";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white">

      {/* =========================================
          DASHBOARD HEADER
      ========================================== */}

      <section className="border-b border-white/10 bg-[#07101c]">

        <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Title */}
            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                  <FaShieldHalved className="text-cyan-400" />
                </div>

                <div>
                  <h1 className="text-xl font-semibold">
                    Security Dashboard
                  </h1>

                  <p className="text-xs text-gray-500">
                    ThreatDetect • Email Security Console
                  </p>
                </div>

              </div>

            </div>

            {/* Status */}
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-xs text-emerald-400">
                  All Systems Operational
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          MAIN DASHBOARD
      ========================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">


        {/* =========================================
            QUICK ACTIONS
        ========================================== */}

        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#091522] p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-white">
              Analyze a suspicious email
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Upload an email file or provide email data for threat analysis.
            </p>

          </div>

          <button className="group flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#03101a] transition hover:bg-cyan-300">

            <FaMagnifyingGlass />

            New Analysis

            <FaArrowRight className="transition-transform group-hover:translate-x-1" />

          </button>

        </div>


        {/* =========================================
            STAT CARDS
        ========================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


          {/* Total Emails */}
          <div className="rounded-xl border border-white/10 bg-[#091522] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10">
                <FaEnvelope className="text-cyan-400" />
              </div>

              <span className="text-[11px] text-emerald-400">
                +12.5%
              </span>

            </div>

            <p className="mt-5 text-xs text-gray-500">
              Emails Analyzed
            </p>

            <p className="mt-1 text-2xl font-bold">
              1,284
            </p>

            <p className="mt-1 text-[11px] text-gray-600">
              Compared to last month
            </p>

          </div>


          {/* Threats */}
          <div className="rounded-xl border border-white/10 bg-[#091522] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/10">
                <FaTriangleExclamation className="text-red-400" />
              </div>

              <span className="text-[11px] text-red-400">
                +8.2%
              </span>

            </div>

            <p className="mt-5 text-xs text-gray-500">
              Threats Detected
            </p>

            <p className="mt-1 text-2xl font-bold">
              87
            </p>

            <p className="mt-1 text-[11px] text-gray-600">
              Potentially malicious emails
            </p>

          </div>


          {/* Safe */}
          <div className="rounded-xl border border-white/10 bg-[#091522] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
                <FaCircleCheck className="text-emerald-400" />
              </div>

              <span className="text-[11px] text-emerald-400">
                93.2%
              </span>

            </div>

            <p className="mt-5 text-xs text-gray-500">
              Safe Emails
            </p>

            <p className="mt-1 text-2xl font-bold">
              1,197
            </p>

            <p className="mt-1 text-[11px] text-gray-600">
              No significant threats found
            </p>

          </div>


          {/* Investigations */}
          <div className="rounded-xl border border-white/10 bg-[#091522] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-400/10">
                <FaFingerprint className="text-purple-400" />
              </div>

              <span className="text-[11px] text-yellow-400">
                5 Active
              </span>

            </div>

            <p className="mt-5 text-xs text-gray-500">
              Investigations
            </p>

            <p className="mt-1 text-2xl font-bold">
              23
            </p>

            <p className="mt-1 text-[11px] text-gray-600">
              Security investigations
            </p>

          </div>

        </div>


        {/* =========================================
            MAIN GRID
        ========================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">


          {/* =========================================
              THREAT OVERVIEW
          ========================================== */}

          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#091522] p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold">
                  Threat Overview
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Email threat activity over the last 7 days
                </p>

              </div>

              <FaChartLine className="text-cyan-400" />

            </div>


            {/* Fake Chart */}
            <div className="mt-8">

              <div className="flex h-56 items-end gap-3 sm:gap-6">

                {[45, 65, 40, 75, 55, 90, 68].map((height, index) => (

                  <div
                    key={index}
                    className="flex h-full flex-1 flex-col justify-end"
                  >

                    <div className="relative flex h-full items-end">

                      <div
                        className="w-full rounded-t-md bg-cyan-400/70 transition hover:bg-cyan-400"
                        style={{ height: `${height}%` }}
                      />

                    </div>

                    <p className="mt-3 text-center text-[10px] text-gray-600">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                    </p>

                  </div>

                ))}

              </div>

            </div>


            {/* Legend */}
            <div className="mt-6 flex gap-5 text-[11px] text-gray-500">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Threat Activity
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                High Risk
              </div>

            </div>

          </div>


          {/* =========================================
              THREAT DISTRIBUTION
          ========================================== */}

          <div className="rounded-xl border border-white/10 bg-[#091522] p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold">
                  Threat Distribution
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Detected threat categories
                </p>

              </div>

              <FaBug className="text-cyan-400" />

            </div>


            <div className="mt-7 space-y-5">


              {/* Phishing */}
              <div>

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-gray-400">
                    Phishing
                  </span>

                  <span className="text-white">
                    42%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: "42%" }}
                  />

                </div>

              </div>


              {/* Spam */}
              <div>

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-gray-400">
                    Spam
                  </span>

                  <span className="text-white">
                    28%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: "28%" }}
                  />

                </div>

              </div>


              {/* Malware */}
              <div>

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-gray-400">
                    Malware
                  </span>

                  <span className="text-white">
                    18%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-purple-400"
                    style={{ width: "18%" }}
                  />

                </div>

              </div>


              {/* Suspicious */}
              <div>

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-gray-400">
                    Suspicious
                  </span>

                  <span className="text-white">
                    12%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: "12%" }}
                  />

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =========================================
            RECENT ANALYSIS + SYSTEM STATUS
        ========================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">


          {/* =========================================
              RECENT EMAIL ANALYSIS
          ========================================== */}

          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#091522]">

            <div className="flex items-center justify-between border-b border-white/10 p-5">

              <div>

                <p className="text-sm font-semibold">
                  Recent Email Analysis
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Latest security analysis results
                </p>

              </div>

              <button className="text-xs text-cyan-400 transition hover:text-cyan-300">
                View All
              </button>

            </div>


            <div className="divide-y divide-white/5">


              {/* Email 1 */}
              <div className="flex items-center gap-4 p-5 transition hover:bg-white/[0.02]">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
                  <FaTriangleExclamation className="text-red-400" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    Urgent account verification required
                  </p>

                  <p className="mt-1 truncate text-[11px] text-gray-500">
                    security-alert@unknown-domain.com
                  </p>

                </div>

                <div className="hidden text-right sm:block">

                  <span className="rounded-full bg-red-400/10 px-3 py-1 text-[10px] text-red-400">
                    HIGH RISK
                  </span>

                  <p className="mt-2 text-[10px] text-gray-600">
                    12 min ago
                  </p>

                </div>

                <FaChevronRight className="text-xs text-gray-600" />

              </div>


              {/* Email 2 */}
              <div className="flex items-center gap-4 p-5 transition hover:bg-white/[0.02]">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10">
                  <FaTriangleExclamation className="text-yellow-400" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    Your invoice is ready
                  </p>

                  <p className="mt-1 truncate text-[11px] text-gray-500">
                    billing@company-example.com
                  </p>

                </div>

                <div className="hidden text-right sm:block">

                  <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[10px] text-yellow-400">
                    REVIEW
                  </span>

                  <p className="mt-2 text-[10px] text-gray-600">
                    34 min ago
                  </p>

                </div>

                <FaChevronRight className="text-xs text-gray-600" />

              </div>


              {/* Email 3 */}
              <div className="flex items-center gap-4 p-5 transition hover:bg-white/[0.02]">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                  <FaCircleCheck className="text-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    Weekly security report
                  </p>

                  <p className="mt-1 truncate text-[11px] text-gray-500">
                    reports@trusted-company.com
                  </p>

                </div>

                <div className="hidden text-right sm:block">

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                    SAFE
                  </span>

                  <p className="mt-2 text-[10px] text-gray-600">
                    1 hr ago
                  </p>

                </div>

                <FaChevronRight className="text-xs text-gray-600" />

              </div>


              {/* Email 4 */}
              <div className="flex items-center gap-4 p-5 transition hover:bg-white/[0.02]">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-400/10">
                  <FaTriangleExclamation className="text-red-400" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium">
                    Password reset notification
                  </p>

                  <p className="mt-1 truncate text-[11px] text-gray-500">
                    support@secure-login-alert.net
                  </p>

                </div>

                <div className="hidden text-right sm:block">

                  <span className="rounded-full bg-red-400/10 px-3 py-1 text-[10px] text-red-400">
                    HIGH RISK
                  </span>

                  <p className="mt-2 text-[10px] text-gray-600">
                    2 hrs ago
                  </p>

                </div>

                <FaChevronRight className="text-xs text-gray-600" />

              </div>

            </div>

          </div>


          {/* =========================================
              SYSTEM STATUS
          ========================================== */}

          <div className="rounded-xl border border-white/10 bg-[#091522] p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold">
                  Security Services
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Current platform status
                </p>

              </div>

              <span className="flex items-center gap-2 text-[11px] text-emerald-400">

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                Operational

              </span>

            </div>


            <div className="mt-7 space-y-4">


              {/* Service */}
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">

                <div className="flex items-center gap-3">

                  <FaShieldHalved className="text-cyan-400" />

                  <div>

                    <p className="text-xs font-medium">
                      Threat Detection
                    </p>

                    <p className="text-[10px] text-gray-600">
                      Detection engine
                    </p>

                  </div>

                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

              </div>


              {/* Service */}
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">

                <div className="flex items-center gap-3">

                  <FaLink className="text-cyan-400" />

                  <div>

                    <p className="text-xs font-medium">
                      URL Intelligence
                    </p>

                    <p className="text-[10px] text-gray-600">
                      Link reputation
                    </p>

                  </div>

                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

              </div>


              {/* Service */}
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">

                <div className="flex items-center gap-3">

                  <FaPaperclip className="text-cyan-400" />

                  <div>

                    <p className="text-xs font-medium">
                      Attachment Scanner
                    </p>

                    <p className="text-[10px] text-gray-600">
                      Malware analysis
                    </p>

                  </div>

                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

              </div>


              {/* Service */}
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">

                <div className="flex items-center gap-3">

                  <FaFingerprint className="text-cyan-400" />

                  <div>

                    <p className="text-xs font-medium">
                      Threat Intelligence
                    </p>

                    <p className="text-[10px] text-gray-600">
                      Indicator correlation
                    </p>

                  </div>

                </div>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />

              </div>

            </div>


            {/* Last Updated */}
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/5 pt-5 text-[10px] text-gray-600">

              <FaClock />

              Last updated just now

            </div>

          </div>

        </div>


        {/* =========================================
            SECURITY SUMMARY
        ========================================== */}

        <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">

                <FaShieldHalved className="text-xl text-cyan-400" />

              </div>

              <div>

                <p className="text-sm font-semibold">
                  Evidence-First Security Analysis
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  AI • DFIR • Threat Intelligence • Email Forensics
                </p>

              </div>

            </div>

            <button className="flex items-center gap-2 text-xs font-medium text-cyan-400 transition hover:text-cyan-300">

              View Investigation Reports

              <FaArrowRight />

            </button>

          </div>

        </div>

      </div>

    </main>
  );
}

