import type { TestResult } from "./types";
import { t, paramLabel, statusLabelText, type Locale } from "./i18n/translations";

export type ParamKey = "ph" | "freeCl" | "combinedCl" | "alkalinity" | "cya";
export type Status = "ok" | "low" | "high" | "missing";

export interface ParamConfig {
  key: ParamKey;
  unit: string;
  /** Zakres docelowy (norma basenu prywatnego) */
  min: number;
  max: number;
  ideal: number;
}

/** Normy dla typowego basenu prywatnego */
export const PARAMS: ParamConfig[] = [
  { key: "ph", unit: "", min: 7.0, max: 7.4, ideal: 7.2 },
  { key: "freeCl", unit: "mg/l", min: 1.0, max: 3.0, ideal: 2.0 },
  { key: "combinedCl", unit: "mg/l", min: 0, max: 0.2, ideal: 0 },
  { key: "alkalinity", unit: "mg/l", min: 80, max: 120, ideal: 100 },
  { key: "cya", unit: "mg/l", min: 30, max: 50, ideal: 40 },
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
export function analyzeParam(cfg: ParamConfig, value: number | undefined, volumeLiters: number, locale: Locale): Analysis {
  const m3 = (volumeLiters || 0) / 1000;
  const label = paramLabel(locale, cfg.key);
  const base: Analysis = {
    key: cfg.key,
    label,
    unit: cfg.unit,
    value,
    min: cfg.min,
    max: cfg.max,
    ideal: cfg.ideal,
    status: "missing",
    verdict: t(locale, "verdict.missing"),
    recommendation: t(locale, "recommendation.missing"),
  };

  if (value === undefined || Number.isNaN(value)) return base;

  let status: Status = "ok";
  if (value < cfg.min) status = "low";
  else if (value > cfg.max) status = "high";

  let verdict = t(locale, "verdict.ok");
  let recommendation = t(locale, "recommendation.ok");

  switch (cfg.key) {
    case "ph": {
      if (status === "high") {
        const grams = m3 * 10 * ((value - cfg.ideal) / 0.1);
        verdict = t(locale, "verdict.ph.high");
        recommendation = t(locale, "recommendation.ph.high", { dose: fmtDose(grams), ideal: cfg.ideal });
      } else if (status === "low") {
        const grams = m3 * 10 * ((cfg.ideal - value) / 0.1);
        verdict = t(locale, "verdict.ph.low");
        recommendation = t(locale, "recommendation.ph.low", { dose: fmtDose(grams), ideal: cfg.ideal });
      }
      break;
    }
    case "freeCl": {
      if (status === "low") {
        const delta = cfg.ideal - value;
        const grams = m3 * 1.5 * delta;
        verdict = t(locale, "verdict.freeCl.low");
        recommendation = t(locale, "recommendation.freeCl.low", { dose: fmtDose(grams), ideal: cfg.ideal });
      } else if (status === "high") {
        verdict = t(locale, "verdict.freeCl.high");
        recommendation = t(locale, "recommendation.freeCl.high");
      }
      break;
    }
    case "combinedCl": {
      if (status === "high") {
        verdict = t(locale, "verdict.combinedCl.high");
        recommendation = t(locale, "recommendation.combinedCl.high");
      } else {
        verdict = t(locale, "verdict.ok");
        recommendation = t(locale, "recommendation.combinedCl.ok");
      }
      break;
    }
    case "alkalinity": {
      if (status === "low") {
        const grams = m3 * 1.7 * (cfg.ideal - value);
        verdict = t(locale, "verdict.alkalinity.low");
        recommendation = t(locale, "recommendation.alkalinity.low", { dose: fmtDose(grams), ideal: cfg.ideal });
      } else if (status === "high") {
        verdict = t(locale, "verdict.alkalinity.high");
        recommendation = t(locale, "recommendation.alkalinity.high");
      }
      break;
    }
    case "cya": {
      if (status === "low") {
        const grams = m3 * 1.0 * (cfg.ideal - value);
        verdict = t(locale, "verdict.cya.low");
        recommendation = t(locale, "recommendation.cya.low", { dose: fmtDose(grams), ideal: cfg.ideal });
      } else if (status === "high") {
        verdict = t(locale, "verdict.cya.high");
        recommendation = t(locale, "recommendation.cya.high");
      }
      break;
    }
  }

  return { ...base, status, verdict, recommendation };
}

/** Pełna analiza wyniku testu względem objętości basenu */
export function analyzeTest(test: TestResult, volumeLiters: number, locale: Locale): Analysis[] {
  const values: Record<ParamKey, number | undefined> = {
    ph: test.ph,
    freeCl: test.freeCl,
    combinedCl: test.combinedCl ?? (test.totalCl !== undefined && test.freeCl !== undefined ? round(test.totalCl - test.freeCl, 2) : undefined),
    alkalinity: test.alkalinity,
    cya: test.cya,
  };
  return PARAMS.map((cfg) => analyzeParam(cfg, values[cfg.key], volumeLiters, locale));
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

export function statusLabel(status: Status, locale: Locale): string {
  return statusLabelText(locale, status);
}
