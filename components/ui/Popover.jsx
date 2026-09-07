"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Small anchored menu used by the dashboard header controls.
 *
 * Handles the behaviour every dropdown needs and that hand-rolled ones usually
 * miss: closes on Escape, closes on a click outside, returns focus to the
 * trigger, and exposes `aria-expanded`/`aria-controls` so assistive tech knows
 * the button owns a menu.
 *
 * `trigger` is a render prop so the caller keeps full control of the button.
 */
export function Popover({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((value) => !value),
        "aria-expanded": open,
        "aria-controls": panelId,
        "aria-haspopup": "true",
      })}

      {open && (
        <div
          id={panelId}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-60 w-72 overflow-hidden rounded-xl border border-line-strong bg-surface shadow-2xl motion-safe:animate-rise",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
        >
          {/* Any activation inside the panel dismisses it, which is the
              expected behaviour for menu items and links. */}
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export default Popover;
