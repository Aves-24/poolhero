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

/** E-mail przejmujący wszystkie istniejące (bez właściciela) profile — migracja starych danych. */
const LEGACY_OWNER = (process.env.LEGACY_OWNER_EMAIL || "").toLowerCase();

/** Właściciel wiersza: kolumna ownerEmail, a jeśli pusta — właściciel „legacy". */
function effectiveOwner(rowOwner: unknown): string {
  const v = rowOwner ? String(rowOwner).toLowerCase() : "";
  return v || LEGACY_OWNER;
}

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

const USERS_HEADER = ["id", "name", "volumeLiters", "createdAt", "filterType", "sanitizer", "covered", "heated", "usage", "sanitizerNote", "city", "photoUrl", "ownerEmail"];
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

function mapUserRow(r: unknown[]): User {
  return {
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
    city: r[10] ? String(r[10]) : undefined,
    photoUrl: r[11] ? String(r[11]) : undefined,
    ownerEmail: effectiveOwner(r[12]) || undefined,
  };
}

function mapTestRow(r: unknown[]): TestResult {
  return withCombined({
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
  });
}

/* ------------------------------- Users API ------------------------------- */

export async function getUsers(owner: string): Promise<User[]> {
  const o = owner.toLowerCase();
  if (!useSheets) {
    const db = await readJson();
    return db.users.filter((u) => effectiveOwner(u.ownerEmail) === o);
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_TAB}!A2:M`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = res.data.values || [];
  return rows.filter((r) => r[0] && effectiveOwner(r[12]) === o).map(mapUserRow);
}

export async function addUser(input: NewUser, owner: string): Promise<User> {
  const user: User = { id: id(), name: input.name, volumeLiters: input.volumeLiters, createdAt: new Date().toISOString(), filterType: input.filterType, sanitizer: input.sanitizer, covered: input.covered, heated: input.heated, usage: input.usage, sanitizerNote: input.sanitizerNote, city: input.city, photoUrl: input.photoUrl, ownerEmail: owner.toLowerCase() };
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
    range: `${USERS_TAB}!A:M`,
    valueInputOption: "RAW",
    requestBody: { values: [[user.id, user.name, user.volumeLiters, user.createdAt, user.filterType ?? "", user.sanitizer ?? "", user.covered ?? "", user.heated ?? "", user.usage ?? "", user.sanitizerNote ?? "", user.city ?? "", user.photoUrl ?? "", user.ownerEmail ?? ""]] },
  });
  return user;
}

/** Aktualizuje profil — TYLKO jeśli należy do `owner`. Zwraca null gdy nie znaleziono / nie jest właścicielem. */
export async function updateUser(userId: string, patch: Partial<NewUser>, owner: string): Promise<User | null> {
  const o = owner.toLowerCase();
  if (!useSheets) {
    const db = await readJson();
    const u = db.users.find((x) => x.id === userId);
    if (!u || effectiveOwner(u.ownerEmail) !== o) return null;
    if (patch.name !== undefined) u.name = patch.name;
    if (patch.volumeLiters !== undefined) u.volumeLiters = patch.volumeLiters;
    if (patch.filterType !== undefined) u.filterType = patch.filterType;
    if (patch.sanitizer !== undefined) u.sanitizer = patch.sanitizer;
    if (patch.covered !== undefined) u.covered = patch.covered;
    if (patch.heated !== undefined) u.heated = patch.heated;
    if (patch.usage !== undefined) u.usage = patch.usage;
    if (patch.sanitizerNote !== undefined) u.sanitizerNote = patch.sanitizerNote || undefined;
    if (patch.city !== undefined) u.city = patch.city || undefined;
    if (patch.photoUrl !== undefined) u.photoUrl = patch.photoUrl || undefined;
    u.ownerEmail = o;
    await writeJson(db);
    return u;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${USERS_TAB}!A2:M`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === userId);
  if (idx < 0) return null;
  const row = rows[idx];
  if (effectiveOwner(row[12]) !== o) return null;
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
    city: patch.city !== undefined ? patch.city || undefined : (row[10] ? String(row[10]) : undefined),
    photoUrl: patch.photoUrl !== undefined ? patch.photoUrl || undefined : (row[11] ? String(row[11]) : undefined),
    ownerEmail: o,
  };
  const rowNumber = idx + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${USERS_TAB}!A${rowNumber}:M${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[updated.id, updated.name, updated.volumeLiters, updated.createdAt, updated.filterType ?? "", updated.sanitizer ?? "", updated.covered ?? "", updated.heated ?? "", updated.usage ?? "", updated.sanitizerNote ?? "", updated.city ?? "", updated.photoUrl ?? "", updated.ownerEmail ?? ""]] },
  });
  return updated;
}

/** Usuwa profil i jego testy — TYLKO jeśli należy do `owner`. Zwraca true gdy usunięto. */
export async function deleteUser(userId: string, owner: string): Promise<boolean> {
  const o = owner.toLowerCase();
  if (!useSheets) {
    const db = await readJson();
    const u = db.users.find((x) => x.id === userId);
    if (!u || effectiveOwner(u.ownerEmail) !== o) return false;
    db.users = db.users.filter((x) => x.id !== userId);
    db.tests = db.tests.filter((t) => t.userId !== userId);
    await writeJson(db);
    return true;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${USERS_TAB}!A2:M`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === userId);
  if (idx < 0) return false;
  if (effectiveOwner(rows[idx][12]) !== o) return false;
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
  return true;
}

/* ------------------------------- Tests API ------------------------------- */
/* Własność testu = własność jego profilu (parent user). */

export async function getAllTests(owner: string): Promise<TestResult[]> {
  const owned = new Set((await getUsers(owner)).map((u) => u.id));
  if (!useSheets) {
    const db = await readJson();
    return db.tests.filter((t) => owned.has(t.userId)).map(withCombined).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TESTS_TAB}!A2:J`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  return rows
    .filter((r) => r[0] && owned.has(String(r[1])))
    .map(mapTestRow)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTests(userId: string, owner: string): Promise<TestResult[]> {
  const owned = new Set((await getUsers(owner)).map((u) => u.id));
  if (!owned.has(userId)) return [];
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
    .map(mapTestRow)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Dodaje test — TYLKO jeśli profil należy do `owner`. Zwraca null gdy brak uprawnień. */
export async function addTest(input: NewTest, owner: string): Promise<TestResult | null> {
  const owned = new Set((await getUsers(owner)).map((u) => u.id));
  if (!owned.has(input.userId)) return null;

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

/** Usuwa test — TYLKO jeśli jego profil należy do `owner`. Zwraca true gdy usunięto. */
export async function deleteTest(testId: string, owner: string): Promise<boolean> {
  const owned = new Set((await getUsers(owner)).map((u) => u.id));
  if (!useSheets) {
    const db = await readJson();
    const t = db.tests.find((x) => x.id === testId);
    if (!t || !owned.has(t.userId)) return false;
    db.tests = db.tests.filter((x) => x.id !== testId);
    await writeJson(db);
    return true;
  }
  await ensureSheets();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${TESTS_TAB}!A2:B`, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = res.data.values || [];
  const idx = rows.findIndex((r) => String(r[0]) === testId);
  if (idx < 0) return false;
  if (!owned.has(String(rows[idx][1]))) return false;
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
  return true;
}
