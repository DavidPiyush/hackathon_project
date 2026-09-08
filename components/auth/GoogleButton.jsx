import { Icon } from "@/components/ui/Icon";
import { googleLoginUrl, isApiConfigured } from "@/lib/api/client";

/**
 * Google sign-in.
 *
 * The backend's only real authentication is Google OAuth (`GET /auth/google`),
 * so this is the production path. It is a plain anchor rather than a fetch:
 * OAuth redirects to Google and back to `/auth/google/callback`, which a
 * same-origin `fetch` cannot follow.
 *
 * When no backend is configured the control is disabled and says so, rather
 * than looking available and failing on click.
 */
export function GoogleButton({ label = "Continue with Google" }) {
  const href = googleLoginUrl();
  const available = isApiConfigured() && Boolean(href);

  const shared =
    "flex h-13 w-full items-center justify-center gap-3 rounded-xl border text-sm font-semibold transition duration-200";

  if (!available) {
    return (
      <div>
        <button
          type="button"
          disabled
          title="Set NEXT_PUBLIC_API_URL to the FastAPI origin to enable Google sign-in."
          className={`${shared} cursor-not-allowed border-line bg-raise text-ink-faint`}
        >
          <GoogleMark />
          {label}
        </button>

        <p className="mt-2 flex items-start gap-2 text-[11px] leading-5 text-ink-faint">
          <Icon name="info" className="mt-0.5 shrink-0" />
          Google sign-in needs the API backend. Set{" "}
          <code className="rounded border border-line bg-raise-md px-1 font-mono text-[10px]">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          to enable it.
        </p>
      </div>
    );
  }

  return (
    <a
      href={href}
      className={`${shared} border-line bg-surface text-ink hover:border-accent/35 hover:bg-raise-md active:scale-[0.99]`}
    >
      <GoogleMark />
      {label}
    </a>
  );
}

/** Google's mark, inlined so it needs no network request or icon library. */
function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default GoogleButton;
