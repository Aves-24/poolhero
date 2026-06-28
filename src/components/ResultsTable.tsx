"use client";

import type { TestResult } from "@/lib/types";
import { analyzeTest, statusColor, statusLabel } from "@/lib/water";

export default function ResultsTable({ test, volumeLiters }: { test: TestResult; volumeLiters: number }) {
  const rows = analyzeTest(test, volumeLiters);
  const measured = rows.filter((r) => r.status !== "missing");
  const problems = measured.filter((r) => r.status !== "ok");

  return (
    <div className="space-y-4">
      <div
        className={`card p-4 ${
          problems.length === 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="font-semibold">
          {measured.length === 0
            ? "Brak zmierzonych parametrów."
            : problems.length === 0
            ? "✅ Woda w normie — wszystkie zmierzone parametry OK."
            : `⚠️ Do poprawy: ${problems.length} z ${measured.length} parametrów.`}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Parametr</th>
              <th className="px-3 py-2 font-medium">Wynik</th>
              <th className="px-3 py-2 font-medium">Norma</th>
              <th className="px-3 py-2 font-medium">Status</th>
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
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-slate-700">Co zrobić?</h3>
        {measured.length === 0 ? (
          <p className="text-slate-500 text-sm">Brak danych do rekomendacji.</p>
        ) : (
          measured.map((r) => (
            <div key={r.key} className={`card p-3 text-sm ${statusColor(r.status)}`}>
              <div className="font-medium">
                {r.label}: {r.verdict}
              </div>
              <div className="mt-0.5 opacity-90">{r.recommendation}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
