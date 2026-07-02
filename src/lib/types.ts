export type FilterType = "sand" | "filterballs" | "cartridge" | "de";
export type SanitizerType = "chlorine" | "active_oxygen" | "bromine" | "phmb";
export type UsageLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  /** E-mail konta Google właściciela profilu (do rozdzielenia danych między użytkownikami) */
  ownerEmail?: string;
  name: string;
  /** Objętość wody w basenie w litrach */
  volumeLiters: number;
  createdAt: string;
  /** Typ filtra */
  filterType?: FilterType;
  /** Środek dezynfekujący */
  sanitizer?: SanitizerType;
  /** Czy basen jest przykrywany */
  covered?: boolean;
  /** Czy basen jest podgrzewany */
  heated?: boolean;
  /** Intensywność użytkowania */
  usage?: UsageLevel;
  /** Własny opis preparatu dezynfekującego (np. "HTH Granulat 90%", "Bayrol Chlorifix") */
  sanitizerNote?: string;
  /** Miasto, w którym stoi basen (do sprawdzania pogody w prompcie AI) */
  city?: string;
  /** URL miniaturki z Google Drive */
  photoUrl?: string;
}

export interface TestResult {
  id: string;
  userId: string;
  createdAt: string;
  /** pH (Phenol Red) */
  ph?: number;
  /** Chlor wolny [mg/l] (DPD No. 1) */
  freeCl?: number;
  /** Chlor całkowity [mg/l] (DPD No. 3) */
  totalCl?: number;
  /** Chlor związany [mg/l] = całkowity - wolny (wyliczane) */
  combinedCl?: number;
  /** Zasadowość / kwasowość węglanowa [mg/l CaCO3] (Alkalinity-M) */
  alkalinity?: number;
  /** Kwas cyjanurowy / stabilizator [mg/l] (CYA Test) */
  cya?: number;
  /** Temperatura wody [°C] — opcjonalna, pomaga w analizie (rozkład chloru, komfort) */
  waterTemp?: number;
  note?: string;
}

export type NewUser = Omit<User, "id" | "createdAt">;
export type NewTest = Omit<TestResult, "id" | "createdAt" | "combinedCl">;
