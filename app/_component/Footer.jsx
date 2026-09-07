"use client";

import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaShieldHalved,
  FaLock,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050b14] text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                <FaShieldHalved className="text-cyan-400" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  ThreatDetect
                </h2>
                <p className="text-xs text-gray-500">
                  AI-Powered Email Security
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-gray-400">
              An AI-assisted email threat detection and forensic intelligence
              platform for analyzing suspicious emails, infrastructure,
              authentication signals, and threat indicators.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              System Operational
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Platform</h3>

            <ul className="space-y-3 text-sm">
              <li>
                <a href="#analysis" className="transition hover:text-cyan-400">
                  Email Analysis
                </a>
              </li>

              <li>
                <a href="#forensics" className="transition hover:text-cyan-400">
                  Email Forensics
                </a>
              </li>

              <li>
                <a
                  href="#intelligence"
                  className="transition hover:text-cyan-400"
                >
                  Threat Intelligence
                </a>
              </li>

              <li>
                <a href="#reports" className="transition hover:text-cyan-400">
                  Investigation Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Resources</h3>

            <ul className="space-y-3 text-sm">
              <li>
                <a href="/docs" className="transition hover:text-cyan-400">
                  Documentation
                </a>
              </li>

              <li>
                <a href="/api" className="transition hover:text-cyan-400">
                  API
                </a>
              </li>

              <li>
                <a href="/security" className="transition hover:text-cyan-400">
                  Security
                </a>
              </li>

              <li>
                <a href="/privacy" className="transition hover:text-cyan-400">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Security Info */}
        <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FaLock className="text-cyan-400" />

            <div>
              <p className="text-xs font-medium text-white">
                Evidence-First Analysis
              </p>
              <p className="text-[11px] text-gray-500">
                Built for security investigation workflows
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            AI • DFIR • Threat Intelligence
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ThreatDetect. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a
              href="https://github.com/DavidPiyush"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition hover:text-cyan-400"
            >
              <FaGithub className="text-lg" />
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="transition hover:text-cyan-400"
            >
              <FaLinkedin className="text-lg" />
            </a>

            {/* Email */}
            <a
              href="mailto:contact@example.com"
              aria-label="Email"
              className="transition hover:text-cyan-400"
            >
              <FaEnvelope className="text-lg" />
            </a>

            <a
              href="/docs"
              className="flex items-center gap-1 transition hover:text-cyan-400"
            >
              Docs
              <FaArrowUpRightFromSquare className="text-[10px]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
