"use client";

import { useCallback, useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/Button";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
]
  // Never hand focus to something hidden from sight or from assistive tech.
  .map((selector) => `${selector}:not([hidden]):not([aria-hidden="true"])`)
  .join(",");

/**
 * Accessible dialog.
 *
 * The previous modal could only be dismissed by clicking one small button: no
 * Escape key, no backdrop click, no focus management, no scroll lock and no
 * dialog semantics. This one handles all of it:
 *
 * - `role="dialog"` + `aria-modal` + a label wired to the title
 * - Escape closes
 * - clicking the backdrop closes, but a drag that ends outside does not
 * - focus moves into the dialog on open and returns to the trigger on close
 * - Tab cycles inside the dialog
 * - background scrolling is locked while open
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "lg",
  className,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const pointerDownOnBackdrop = useRef(false);
  const titleId = useId();

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  /** Keep Tab inside the dialog. */
  const trapFocus = useCallback((event) => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    // Deliberately not filtered on `offsetParent`/`getClientRects`: those are
    // layout-dependent and report nothing for a fixed-position subtree, which
    // would collapse the trap to a single element. The selector's `hidden` and
    // `aria-hidden` guards cover what actually needs excluding.
    const targets = Array.from(panel.querySelectorAll(FOCUSABLE));

    if (targets.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = targets[0];
    const last = targets.at(-1);
    const active = document.activeElement;

    // Focus sits on the panel itself right after opening. Tabbing from there
    // must enter the dialog, and shift-tabbing must wrap to the end of it
    // rather than escaping to the page behind.
    if (!targets.includes(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocused.current = document.activeElement;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      } else if (event.key === "Tab") {
        trapFocus(event);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    // Lock background scroll, compensating for the scrollbar we just removed
    // so the page behind does not shift sideways.
    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";

    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }

    // Focus the panel itself rather than its first control, so a screen reader
    // reads the dialog title before the user starts tabbing.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, trapFocus]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-sm motion-safe:animate-fade"
      // Only close when the press *starts* on the backdrop, so selecting text
      // inside the dialog and releasing outside it does not dismiss the dialog.
      onPointerDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onPointerUp={(event) => {
        if (pointerDownOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }

        pointerDownOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-line-strong bg-surface shadow-2xl motion-safe:animate-rise",
          sizes[size] ?? sizes.lg,
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
          <div className="min-w-0">
            {subtitle && (
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                {subtitle}
              </p>
            )}

            <h2 id={titleId} className="mt-1 text-lg font-semibold text-ink">
              {title}
            </h2>
          </div>

          <IconButton icon="close" label="Close dialog" onClick={onClose} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-line bg-elevated/50 p-5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
