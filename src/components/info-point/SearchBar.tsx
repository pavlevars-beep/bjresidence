"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useInfoPointLanguage } from "@/i18n/InfoPointLanguageContext";
import type { InfoPointCategoryKey, InfoPointConfig } from "@/lib/info-point";

interface SearchEntry {
  label: string;
  categoryKey: InfoPointCategoryKey;
}

function buildIndex(config: InfoPointConfig, locale: "sr" | "en"): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const push = (label: string, categoryKey: InfoPointCategoryKey) => {
    if (label) entries.push({ label, categoryKey });
  };

  push(locale === "sr" ? "Wi-Fi" : "Wi-Fi", "wifi");
  config.houseRules.sections.forEach((s) => push(locale === "sr" ? s.titleSr : s.titleEn, "houseRules"));
  config.deviceGuides.forEach((g) => push(locale === "sr" ? g.titleSr : g.titleEn, "deviceGuides"));
  config.nearbyPlaces.forEach((p) => push(p.name, "nearby"));
  config.transportRoutes.forEach((r) => push(locale === "sr" ? r.titleSr : r.titleEn, "transport"));
  config.taxiOptions.forEach((t) => push(t.name, "transport"));
  config.foodLinks.forEach((f) => push(f.name, "foodDelivery"));
  config.workDestinations.forEach((w) => push(w.companyName, "workDestinations"));
  config.emergencyContacts.forEach((e) => push(locale === "sr" ? e.labelSr : e.labelEn, "emergency"));

  return entries;
}

export function SearchBar({ config, onOpen }: { config: InfoPointConfig; onOpen: (key: InfoPointCategoryKey) => void }) {
  const { locale, dict } = useInfoPointLanguage();
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildIndex(config, locale), [config, locale]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index.filter((e) => e.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, index]);

  return (
    <div className="relative px-5 sm:px-8">
      <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 px-4 py-3 shadow-soft">
        <Search size={18} className="shrink-0 text-ink/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.search.placeholder}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </div>

      {query.trim() && (
        <div className="absolute inset-x-5 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card sm:inset-x-8">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink/40">{dict.search.noResults}</p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.categoryKey}-${i}`}
                type="button"
                onClick={() => {
                  onOpen(r.categoryKey);
                  setQuery("");
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm text-ink hover:bg-ink/5"
              >
                {r.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
