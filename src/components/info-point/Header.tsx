"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { InfoPointSettings } from "@/lib/info-point";

export function LanguageSwitcher() {
  const { locale, setLocale, dict } = useInfoPointLanguage();
  return (
    <div className="flex items-center rounded-full border border-ink/10 bg-white/70 p-1 text-sm font-semibold shadow-soft">
      <button
        type="button"
        onClick={() => setLocale("sr")}
        className={cn("rounded-full px-3 py-1.5 transition-colors", locale === "sr" ? "bg-olive-dark text-cream" : "text-ink/50")}
      >
        {dict.lang.sr}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn("rounded-full px-3 py-1.5 transition-colors", locale === "en" ? "bg-olive-dark text-cream" : "text-ink/50")}
      >
        {dict.lang.en}
      </button>
    </div>
  );
}

export function InfoPointHeader({ settings }: { settings: InfoPointSettings }) {
  const { locale } = useInfoPointLanguage();
  const title = locale === "sr" ? settings.heroTitleSr : settings.heroTitleEn;
  const subtitle = locale === "sr" ? settings.heroSubtitleSr : settings.heroSubtitleEn;

  return (
    <header className="flex items-start justify-between gap-3 px-5 pt-6 sm:px-8">
      <div className="flex items-center gap-3">
        <Image src="/images/brand/icon-mark.png" alt="" width={48} height={48} priority className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
        <div>
          <p className="text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">{title}</p>
          <p className="mt-0.5 max-w-xs text-sm leading-snug text-ink/60 sm:text-base">{subtitle}</p>
        </div>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
