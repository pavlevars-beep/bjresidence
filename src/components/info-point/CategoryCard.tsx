"use client";

import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function CategoryCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-olive-dark/10 text-olive-dark">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-ink">{title}</span>
        {subtitle && <span className="block truncate text-sm text-ink/50">{subtitle}</span>}
      </span>
      <ChevronRight size={20} className="shrink-0 text-ink/30" />
    </button>
  );
}
