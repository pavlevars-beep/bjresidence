"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Full-screen detail panel used for every Info Point module (Wi-Fi, House
 * Rules, Report an Issue, etc.). Keeps the home screen a clean, scannable
 * list of cards while each module's real content lives one tap away —
 * mirrors "premium concierge app" patterns rather than a long single page.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-cream sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-[2rem] sm:shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-ink/8 bg-cream/95 px-5 py-4 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                aria-label="Back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 sm:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="flex-1 truncate text-base font-bold text-ink sm:text-lg">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5 sm:flex"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
