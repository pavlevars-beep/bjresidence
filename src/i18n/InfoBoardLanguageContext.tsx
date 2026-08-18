"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInfoBoardDictionary, type InfoBoardDictionary } from "./info-board-dictionary";

export type BoardLocale = "sr" | "en";

interface InfoBoardLanguageValue {
  locale: BoardLocale;
  setLocale: (locale: BoardLocale) => void;
  dict: InfoBoardDictionary;
}

const InfoBoardLanguageContext = createContext<InfoBoardLanguageValue | null>(null);

const STORAGE_KEY = "bj-info-board-locale";

export function InfoBoardLanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<BoardLocale>("sr");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "sr" || stored === "en") setLocaleState(stored);
    } catch {
      // localStorage unavailable (kiosk browser private mode, etc.) — default stays "sr".
    }
  }, []);

  const setLocale = (next: BoardLocale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — nothing to persist to, board still works for this session.
    }
  };

  const dict = useMemo(() => getInfoBoardDictionary(locale), [locale]);

  return (
    <InfoBoardLanguageContext.Provider value={{ locale, setLocale, dict }}>
      {children}
    </InfoBoardLanguageContext.Provider>
  );
}

export function useInfoBoardLanguage() {
  const ctx = useContext(InfoBoardLanguageContext);
  if (!ctx) throw new Error("useInfoBoardLanguage must be used within an InfoBoardLanguageProvider");
  return ctx;
}
