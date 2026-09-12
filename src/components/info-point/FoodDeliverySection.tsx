"use client";

import { ExternalLink } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { FoodLink } from "@/lib/info-point";

export function FoodDeliverySection({ links }: { links: FoodLink[] }) {
  const { locale, dict } = useInfoPointLanguage();
  const visible = links.filter((l) => l.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-3">
      {visible.map((link) => {
        const description = locale === "sr" ? link.descriptionSr : link.descriptionEn;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{link.name}</span>
              {description && <span className="block text-sm text-ink/55">{description}</span>}
            </span>
            <ExternalLink size={18} className="shrink-0 text-ink/30" />
          </a>
        );
      })}
      {visible.length === 0 && <p className="py-6 text-center text-sm text-ink/40">{dict.foodDelivery.title}</p>}
    </div>
  );
}
