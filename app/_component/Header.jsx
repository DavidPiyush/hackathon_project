"use client";

import { useState } from "react";
import {
  FaShieldHalved,
  FaHouse,
  FaPuzzlePiece,
  FaCircleInfo,
  FaEnvelope,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050b14]/95 text-gray-400 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#home"
          onClick={closeMobileMenu}
          className="flex items-center gap-3"
        >
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
          {/* Home */}
          <a
            href="#home"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaHouse className="text-xs" />
            Home
          </a>

          {/* Features */}
          <a
            href="#features"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaPuzzlePiece className="text-xs" />
            Features
          </a>

          {/* How It Works */}
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaShieldHalved className="text-xs" />
            How It Works
          </a>

          {/* About */}
          <a
            href="#about"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaCircleInfo className="text-xs" />
            About
          </a>

          {/* Contact */}
          <a
            href="#contact"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 hover:text-cyan-400"
          >
            <FaEnvelope className="text-xs" />
            Contact
          </a>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Status */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-gray-400">Operational</span>
          </div>

          {/* Get Started */}
          <a
            href="#contact"
            className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400 transition hover:bg-cyan-400/20"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:text-cyan-400 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <FaXmark /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenu && (
        <nav className="border-t border-white/10 bg-[#050b14] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {/* Home */}
            <a
              href="#home"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-white/5 hover:text-cyan-400"
            >
              <FaHouse />
              Home
            </a>

            {/* Features */}
            <a
              href="#features"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-white/5 hover:text-cyan-400"
            >
              <FaPuzzlePiece />
              Features
            </a>

            {/* How It Works */}
            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-white/5 hover:text-cyan-400"
            >
              <FaShieldHalved />
              How It Works
            </a>

            {/* About */}
            <a
              href="#about"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-white/5 hover:text-cyan-400"
            >
              <FaCircleInfo />
              About
            </a>

            {/* Contact */}
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition hover:bg-white/5 hover:text-cyan-400"
            >
              <FaEnvelope />
              Contact Us
            </a>

            {/* Get Started */}
            <a
              href="#contact"
              onClick={closeMobileMenu}
              className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-center text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/20"
            >
              Get Started
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
