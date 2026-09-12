"use client";

import { Phone } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import { cn } from "@/lib/utils";
import type { EmergencyContact } from "@/lib/info-point";

export function EmergencySection({ contacts }: { contacts: EmergencyContact[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const visible = [...contacts].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-xl bg-wood/10 px-3.5 py-2.5 text-sm text-wood">{dict.emergency.disclaimer}</p>
      {visible.map((c) => (
        <a
          key={c.id}
          href={`tel:${c.phone.replace(/\s+/g, "")}`}
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border p-4",
            c.highlight ? "border-red-200 bg-red-50" : "border-ink/8 bg-white"
          )}
        >
          <span className="font-semibold text-ink">{locale === "sr" ? c.labelSr : c.labelEn}</span>
          <span
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold",
              c.highlight ? "bg-red-600 text-white" : "bg-olive-dark text-cream"
            )}
          >
            <Phone size={14} /> {c.phone}
          </span>
        </a>
      ))}
    </div>
  );
}
