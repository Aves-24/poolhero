import { google } from "googleapis";
import { promises as fs } from "fs";
import path from "path";
import type { User, TestResult, NewUser, NewTest } from "./types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = process.env.GOOGLE_PRIVATE_KEY;

const USERS_TAB = "Users";
const TESTS_TAB = "Tests";

export const useSheets = Boolean(SHEET_ID && SA_EMAIL && SA_KEY);

function id(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function withCombined(t: TestResult): TestResult {
  if (t.combinedCl === undefined && t.totalCl !== undefined && t.freeCl !== undefined) {
    t.combinedCl = Math.round((t.totalCl - t.freeCl) * 100) / 100;
  }
  return t;
}

/* ----------------------------- Google Sheets ----------------------------- */

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: (SA_KEY || "").replace(/^"/, "").replace(/"$/, "").replace(/\\n/g, "\n").trim(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const USERS_HEADER = ["id", "name", "volumeLiters", "createdAt", "filterType", "sanitizer", "covered", "heated", "usage", "sanitizerNote"];
const TESTS_HEADER = ["id", "userId", "createdAt", "ph", "freeCl", "totalCl", "combinedCl", "alkalinity", "cya", "note"];

let initialized = false;

/** Tworzy zakładki i nagłówki, jeśli ich brakuje */
async function ensureSheets() {
  if (initialized) return;
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const titles = (meta.data.sheets || []).map((s) => s.properties?.title);

  const toCreate: string[] = [];
  if (!titles.includes(USERS_TAB)) toCreate.push(USERS_TAB);
  if (!titles.includes(TESTS_TAB)) toCreate.push(TESTS_TAB);

  if (toCreate.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: toCreate.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
    if (toCreate.includes(USERS_TAB)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${USERS_TAB}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [USERS_HEADER] },
      });
    }
    if (toCreate.includes(TESTS_TAB)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${TESTS_TAB}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [TESTS_HEADER] },
      });
    }
  }
  initialized = true;
}

async function sheetId(title: string): Promise<number> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const found = (meta.data.sheets || []).find((s) => s.properties?.title === title);
  if (!found?.properties?.sheetId && found?.properties?.sheetId !== 0) {
    throw new Error(`Brak zakładki ${title}`);
  }
  return found.properties.sheetId as number;
}

/* ------------------------------ JSON fallback ----------------------------- */

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DbShape {
  users: User[];
  tests: TestResult[];
}

async function readJson(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return { users: parsed.users || [], tests: parsed.tests || [] };
  } catch {
    return { users: [], tests: [] };
  }
}

async function writeJson(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

/* ------------------------------- Public API ------------------------------- */

export async function getUsers(): Promise<User[]> {
  if (!useSheets) {
    const db = await readJson();
    return db.users;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_TAB}!A2:J`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0]),
      name: String(r[1] ?? ""),
      volumeLiters: num(r[2]) ?? 0,
      createdAt: String(r[3] ?? ""),
      filterType: (r[4] as User["filterType"]) || undefined,
      sanitizer: (r[5] as User["sanitizer"]) || undefined,
      covered: r[6] === true || r[6] === "true" || r[6] === 1 || r[6] === "1" ? true : r[6] === false || r[6] === "false" ? false : undefined,
      heated: r[7] === true || r[7] === "true" || r[7] === 1 || r[7] === "1" ? true : r[7] === false || r[7] === "false" ? false : undefined,
      usage: (r[8] as User["usage"]) || undefined,
      sanitizerNote: r[9] ? String(r[9]) : undefined,
    }));
}

export async function addUser(input: NewUser): Promise<User> {
  const user: User = { id: id(), name: input.name, volumeLiters: input.volumeLiters, createdAt: new Date().toISOString(), filterType: input.filterType, sanitizer: input.sanitizer, covered: input.covered, heated: input.heated, usage: input.usage, sanitizerNote: input.sanitizerNote };
  if (!useSheets) {
    const db = await readJson();
    db.users.push(user);
    await writeJson(db);
    return user;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${USERS_TAB}!A:J`,
    valueInputOption: "RAW",
    requestBody: { values: [[user.id, user.name, user.volumeLiters, user.createdAt, user.filterType ?? "", user.sanitizer ?? "", user.covered ?? "", user.heated ?? "", user.usage ?? "", user.sanitizerNote ?? ""]] },
  });
  return user;
}

