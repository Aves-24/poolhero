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
  title: "2. Napełnij kuwetę wodą basenową",
  body: "Zanurz urządzenie w basenie lub nalej próbkę wody basenowej do kreski (ok. 10 ml). Wytrzyj kuwetę z zewnątrz do sucha.",
};

const ZERO: WizardStep = {
  kind: "instruction",
  title: "3. Skalibruj — naciśnij ZERO",
  body: "Z czystą wodą basenową (BEZ żadnej tabletki) naciśnij przycisk ZERO i poczekaj na potwierdzenie. Kalibrację ZERO wykonujesz tylko RAZ — jest ważna dla wszystkich kolejnych pomiarów w tej sesji.",
};

/** Krok wymiany próbki między pomiarami — BEZ ZERO */
const FRESH_SAMPLE: WizardStep = {
  kind: "instruction",
  title: "Wymień próbkę wody",
  body: "Wylej wodę z poprzedniego pomiaru, przepłucz kuwetę i napełnij świeżą wodą basenową do kreski. Nie naciskaj ZERO — kalibracja z początku sesji nadal obowiązuje.",
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
      title: "Chlor całkowity — DPD No. 3 — NIE WYLEWAJ WODY",
      body: "Do TEJ SAMEJ próbki (nie wylewaj!) dodaj 1 tabletkę DPD No. 3, rozkrusz i naciśnij ponownie przycisk Cl. Odczytaj CHLOR CAŁKOWITY i wpisz poniżej. Chlor związany aplikacja policzy sama.",
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

/** Buduje listę kroków kreatora dla wybranych pomiarów.
 *  ZERO wykonywane RAZ na początku sesji (zgodnie z instrukcją PoolLab 1.0).
 *  Między parametrami: tylko świeża próbka wody, bez ponownego ZERO.
 */
export function buildSteps(keys: MeasureKey[]): WizardStep[] {
  const steps: WizardStep[] = [POWER_ON, FILL, ZERO];
  keys.forEach((k, i) => {
    if (i > 0) steps.push(FRESH_SAMPLE);
    steps.push(...MEASURE_STEPS[k]);
  });
  return steps;
}

export const FULL_TEST_KEYS: MeasureKey[] = ["ph", "chlorine", "alkalinity", "cya"];
