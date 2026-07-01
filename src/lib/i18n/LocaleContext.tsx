"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { t as translate, type Locale } from "./translations";

const STORAGE_KEY = "ph_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "pl";
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "pl";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pl");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setLocaleState(stored === "pl" || stored === "de" ? stored : detectLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  if (!ready) return null;

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
