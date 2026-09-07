"use client";

import {
  FaHouse,
  FaEnvelope,
  FaMagnifyingGlass,
  FaFolderOpen,
  FaNetworkWired,
  FaGlobe,
  FaFileLines,
  FaGear,
  FaCircleQuestion,
  FaShieldHalved,
} from "react-icons/fa6";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: FaHouse,
  },
  {
    name: "Email Inbox",
    href: "/dashboard/inbox",
    icon: FaEnvelope,
  },
  {
    name: "Email Analysis",
    href: "/dashboard/analysis",
    icon: FaMagnifyingGlass,
  },
  {
    name: "Investigations",
    href: "/dashboard/investigations",
    icon: FaFolderOpen,
  },
  {
    name: "Threat Intelligence",
    href: "/dashboard/threat-intelligence",
    icon: FaNetworkWired,
  },
  {
    name: "GeoIP Intelligence",
    href: "/dashboard/geoip",
    icon: FaGlobe,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FaFileLines,
  },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-[60px] hidden h-[calc(100vh-120px)] w-64 shrink-0 border-r border-white/10 bg-[#050b14] lg:block">
      <div className="flex h-full flex-col p-4">
        {/* Navigation */}
        <div>
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-cyan-400/5 hover:text-cyan-400"
                >
                  <Icon className="w-4 text-gray-500 transition group-hover:text-cyan-400" />

                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaGear className="w-4" />
            Settings
          </a>

          <a
            href="/dashboard/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaCircleQuestion className="w-4" />
            Help & Documentation
          </a>

          {/* Security status */}
          <div className="mt-4 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3">
            <div className="flex items-center gap-2">
              <FaShieldHalved className="text-xs text-cyan-400" />

              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Secure Workspace
              </span>
            </div>

            <p className="mt-2 text-[10px] leading-5 text-gray-600">
              Evidence-first investigation environment
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
