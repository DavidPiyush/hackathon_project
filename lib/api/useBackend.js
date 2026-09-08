"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, isApiConfigured } from "@/lib/api/client";

/**
 * Hooks for talking to the FastAPI backend.
 *
 * Every call goes through one of these so the four states a network request
 * actually has — not configured, loading, error, data — are handled the same
 * way everywhere, instead of each component inventing its own spinner and
 * swallowing its own errors.
 */

const IDLE = { status: "idle", data: null, error: null };

/**
 * Run an API call on demand.
 *
 * Returns a `run` function plus the request state. Nothing fires until `run`
 * is called, which is what a button-triggered request wants.
 */
export function useApiAction(call) {
  const [state, setState] = useState(IDLE);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const run = useCallback(
    async (...args) => {
      if (!isApiConfigured()) {
        setState({
          status: "unconfigured",
          data: null,
          error: new ApiError(
            "No backend is configured. Set NEXT_PUBLIC_API_URL to the FastAPI origin.",
            { code: "not_configured" },
          ),
        });

        return null;
      }

      setState({ status: "loading", data: null, error: null });

      try {
        const data = await call(...args);

        // A response arriving after unmount must not set state.
        if (mounted.current) {
          setState({ status: "success", data, error: null });
        }

        return data;
      } catch (error) {
        if (mounted.current) {
          setState({ status: "error", data: null, error });
        }

        return null;
      }
    },
    [call],
  );

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, run, reset };
}

/**
 * Fetch on mount, and optionally poll.
 *
 * Used for health, which is only useful if it stays current. The interval is
 * cleared on unmount and skipped entirely when no backend is configured, so
 * an unconfigured install makes no requests at all.
 */
export function useApiQuery(call, { pollMs = 0, enabled = true } = {}) {
  const [state, setState] = useState(
    isApiConfigured() ? { status: "loading", data: null, error: null } : { status: "unconfigured", data: null, error: null },
  );

  /*
    Latest-ref, written after commit rather than during render.

    The call is nearly always an inline arrow, so its identity changes every
    render. Depending on it directly would re-run the effect — and restart the
    poll interval — on every parent render.
  */
  const callRef = useRef(call);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || !isApiConfigured()) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const data = await callRef.current({ signal: controller.signal });

        if (active) {
          setState({ status: "success", data, error: null });
        }
      } catch (error) {
        if (active) {
          setState({ status: "error", data: null, error });
        }
      }
    };

    load();

    const timer = pollMs > 0 ? setInterval(load, pollMs) : null;

    return () => {
      active = false;
      controller.abort();

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, pollMs, nonce]);

  return { ...state, refetch };
}

/** Human-readable text for an ApiError, safe to render. */
export function describeApiError(error) {
  if (!error) {
    return null;
  }

  switch (error.code) {
    case "not_configured":
      return "No backend configured. Set NEXT_PUBLIC_API_URL and restart.";
    case "network":
      return "Could not reach the backend. Is it running, and does its CORS policy allow this origin?";
    case "timeout":
      return "The backend did not respond in time.";
    case "unauthenticated":
      return "Your backend session has expired. Sign in with Google again.";
    case "validation":
      return "The backend rejected the request as invalid.";
    default:
      return error.message ?? "The request failed.";
  }
}
