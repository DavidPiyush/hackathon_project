import { NextResponse } from "next/server";

import { decryptSession, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Proxy (Middleware was renamed to Proxy in Next.js 16).
 *
 * An *optimistic* auth gate. It reads and verifies the session cookie —
 * nothing else. No database lookups, because this runs on every request
 * including prefetches, and the Next docs are explicit that proxy must not be
 * a project's only authorization layer.
 *
 * The authoritative check lives in `lib/auth/dal.js` and runs inside each
 * protected page. This exists to keep signed-out users off console URLs
 * cheaply, and to bounce signed-in users away from the login and signup
 * screens.
 */

/** Console routes require a session. */
const PROTECTED_PREFIX = "/dashboard";

/** Auth screens are pointless once you are signed in. */
const AUTH_ROUTES = new Set(["/login", "/signup"]);

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);
  const signedIn = Boolean(session?.userId);

  if (pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`)) {
    if (!signedIn) {
      const url = request.nextUrl.clone();

      url.pathname = "/login";
      // Preserve where they were headed so login can return them to it.
      url.search = `?next=${encodeURIComponent(pathname + search)}`;

      const response = NextResponse.redirect(url);

      // An expired or forged cookie is cleared on the way out, so the browser
      // stops sending it on every subsequent request.
      if (token) {
        response.cookies.delete(SESSION_COOKIE);
      }

      return response;
    }

    return NextResponse.next();
  }

  if (AUTH_ROUTES.has(pathname) && signedIn) {
    const url = request.nextUrl.clone();

    url.pathname = "/dashboard";
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Skip static assets and Next internals. Everything else passes through, so
   * the signed-in redirect on /login works regardless of entry point.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};

export default proxy;
