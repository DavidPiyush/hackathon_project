import { NextResponse } from "next/server";

import { deleteSession } from "@/lib/auth/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  try {
    // Remove the Next.js authenticated session.
    await deleteSession();

    // Disconnect the Google authentication stored by FastAPI.
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch (error) {
      console.error("[AUTH] FastAPI logout failed:", error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[AUTH] Logout failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "LOGOUT_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
