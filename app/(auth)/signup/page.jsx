import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

export const metadata = {
  title: "Create an account",
  description: "Create a ThreatDetect account to access the security console.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="You will land straight in the console. There is no email confirmation step, because this build has no mail backend."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
          >
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" />

      <AuthDivider />

      <SignupForm />
    </AuthShell>
  );
}
