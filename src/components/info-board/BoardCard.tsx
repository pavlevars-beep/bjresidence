import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BoardCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white/70 p-4 shadow-soft sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BoardCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-wood", className)}>{children}</p>
  );
}
