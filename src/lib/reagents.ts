/** Definicje kreatora pomiaru dla PoolLab 1.0 i dostępnych odczynników */

import { t, measureLabel, measureDescription, type Locale } from "./i18n/translations";

export type MeasureKey = "ph" | "chlorine" | "alkalinity" | "cya";
export type InputField = "ph" | "freeCl" | "totalCl" | "alkalinity" | "cya";

export interface WizardStep {
  kind: "instruction" | "input";
  title: string;
  body: string;
  /** dla kind === "input" */
  field?: InputField;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

export interface MeasureOption {
  key: MeasureKey;
  label: string;
  reagent: string;
  description: string;
}

export function measureOptions(locale: Locale): MeasureOption[] {
  return [
    { key: "ph", label: measureLabel(locale, "ph"), reagent: "Phenol Red", description: measureDescription(locale, "ph") },
    { key: "chlorine", label: measureLabel(locale, "chlorine"), reagent: "DPD No. 1 + DPD No. 3", description: measureDescription(locale, "chlorine") },
    { key: "alkalinity", label: measureLabel(locale, "alkalinity"), reagent: "Alkalinity-M", description: measureDescription(locale, "alkalinity") },
    { key: "cya", label: measureLabel(locale, "cya"), reagent: "CYA Test", description: measureDescription(locale, "cya") },
  ];
}

/** Buduje listę kroków kreatora dla wybranych pomiarów.
 *  ZERO wykonywane RAZ na początku sesji (zgodnie z instrukcją PoolLab 1.0).
 *  Między parametrami: tylko świeża próbka wody, bez ponownego ZERO.
 */
export function buildSteps(keys: MeasureKey[], locale: Locale): WizardStep[] {
  const powerOn: WizardStep = { kind: "instruction", title: t(locale, "step.powerOn.title"), body: t(locale, "step.powerOn.body") };
  const fill: WizardStep = { kind: "instruction", title: t(locale, "step.fill.title"), body: t(locale, "step.fill.body") };
  const zero: WizardStep = { kind: "instruction", title: t(locale, "step.zero.title"), body: t(locale, "step.zero.body") };
  const freshSample: WizardStep = { kind: "instruction", title: t(locale, "step.freshSample.title"), body: t(locale, "step.freshSample.body") };

  const measureSteps: Record<MeasureKey, WizardStep[]> = {
    ph: [
      { kind: "input", title: t(locale, "step.ph.title"), body: t(locale, "step.ph.body"), field: "ph", unit: "", step: 0.1, min: 6.5, max: 8.4 },
    ],
    chlorine: [
      { kind: "input", title: t(locale, "step.freeCl.title"), body: t(locale, "step.freeCl.body"), field: "freeCl", unit: "mg/l", step: 0.1, min: 0, max: 8 },
      { kind: "input", title: t(locale, "step.totalCl.title"), body: t(locale, "step.totalCl.body"), field: "totalCl", unit: "mg/l", step: 0.1, min: 0, max: 8 },
    ],
    alkalinity: [
      { kind: "input", title: t(locale, "step.alkalinity.title"), body: t(locale, "step.alkalinity.body"), field: "alkalinity", unit: "mg/l", step: 1, min: 0, max: 200 },
    ],
    cya: [
      { kind: "input", title: t(locale, "step.cya.title"), body: t(locale, "step.cya.body"), field: "cya", unit: "mg/l", step: 1, min: 0, max: 160 },
    ],
  };

  const steps: WizardStep[] = [powerOn, fill, zero];
  keys.forEach((k, i) => {
    if (i > 0) steps.push(freshSample);
    steps.push(...measureSteps[k]);
  });
  return steps;
}

export const FULL_TEST_KEYS: MeasureKey[] = ["ph", "chlorine", "alkalinity", "cya"];
export const QUICK_TEST_KEYS: MeasureKey[] = ["ph", "chlorine"];
