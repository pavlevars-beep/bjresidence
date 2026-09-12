"use client";

import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import { getIcon } from "./icon-map";
import type { HouseRules } from "@/lib/info-point";

export function HouseRulesSection({ houseRules }: { houseRules: HouseRules }) {
  const { locale, dict } = useInfoPointLanguage();
  const summary = locale === "sr" ? houseRules.summarySr : houseRules.summaryEn;
  const sections = houseRules.sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-olive-dark p-5 text-cream">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/70">{dict.houseRules.summaryTitle}</p>
        <p className="mt-2 text-base leading-relaxed">{summary}</p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{dict.houseRules.fullTitle}</p>
        <div className="flex flex-col gap-3">
          {sections.map((section) => {
            const Icon = getIcon(section.icon);
            return (
              <div key={section.id} className="rounded-2xl border border-ink/8 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-dark/10 text-olive-dark">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <p className="font-semibold text-ink">{locale === "sr" ? section.titleSr : section.titleEn}</p>
                </div>
                <p className="mt-2 pl-12 text-sm leading-relaxed text-ink/65">
                  {locale === "sr" ? section.bodySr : section.bodyEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
