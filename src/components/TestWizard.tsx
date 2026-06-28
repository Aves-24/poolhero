"use client";

import { useMemo, useState } from "react";
import type { TestResult, User } from "@/lib/types";
import { buildSteps, FULL_TEST_KEYS, MEASURE_OPTIONS, MeasureKey, InputField } from "@/lib/reagents";
import ResultsTable from "./ResultsTable";

type Mode = "choose" | "single-select" | "running" | "done";
type Values = Partial<Record<InputField, string>>;

export default function TestWizard({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [mode, setMode] = useState<Mode>("choose");
  const [keys, setKeys] = useState<MeasureKey[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTest, setSavedTest] = useState<TestResult | null>(null);

  const steps = useMemo(() => (keys.length ? buildSteps(keys) : []), [keys]);
  const current = steps[stepIdx];

  function startFull() {
    setKeys(FULL_TEST_KEYS);
    setValues({});
    setStepIdx(0);
    setMode("running");
  }

  function startSingle(key: MeasureKey) {
    setKeys([key]);
    setValues({});
    setStepIdx(0);
    setMode("running");
  }

  function setField(field: InputField, v: string) {
    setValues((s) => ({ ...s, [field]: v }));
  }

  function next() {
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
    else save();
  }

  function back() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { userId: user.id };
      (["ph", "freeCl", "totalCl", "alkalinity", "cya"] as InputField[]).forEach((f) => {
        if (values[f] !== undefined && values[f] !== "") payload[f] = Number(values[f]);
      });
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się zapisać testu");
      setSavedTest(data);
      setMode("done");
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setMode("choose");
    setKeys([]);
    setValues({});
    setStepIdx(0);
    setSavedTest(null);
    setError(null);
  }

  /* ----------------------------- Widoki ----------------------------- */

  if (mode === "choose") {
    return (
      <div className="space-y-3">
        <button onClick={startFull} className="card p-5 w-full text-left hover:border-pool-300 transition">
          <div className="text-lg font-semibold text-pool-800">🧪 Pełny test</div>
          <div className="text-slate-500 text-sm mt-1">
            Wszystkie odczynniki po kolei: pH, chlor (wolny + całkowity), zasadowość, stabilizator. Aplikacja
            przeprowadzi Cię krok po kroku.
          </div>
        </button>
        <button onClick={() => setMode("single-select")} className="card p-5 w-full text-left hover:border-pool-300 transition">
          <div className="text-lg font-semibold text-slate-800">🔬 Pojedynczy pomiar</div>
          <div className="text-slate-500 text-sm mt-1">Zmierz tylko jeden wybrany parametr.</div>
        </button>
      </div>
    );
  }

  if (mode === "single-select") {
    return (
      <div className="space-y-3">
        <button onClick={reset} className="btn-ghost text-sm">
          ← Wróć
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          {MEASURE_OPTIONS.map((o) => (
            <button key={o.key} onClick={() => startSingle(o.key)} className="card p-4 text-left hover:border-pool-300 transition">
              <div className="font-semibold text-slate-800">{o.label}</div>
              <div className="text-sm text-slate-500">{o.description}</div>
              <div className="text-xs text-pool-600 mt-1">Odczynnik: {o.reagent}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "running" && current) {
    const isInput = current.kind === "input";
    const field = current.field;
    const filled = !isInput || (field !== undefined && values[field] !== undefined && values[field] !== "");
    const progress = Math.round(((stepIdx + 1) / steps.length) * 100);

    return (
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>
              Krok {stepIdx + 1} z {steps.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-pool-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card p-5">
          <div className={`text-xs font-medium uppercase tracking-wide ${isInput ? "text-pool-600" : "text-slate-400"}`}>
            {isInput ? "Pomiar" : "Instrukcja"}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mt-1">{current.title}</h3>
          <p className="text-slate-600 mt-2 leading-relaxed">{current.body}</p>

          {isInput && field && (
            <div className="mt-4">
              <label className="label">Wpisz wynik z wyświetlacza {current.unit ? `(${current.unit})` : ""}</label>
              <input
                className="input text-lg"
                type="number"
                inputMode="decimal"
                step={current.step}
                min={current.min}
                max={current.max}
                autoFocus
                value={values[field] ?? ""}
                onChange={(e) => setField(field, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filled) next();
                }}
              />
            </div>
          )}
        </div>

        {error && <div className="card border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}

        <div className="flex gap-2">
          {stepIdx > 0 ? (
            <button onClick={back} className="btn-secondary">
              ← Wstecz
            </button>
          ) : (
            <button onClick={reset} className="btn-ghost">
              Anuluj
            </button>
          )}
          <button onClick={next} disabled={!filled || saving} className="btn-primary ml-auto">
            {stepIdx === steps.length - 1 ? (saving ? "Zapisuję…" : "Zakończ i pokaż wynik") : "Dalej →"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "done" && savedTest) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Wynik testu</h2>
          <button onClick={reset} className="btn-secondary">
            Nowy test
          </button>
        </div>
        <ResultsTable test={savedTest} volumeLiters={user.volumeLiters} />
      </div>
    );
  }

  return null;
}
