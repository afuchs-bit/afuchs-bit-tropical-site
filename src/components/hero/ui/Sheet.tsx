"use client";

import { AnimatePresence, m, useIsPresent } from "framer-motion";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ease } from "@/design/tokens/motion";
import { useFocusTrap } from "./focusTrap";
import { lockPage, lockScroll } from "./pageLock";
import { useCalm, useMediaQuery } from "./useCalm";

/**
 * Papier sheet as a modal dialog: slides in from the right on desktop and
 * from the bottom on mobile, traps focus, closes on Esc, the close button or
 * a click on the dimmed page, and hands focus back. Portaled to <body> so
 * #page can go inert behind it. Above the grain, below the age gate.
 */
type SheetProps = {
  open: boolean;
  onClose: () => void;
  /** id of the title element inside the sheet. */
  labelledBy: string;
  children: ReactNode;
};

export function Sheet({ open, onClose, labelledBy, children }: SheetProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  if (!host) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <SheetPanel key="sheet" onClose={onClose} labelledBy={labelledBy}>
          {children}
        </SheetPanel>
      )}
    </AnimatePresence>,
    host,
  );
}

function SheetPanel({ onClose, labelledBy, children }: Omit<SheetProps, "open">) {
  const isPresent = useIsPresent();
  const calm = useCalm();
  const desktop = useMediaQuery("(min-width: 768px)");
  const panelRef = useRef<HTMLDivElement>(null);
  const lockKey = useId();

  // Declared before the focus trap: unlock first, then hand focus back.
  useEffect(() => {
    if (!isPresent) return;
    const releasePage = lockPage(`sheet${lockKey}`);
    const releaseScroll = lockScroll();
    return () => {
      releaseScroll();
      releasePage();
    };
  }, [isPresent, lockKey]);

  useFocusTrap(panelRef, isPresent, { initialFocus: panelRef, onEscape: onClose, restoreFocus: true });

  const away = calm ? { opacity: 0 } : desktop ? { x: "100%" } : { y: "100%" };
  const here = calm ? { opacity: 1 } : { x: 0, y: 0 };

  return (
    <div className="fixed inset-0 z-[47]" style={{ pointerEvents: isPresent ? undefined : "none" }}>
      <m.div
        aria-hidden
        className="absolute inset-0 bg-ink/56"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: calm ? 0.2 : 0.35, ease: ease.outQuart }}
      />
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        data-tone="light"
        className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col overflow-y-auto overscroll-contain rounded-t-card bg-paper text-ink outline-none md:inset-y-0 md:left-auto md:max-h-none md:w-[min(32rem,100vw)] md:rounded-l-card md:rounded-tr-none"
        initial={away}
        animate={here}
        exit={{ ...away, transition: { duration: calm ? 0.2 : 0.35, ease: ease.inOutQuart } }}
        transition={{ duration: calm ? 0.2 : 0.55, ease: ease.outExpo }}
      >
        {children}
      </m.div>
    </div>
  );
}

/** Title row with the close button (44px target). */
export function SheetHeader({
  title,
  titleId,
  onClose,
}: {
  title: string;
  titleId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 px-6 pt-6 md:px-10 md:pt-10">
      <h2 id={titleId} className="pt-1 font-hero text-[2.5rem] leading-[0.95] tracking-[-0.02em]">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Schließen"
        className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/16 transition-colors duration-300 hover:bg-ink hover:text-paper"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      </button>
    </div>
  );
}
