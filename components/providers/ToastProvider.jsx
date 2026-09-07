"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils/cn";
import { tone as resolveTone } from "@/lib/utils/tones";
import { Icon } from "@/components/ui/Icon";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 5000;

const TONE_ICONS = {
  safe: "check-circle",
  critical: "warning",
  warn: "warning",
  info: "info",
  accent: "bolt",
  neutral: "info",
};

/**
 * Toast notifications.
 *
 * Every mutation in the console reports its outcome here rather than changing
 * state silently. Destructive actions pass an `action` — an undo — which is
 * why toasts stay on screen for five seconds rather than flashing past.
 *
 * The live region is polite and permanent: announcing from a region that is
 * added to the DOM at the same moment as its content is unreliable in several
 * screen readers, so the container is always mounted.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ title, description, tone = "safe", action, duration = DEFAULT_DURATION }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [
        // Cap the stack so a bulk action cannot bury the screen.
        ...current.slice(-3),
        { id, title, description, tone, action },
      ]);

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  /** Clear pending timers if the provider unmounts mid-countdown. */
  useEffect(
    () => () => {
      for (const timer of timers.current.values()) {
        clearTimeout(timer);
      }

      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-200 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {toasts.map((toast) => {
          const t = resolveTone(toast.tone);

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-4 shadow-2xl motion-safe:animate-slide-in",
                t.border,
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  t.bg,
                  t.text,
                )}
              >
                <Icon name={TONE_ICONS[toast.tone] ?? "info"} className="text-xs" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">{toast.title}</p>

                {toast.description && (
                  <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                    {toast.description}
                  </p>
                )}

                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action.onClick();
                      dismiss(toast.id);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded text-[11px] font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:decoration-accent"
                  >
                    <Icon name="undo" className="text-[9px]" />
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-faint transition duration-200 hover:bg-raise-md hover:text-ink"
              >
                <Icon name="close" className="text-[10px]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }

  return context;
}

export default ToastProvider;
