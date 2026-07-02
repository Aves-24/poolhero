"use client";

import { useState } from "react";
import type { TestResult, User } from "@/lib/types";
import { analyzeTest, statusColor, statusLabel } from "@/lib/water";
import { buildAnalysisPrompt } from "@/lib/prompt";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function ResultsTable({ test, volumeLiters, user }: { test: TestResult; volumeLiters: number; user?: User }) {
  const { locale, t } = useLocale();
  const rows = analyzeTest(test, volumeLiters, locale);
  const measured = rows.filter((r) => r.status !== "missing");
  const problems = measured.filter((r) => r.status !== "ok");

  const [copied, setCopied] = useState(false);

  async function sharePrompt() {
    const text = buildAnalysisPrompt(locale, test, volumeLiters, user);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // użytkownik anulował share sheet — nic nie rób
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`card p-4 ${
          problems.length === 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="font-semibold">
          {measured.length === 0
            ? t("results.noMeasured")
            : problems.length === 0
            ? t("results.allOk")
            : t("results.problems", { n: problems.length, total: measured.length })}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">{t("results.tableParam")}</th>
              <th className="px-3 py-2 font-medium">{t("results.tableResult")}</th>
              <th className="px-3 py-2 font-medium">{t("results.tableNorm")}</th>
              <th className="px-3 py-2 font-medium">{t("results.tableStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2.5 font-medium text-slate-700">{r.label}</td>
                <td className="px-3 py-2.5 tabular-nums">
                  {r.value === undefined ? "—" : `${r.value} ${r.unit}`.trim()}
                </td>
                <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                  {r.min}–{r.max} {r.unit}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${statusColor(r.status)}`}>
                    {statusLabel(r.status, locale)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {test.waterTemp !== undefined && (
        <div className="text-sm text-slate-500">
          🌡️ {t("results.waterTemp")}: <span className="font-medium text-slate-700 tabular-nums">{test.waterTemp} °C</span>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-700">{t("results.whatToDo")}</h3>
        {measured.length === 0 ? (
          <p className="text-slate-500 text-sm">{t("results.noData")}</p>
        ) : (
          measured.map((r) => (
            <div key={r.key} className={`card p-3 text-sm ${statusColor(r.status)}`}>
              <div className="font-medium">{r.label}: {r.verdict}</div>
              <div className="mt-0.5 opacity-90">{r.recommendation}</div>
            </div>
          ))
        )}
      </div>

      <div className="pt-1">
        <button
          onClick={sharePrompt}
          disabled={measured.length === 0}
          className="btn-secondary w-full gap-2 py-3"
          title={t("results.shareTitle")}
        >
          {copied ? t("results.copied") : <><span>📤</span> {t("results.share")}</>}
        </button>
      </div>
    </div>
  );
}
