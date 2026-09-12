"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInfoPointDictionary, infoPointLocales, type InfoPointDictionary, type InfoPointLocale } from "./info-point-dictionary";

interface InfoPointLanguageValue {
  locale: InfoPointLocale;
  setLocale: (locale: InfoPointLocale) => void;
  dict: InfoPointDictionary;
}

const InfoPointLanguageContext = createContext<InfoPointLanguageValue | null>(null);

const STORAGE_KEY = "bj-info-point-locale";
const DEFAULT_LOCALE: InfoPointLocale = "sr";

export function InfoPointLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<InfoPointLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (infoPointLocales as string[]).includes(stored)) {
        setLocaleState(stored as InfoPointLocale);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — default stays "sr".
    }
  }, []);

  const setLocale = (next: InfoPointLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — nothing to persist to, page still works for this session.
    }
  };

  const dict = useMemo(() => getInfoPointDictionary(locale), [locale]);

  return (
    <InfoPointLanguageContext.Provider value={{ locale, setLocale, dict }}>
      {children}
    </InfoPointLanguageContext.Provider>
  );
}

export function useInfoPointLanguage() {
  const ctx = useContext(InfoPointLanguageContext);
  if (!ctx) throw new Error("useInfoPointLanguage must be used within an InfoPointLanguageProvider");
  return ctx;
}
