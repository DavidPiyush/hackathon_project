"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);

    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(34,211,238,0.08)] disabled:cursor-wait disabled:opacity-70"
    >
      {/* Google Logo */}
      {!loading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.92v2.42h3.14c1.84-1.69 2.93-4.18 2.93-7.37Z"
          />

          <path
            fill="#34A853"
            d="M12 21.99c2.63 0 4.84-.87 6.45-2.35l-3.14-2.42c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.99Z"
          />

          <path
            fill="#FBBC05"
            d="M6.54 14.11a5.87 5.87 0 0 1 0-3.75v-2.5H3.3a9.99 9.99 0 0 0 0 8.75l3.24-2.5Z"
          />

          <path
            fill="#EA4335"
            d="M12 6.33c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.42 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.36l3.24 2.5 3.24 2.5C7.31 8.05 9.46 6.33 12 6.33Z"
          />
        </svg>
      ) : (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
      )}

      <span>
        {loading ? "Connecting to Google..." : "Continue with Google"}
      </span>

      {/* Hover effect */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/[0.06] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}
