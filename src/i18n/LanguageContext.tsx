"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sr, en, ru, type Dictionary } from "./dictionaries";

export type Locale = "sr" | "en" | "ru";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "bj-residence-locale";
const DICTS: Record<Locale, Dictionary> = { sr, en, ru };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("sr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "sr" || stored === "en" || stored === "ru") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  const dict = useMemo(() => DICTS[locale], [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dict }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
