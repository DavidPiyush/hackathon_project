"use client";

import { FaShieldHalved, FaBell, FaUser, FaChevronDown } from "react-icons/fa6";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#050b14]/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
            <FaShieldHalved className="text-cyan-400" />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-white">ThreatDetect</h1>

            <p className="text-[10px] text-gray-500">
              Security Intelligence Platform
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Environment */}
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-gray-400">Operational</span>
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-cyan-400">
            <FaBell />

            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-400" />
          </button>

          {/* User */}
          <button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10">
              <FaUser className="text-xs text-cyan-400" />
            </div>

            <span className="hidden text-xs text-gray-300 sm:block">
              Analyst
            </span>

            <FaChevronDown className="hidden text-[9px] text-gray-500 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
