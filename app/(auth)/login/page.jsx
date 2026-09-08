import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export const metadata = {
  title: "Sign in | ThreatDetect",
  description: "Sign in to the ThreatDetect security console.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  const next =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  return (
    <AuthShell
      eyebrow="Console access"
      title="Sign in to ThreatDetect"
      description="Access the security console to analyze emails, investigate threats, and manage forensic cases."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent transition-colors hover:text-accent-bright"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {/* Google OAuth */}
        <GoogleLoginButton next={next} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-canvas px-3 text-xs text-ink-faint">
              SECURE AUTHENTICATION
            </span>
          </div>
        </div>

        {/* Security information */}
        <div className="rounded-xl border border-line bg-raise p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-accent">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3l7 4v5c0 4.5-2.8 7.7-7 9-4.2-1.3-7-4.5-7-9V7l7-4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.5 12l1.7 1.7 3.5-3.5"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">
                Secure Google authentication
              </p>

              <p className="mt-1 text-xs leading-5 text-ink-muted">
                Your Google account is authenticated through the ThreatDetect
                backend. We do not handle your Google password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
