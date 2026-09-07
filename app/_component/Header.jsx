/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import {
  FaShieldHalved,
  FaHouse,
  FaMagnifyingGlass,
  FaGlobe,
  FaNetworkWired,
  FaEnvelope,
  FaChartLine,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

import { useState } from "react";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050b14]/95 text-gray-400 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
       
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <FaShieldHalved className="text-lg text-cyan-400" />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-white">ThreatDetect</h1>

            <p className="hidden text-[10px] text-gray-500 sm:block">
              AI-Powered Email Security
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaHouse className="text-xs" />
            Home
          </a>

          <a
            href="/analysis"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaMagnifyingGlass className="text-xs" />
            Analysis
          </a>

          <a
            href="/geoip"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaGlobe className="text-xs" />
            GeoIP
          </a>

          <a
            href="/threat-intelligence"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaNetworkWired className="text-xs" />
            Threat Intel
          </a>

          <a
            href="/reports"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaChartLine className="text-xs" />
            Reports
          </a>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Status */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-gray-400">Operational</span>
          </div>

          {/* Contact */}
          <a
            href="mailto:contact@example.com"
            className="flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400 transition hover:bg-cyan-400/20"
          >
            <FaEnvelope className="text-xs" />
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:text-cyan-400 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenu && (
        <nav className="border-t border-white/10 bg-[#050b14] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            <a
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-white/5 hover:text-cyan-400"
            >
              <FaHouse />
              Home
            </a>

            <a
              href="/analysis"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-white/5 hover:text-cyan-400"
            >
              <FaMagnifyingGlass />
              Analysis
            </a>

            <a
              href="/geoip"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-white/5 hover:text-cyan-400"
            >
              <FaGlobe />
              GeoIP
            </a>

            <a
              href="/threat-intelligence"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-white/5 hover:text-cyan-400"
            >
              <FaNetworkWired />
              Threat Intelligence
            </a>

            <a
              href="/reports"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-white/5 hover:text-cyan-400"
            >
              <FaChartLine />
              Reports
            </a>

            <a
              href="mailto:contact@example.com"
              className="mt-2 flex items-center gap-3 rounded-lg bg-cyan-400/10 px-3 py-3 text-sm text-cyan-400"
            >
              <FaEnvelope />
              Contact
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
