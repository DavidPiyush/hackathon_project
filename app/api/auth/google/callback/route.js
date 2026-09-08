import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function GET(request) {
  try {
    console.log("[AUTH] Google callback reached.");

    /*
     * FastAPI has completed the Google OAuth exchange
     * and stored the Google credentials.
     *
     * Fetch the authenticated Google user's profile.
     */
    const response = await fetch(`${API_URL}/auth/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`FastAPI /auth/status returned ${response.status}`);
    }

    const data = await response.json();

    if (!data?.authenticated || !data?.user) {
      throw new Error(data?.error || "Google user could not be authenticated.");
    }

    const googleUser = data.user;

    if (!googleUser.id) {
      throw new Error("Google user ID is missing.");
    }

    console.log("[AUTH] Google user authenticated:", {
      id: googleUser.id,
      name: googleUser.name,
      email: googleUser.email,
    });

    /*
     * Create the ThreatDetect session using
     * the real Google account information.
     */
    await createSession({
      userId: googleUser.id,

      role: googleUser.role || "analyst",

      name: googleUser.name || googleUser.email || "ThreatDetect Analyst",

      email: googleUser.email || "",

      picture: googleUser.picture || null,
    });

    console.log("[AUTH] ThreatDetect session created.");

    /*
     * Authentication is complete.
     * Send the user to the protected dashboard.
     */
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("[AUTH] Session creation failed:", error);

    return NextResponse.redirect(
      new URL("/login?error=oauth_session_failed", request.url),
    );
  }
}
