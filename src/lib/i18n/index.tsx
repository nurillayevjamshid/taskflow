"use client";

import { createContext, useContext, useState } from "react";
import { uz } from "./uz";
import { ru } from "./ru";
import { en } from "./en";

export type Locale = "uz" | "ru" | "en";

const translations: Record<Locale, typeof uz> = { uz, ru, en };

type TranslationKey = keyof typeof uz;

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKey) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "taskly:locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && (stored === "uz" || stored === "ru" || stored === "en")) {
        return stored;
      }
    }
    return "uz";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale as Locale][key] || key;
  };

  const value: I18nContextValue = { locale, t, setLocale };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return context;
}
