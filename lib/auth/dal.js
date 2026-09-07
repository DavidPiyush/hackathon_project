import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { getPublicUser } from "@/lib/auth/users";

/**
 * Data access layer.
 *
 * The authoritative auth check. `proxy.js` does an optimistic cookie check to
 * keep unauthenticated users off protected URLs cheaply, but the Next docs are
 * explicit that it must not be the only line of defence: it runs on prefetches,
 * and a layout check does not stop nested segments from rendering.
 *
 * So every protected page calls `requireUser()` here instead. `cache()`
 * memoises the result for one render pass, so a page and the components inside
 * it can each ask who the user is without repeating the work.
 */

/** Verified session, or null. Does not redirect — for optional-auth UI. */
export const getCurrentSession = cache(async () => getSession());

/**
 * The signed-in user, or null.
 *
 * Reads the id from the session, then loads the record — so a session for a
 * user that no longer exists resolves to null rather than a ghost identity.
 */
export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();

  if (!session?.userId) {
    return null;
  }

  return getPublicUser(session.userId);
});

/**
 * Require a signed-in user, redirecting to login otherwise.
 *
 * `next` carries the path the user was trying to reach so login can send them
 * back to it. Note that `redirect()` throws, so nothing after this returns.
 */
export const requireUser = cache(async (returnTo) => {
  const user = await getCurrentUser();

  if (!user) {
    const target = returnTo
      ? `/login?next=${encodeURIComponent(returnTo)}`
      : "/login";

    redirect(target);
  }

  return user;
});

/** Require a specific role. Roles are coarse here; a real app would map perms. */
export const requireRole = cache(async (role, returnTo) => {
  const user = await requireUser(returnTo);

  if (user.role !== role) {
    redirect("/dashboard");
  }

  return user;
});
