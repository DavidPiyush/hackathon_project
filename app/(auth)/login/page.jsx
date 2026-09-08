import Link from "next/link";

import { SEEDED_ACCOUNTS } from "@/lib/auth/users";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

export const metadata = {
  title: "Sign in",
  description: "Sign in to the ThreatDetect security console.",
  // An auth screen has no business in search results.
  robots: { index: false, follow: false },
};

/**
 * Sign-in page.
 *
 * `searchParams` is a promise in Next 16 and must be awaited. `next` carries
 * the console path the user was trying to reach; the Server Action validates
 * it before redirecting, so it cannot be turned into an open redirect.
 */
export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : "";

  return (
    <AuthShell
      eyebrow="Console access"
      title="Sign in to ThreatDetect"
      description="Open the security console to triage messages, run header forensics and manage investigations."
      footer={
        <>
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
          >
            Create one
          </Link>
        </>
      }
    >
      {/*
        Google is the backend's real authentication path (GET /auth/google).
        The password form below it works against the local store, which is what
        makes the console openable with no backend running.
      */}
      <GoogleButton label="Sign in with Google" />

      <AuthDivider />

      {/*
        Only the display fields are passed through, not the whole record — the
        seeded objects also carry an id and role the form has no use for.
      */}
      <LoginForm
        next={next}
        accounts={SEEDED_ACCOUNTS.map(
          ({ email, password, label, description }) => ({
            email,
            password,
            label,
            description,
          }),
        )}
      />
    </AuthShell>
  );
}
