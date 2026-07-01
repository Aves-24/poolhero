"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => setLocale("pl")}
        className={locale === "pl" ? "font-bold text-pool-700" : "text-slate-400 hover:text-slate-600"}
      >
        PL
      </button>
      <span className="text-slate-300">/</span>
      <button
        onClick={() => setLocale("de")}
        className={locale === "de" ? "font-bold text-pool-700" : "text-slate-400 hover:text-slate-600"}
      >
        DE
      </button>
    </div>
  );
}
