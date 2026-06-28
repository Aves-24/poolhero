export interface User {
  id: string;
  name: string;
  /** Objętość wody w basenie w litrach */
  volumeLiters: number;
  createdAt: string;
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
  note?: string;
}

export type NewUser = Omit<User, "id" | "createdAt">;
export type NewTest = Omit<TestResult, "id" | "createdAt" | "combinedCl">;
