import type { TestResult } from "./types";

export type ParamKey = "ph" | "freeCl" | "combinedCl" | "alkalinity" | "cya";
export type Status = "ok" | "low" | "high" | "missing";

export interface ParamConfig {
  key: ParamKey;
  label: string;
  unit: string;
  /** Zakres docelowy (norma basenu prywatnego) */
  min: number;
  max: number;
  ideal: number;
}

/** Normy dla typowego basenu prywatnego */
export const PARAMS: ParamConfig[] = [
  { key: "ph", label: "pH", unit: "", min: 7.0, max: 7.4, ideal: 7.2 },
  { key: "freeCl", label: "Chlor wolny", unit: "mg/l", min: 1.0, max: 3.0, ideal: 2.0 },
  { key: "combinedCl", label: "Chlor związany", unit: "mg/l", min: 0, max: 0.2, ideal: 0 },
  { key: "alkalinity", label: "Zasadowość (TA)", unit: "mg/l", min: 80, max: 120, ideal: 100 },
  { key: "cya", label: "Stabilizator (CYA)", unit: "mg/l", min: 30, max: 50, ideal: 40 },
];

export interface Analysis {
  key: ParamKey;
  label: string;
  unit: string;
  value: number | undefined;
  min: number;
  max: number;
  ideal: number;
  status: Status;
  /** Krótka ocena dla użytkownika */
  verdict: string;
  /** Co zrobić + przybliżona dawka (uwzględnia objętość basenu) */
  recommendation: string;
}

function round(n: number, d = 0): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

/** Formatuje dawkę w gramach -> g lub kg */
function fmtDose(grams: number): string {
  if (grams >= 1000) return `${round(grams / 1000, 2)} kg`;
  return `${round(grams)} g`;
}

/**
 * Analiza pojedynczego pomiaru z rekomendacją dawkowania.
 * Dawki są PRZYBLIŻONE i zależą od stężenia konkretnego preparatu —
 * zawsze sprawdź etykietę produktu.
 */
export function analyzeParam(cfg: ParamConfig, value: number | undefined, volumeLiters: number): Analysis {
  const m3 = (volumeLiters || 0) / 1000;
  const base: Analysis = {
    key: cfg.key,
    label: cfg.label,
    unit: cfg.unit,
    value,
    min: cfg.min,
    max: cfg.max,
    ideal: cfg.ideal,
    status: "missing",
    verdict: "Brak pomiaru",
    recommendation: "Nie zmierzono tego parametru.",
  };

  if (value === undefined || Number.isNaN(value)) return base;

  let status: Status = "ok";
  if (value < cfg.min) status = "low";
  else if (value > cfg.max) status = "high";

  let verdict = "W normie ✓";
  let recommendation = "Brak działań — wartość w normie.";

  switch (cfg.key) {
    case "ph": {
      if (status === "high") {
        const grams = m3 * 10 * ((value - cfg.ideal) / 0.1);
        verdict = "Za wysokie pH";
        recommendation = `Dodaj ok. ${fmtDose(grams)} preparatu pH‑Minus, aby obniżyć pH do ~${cfg.ideal}.`;
      } else if (status === "low") {
        const grams = m3 * 10 * ((cfg.ideal - value) / 0.1);
        verdict = "Za niskie pH";
        recommendation = `Dodaj ok. ${fmtDose(grams)} preparatu pH‑Plus, aby podnieść pH do ~${cfg.ideal}.`;
      }
      break;
    }
    case "freeCl": {
      if (status === "low") {
        const delta = cfg.ideal - value;
        const grams = m3 * 1.5 * delta;
        verdict = "Za mało chloru";
        recommendation = `Dodaj ok. ${fmtDose(grams)} chloru (granulat szybki ~60%), aby podnieść do ~${cfg.ideal} mg/l.`;
      } else if (status === "high") {
        verdict = "Za dużo chloru";
        recommendation =
          "Nie dodawaj chloru. Wstrzymaj dozowanie i poczekaj, aż poziom spadnie (kąpiel dozwolona poniżej 3 mg/l). Możesz częściowo wymienić wodę.";
      }
      break;
    }
    case "combinedCl": {
      if (status === "high") {
        verdict = "Za dużo chloramin";
        recommendation =
          "Wykonaj chlorowanie szokowe (przebicie): podnieś chlor wolny ~10× powyżej chloru związanego, aby rozbić chloraminy. Zadbaj o wentylację.";
      } else {
        verdict = "W normie ✓";
        recommendation = "Brak działań — niski poziom chloramin.";
      }
      break;
    }
    case "alkalinity": {
      if (status === "low") {
        const grams = m3 * 1.7 * (cfg.ideal - value);
        verdict = "Za niska zasadowość";
        recommendation = `Dodaj ok. ${fmtDose(grams)} preparatu Alka‑Plus (wodorowęglan sodu), aby podnieść do ~${cfg.ideal} mg/l.`;
      } else if (status === "high") {
        verdict = "Za wysoka zasadowość";
        recommendation =
          "Obniż zasadowość preparatem pH‑Minus (kwas) dozowanym partiami, kontrolując pH. Wysoka TA utrudnia stabilizację pH.";
      }
      break;
    }
    case "cya": {
      if (status === "low") {
        const grams = m3 * 1.0 * (cfg.ideal - value);
        verdict = "Za mało stabilizatora";
        recommendation = `Dodaj ok. ${fmtDose(grams)} stabilizatora (kwas cyjanurowy), aby podnieść CYA do ~${cfg.ideal} mg/l. Dozuj powoli przez skimmer.`;
      } else if (status === "high") {
        verdict = "Za dużo stabilizatora";
        recommendation =
          "Stabilizatora nie da się usunąć chemicznie — częściowo wymień wodę (rozcieńczenie), aby obniżyć CYA. Zbyt wysoki CYA osłabia działanie chloru.";
      }
      break;
    }
  }

  return { ...base, status, verdict, recommendation };
}

/** Pełna analiza wyniku testu względem objętości basenu */
export function analyzeTest(test: TestResult, volumeLiters: number): Analysis[] {
  const values: Record<ParamKey, number | undefined> = {
    ph: test.ph,
    freeCl: test.freeCl,
    combinedCl: test.combinedCl ?? (test.totalCl !== undefined && test.freeCl !== undefined ? round(test.totalCl - test.freeCl, 2) : undefined),
    alkalinity: test.alkalinity,
    cya: test.cya,
  };
  return PARAMS.map((cfg) => analyzeParam(cfg, values[cfg.key], volumeLiters));
}

export function statusColor(status: Status): string {
  switch (status) {
    case "ok":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "low":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "high":
      return "text-rose-700 bg-rose-50 border-rose-200";
    default:
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

export function statusLabel(status: Status): string {
  switch (status) {
    case "ok":
      return "OK";
    case "low":
      return "Za mało";
    case "high":
      return "Za dużo";
    default:
      return "—";
  }
}
