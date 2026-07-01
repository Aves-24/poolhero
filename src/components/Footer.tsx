"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-slate-400">
      {t("footer.disclaimer")}
    </footer>
  );
}