export async function updateUser(userId: string, patch: Partial<NewUser>): Promise<User | null> {
  if (!useSheets) {
    const db = await readJson();
    const u = db.users.find((x) => x.id === userId);
    if (!u) return null;
    if (patch.name !== undefined) u.name = patch.name;
    if (patch.volumeLiters !== undefined) u.volumeLiters = patch.volumeLiters;
    await writeJson(db);
    return u;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${USERS_TAB}!A2:J`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === userId);
  if (idx < 0) return null;
  const row = rows[idx];
  const boolPatch = (patchVal: boolean | undefined, rowVal: unknown): boolean | undefined => {
    if (patchVal !== undefined) return patchVal;
    if (rowVal === true || rowVal === "true" || rowVal === 1 || rowVal === "1") return true;
    if (rowVal === false || rowVal === "false") return false;
    return undefined;
  };
  const updated: User = {
    id: userId,
    name: patch.name ?? String(row[1] ?? ""),
    volumeLiters: patch.volumeLiters ?? num(row[2]) ?? 0,
    createdAt: String(row[3] ?? ""),
    filterType: (patch.filterType !== undefined ? patch.filterType : (row[4] as User["filterType"])) || undefined,
    sanitizer: (patch.sanitizer !== undefined ? patch.sanitizer : (row[5] as User["sanitizer"])) || undefined,
    covered: boolPatch(patch.covered, row[6]),
    heated: boolPatch(patch.heated, row[7]),
    usage: (patch.usage !== undefined ? patch.usage : (row[8] as User["usage"])) || undefined,
    sanitizerNote: patch.sanitizerNote !== undefined ? patch.sanitizerNote || undefined : (row[9] ? String(row[9]) : undefined),
  };
  const rowNumber = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${USERS_TAB}!A${rowNumber}:J${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[updated.id, updated.name, updated.volumeLiters, updated.createdAt, updated.filterType ?? "", updated.sanitizer ?? "", updated.covered ?? "", updated.heated ?? "", updated.usage ?? "", updated.sanitizerNote ?? ""]] },
  });
  return updated;
}

export async function deleteUser(userId: string): Promise<void> {
  if (!useSheets) {
    const db = await readJson();
    db.users = db.users.filter((u) => u.id !== userId);
    db.tests = db.tests.filter((t) => t.userId !== userId);
    await writeJson(db);
    return;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${USERS_TAB}!A2:D`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === userId);
  if (idx < 0) return;
  const usersSheetId = await sheetId(USERS_TAB);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId: usersSheetId, dimension: "ROWS", startIndex: idx + 1, endIndex: idx + 2 },
          },
        },
      ],
    },
  });
}

export async function getTests(userId: string): Promise<TestResult[]> {
  if (!useSheets) {
    const db = await readJson();
    return db.tests.filter((t) => t.userId === userId).map(withCombined).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TESTS_TAB}!A2:J`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[0] && String(r[1]) === userId)
    .map((r) =>
      withCombined({
        id: String(r[0]),
        userId: String(r[1]),
        createdAt: String(r[2] ?? ""),
        ph: num(r[3]),
        freeCl: num(r[4]),
        totalCl: num(r[5]),
        combinedCl: num(r[6]),
        alkalinity: num(r[7]),
        cya: num(r[8]),
        note: r[9] ? String(r[9]) : undefined,
      }),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteTest(testId: string): Promise<void> {
  if (!useSheets) {
    const db = await readJson();
    db.tests = db.tests.filter((t) => t.id !== testId);
    await writeJson(db);
    return;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TESTS_TAB}!A2:A`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === testId);
  if (idx < 0) return;
  const testsSheetId = await sheetId(TESTS_TAB);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId: testsSheetId, dimension: "ROWS", startIndex: idx + 1, endIndex: idx + 2 },
          },
        },
      ],
    },
  });
}

export async function addTest(input: NewTest): Promise<TestResult> {
  const test: TestResult = withCombined({
    id: id(),
    userId: input.userId,
    createdAt: new Date().toISOString(),
    ph: input.ph,
    freeCl: input.freeCl,
    totalCl: input.totalCl,
    alkalinity: input.alkalinity,
    cya: input.cya,
    note: input.note,
  });
  if (!useSheets) {
    const db = await readJson();
    db.tests.push(test);
    await writeJson(db);
    return test;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TESTS_TAB}!A:J`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          test.id,
          test.userId,
          test.createdAt,
          test.ph ?? "",
          test.freeCl ?? "",
          test.totalCl ?? "",
          test.combinedCl ?? "",
          test.alkalinity ?? "",
          test.cya ?? "",
          test.note ?? "",
        ],
      ],
    },
  });
  return test;
}
