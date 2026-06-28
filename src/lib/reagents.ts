/** Definicje kreatora pomiaru dla PoolLab 1.0 i dostępnych odczynników */

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

export const MEASURE_OPTIONS: MeasureOption[] = [
  { key: "ph", label: "pH", reagent: "Phenol Red", description: "Odczyn wody" },
  {
    key: "chlorine",
    label: "Chlor (wolny + całkowity)",
    reagent: "DPD No. 1 + DPD No. 3",
    description: "Chlor wolny, całkowity i związany",
  },
  { key: "alkalinity", label: "Zasadowość", reagent: "Alkalinity-M", description: "Kwasowość węglanowa (TA)" },
  { key: "cya", label: "Stabilizator (CYA)", reagent: "CYA Test", description: "Kwas cyjanurowy" },
];

const POWER_ON: WizardStep = {
  kind: "instruction",
  title: "1. Włącz urządzenie",
  body: "Naciśnij przycisk ON/OFF, aby włączyć PoolLab 1.0.",
};

const FILL: WizardStep = {
  kind: "instruction",
  title: "2. Napełnij kuwetę wodą",
  body: "Zanurz urządzenie w basenie lub nalej próbkę wody basenowej do kreski (ok. 10 ml). Wytrzyj kuwetę z zewnątrz do sucha.",
};

const ZERO: WizardStep = {
  kind: "instruction",
  title: "3. Kalibracja ZERO",
  body: "Z czystą wodą basenową (jeszcze BEZ tabletki) naciśnij przycisk ZERO i poczekaj na potwierdzenie kalibracji.",
};

const REZERO: WizardStep = {
  kind: "instruction",
  title: "Świeża próbka + ZERO",
  body: "Wylej wodę z poprzedniego pomiaru, przepłucz kuwetę, napełnij świeżą wodą basenową do kreski i ponownie naciśnij przycisk ZERO.",
};

const MEASURE_STEPS: Record<MeasureKey, WizardStep[]> = {
  ph: [
    {
      kind: "input",
      title: "pH — tabletka Phenol Red",
      body: "Wrzuć 1 tabletkę Phenol Red, rozkrusz mieszadełkiem aż się rozpuści, zamknij i naciśnij przycisk pH. Odczytaj wynik z wyświetlacza i wpisz poniżej.",
      field: "ph",
      unit: "",
      step: 0.1,
      min: 6.5,
      max: 8.4,
    },
  ],
  chlorine: [
    {
      kind: "input",
      title: "Chlor wolny — DPD No. 1",
      body: "Wrzuć 1 tabletkę DPD No. 1, rozkrusz aż się rozpuści i naciśnij przycisk Cl (chlor). Odczytaj CHLOR WOLNY i wpisz poniżej.",
      field: "freeCl",
      unit: "mg/l",
      step: 0.1,
      min: 0,
      max: 8,
    },
    {
      kind: "input",
      title: "Chlor całkowity — DPD No. 3",
      body: "Do TEJ SAMEJ próbki dodaj 1 tabletkę DPD No. 3, rozkrusz i naciśnij ponownie przycisk Cl. Odczytaj CHLOR CAŁKOWITY i wpisz poniżej. (Chlor związany aplikacja policzy sama.)",
      field: "totalCl",
      unit: "mg/l",
      step: 0.1,
      min: 0,
      max: 8,
    },
  ],
  alkalinity: [
    {
      kind: "input",
      title: "Zasadowość — Alkalinity-M",
      body: "Wrzuć 1 tabletkę Alkalinity-M, rozkrusz aż się rozpuści i naciśnij przycisk Alka. Odczytaj wynik i wpisz poniżej.",
      field: "alkalinity",
      unit: "mg/l",
      step: 1,
      min: 0,
      max: 200,
    },
  ],
  cya: [
    {
      kind: "input",
      title: "Stabilizator — CYA Test",
      body: "Wrzuć 1 tabletkę CYA Test, rozkrusz aż się rozpuści i naciśnij przycisk CYA. Odczytaj wynik i wpisz poniżej.",
      field: "cya",
      unit: "mg/l",
      step: 1,
      min: 0,
      max: 160,
    },
  ],
};

/** Buduje listę kroków kreatora dla wybranych pomiarów (kolejność ma znaczenie) */
export function buildSteps(keys: MeasureKey[]): WizardStep[] {
  const steps: WizardStep[] = [POWER_ON, FILL, ZERO];
  keys.forEach((k, i) => {
    if (i > 0) steps.push(REZERO);
    steps.push(...MEASURE_STEPS[k]);
  });
  return steps;
}

export const FULL_TEST_KEYS: MeasureKey[] = ["ph", "chlorine", "alkalinity", "cya"];
