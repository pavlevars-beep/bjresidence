import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BoardCard({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[2rem] p-4 shadow-soft sm:p-5",
        tone === "light" ? "border border-ink/8 bg-white/70" : "border border-ink/5 bg-olive-dark text-cream",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BoardCardTitle({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={cn(
        "text-sm font-semibold uppercase tracking-[0.18em]",
        tone === "light" ? "text-wood" : "text-cream/70",
        className
      )}
    >
      {children}
    </p>
  );
}
