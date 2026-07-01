"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { FilterType, SanitizerType, TestResult, UsageLevel, User } from "@/lib/types";
import { FILTER_LABELS, SANITIZER_LABELS, USAGE_LABELS } from "@/lib/types";
import { analyzeTest, statusColor, statusLabel } from "@/lib/water";
import TestWizard from "@/components/TestWizard";
import ResultsTable from "@/components/ResultsTable";

type Tab = "test" | "settings" | "history";

export default function PoolPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [tab, setTab] = useState<Tab>("test");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTest, setOpenTest] = useState<TestResult | null>(null);

  // ustawienia
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [filterType, setFilterType] = useState<FilterType | "">("");
  const [sanitizer, setSanitizer] = useState<SanitizerType | "">("");
  const [covered, setCovered] = useState<"" | "true" | "false">("");
  const [heated, setHeated] = useState<"" | "true" | "false">("");
  const [usage, setUsage] = useState<UsageLevel | "">("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  function applyUser(u: User) {
    setName(u.name);
    setVolume(String(u.volumeLiters));
    setFilterType(u.filterType ?? "");
    setSanitizer(u.sanitizer ?? "");
    setCovered(u.covered === true ? "true" : u.covered === false ? "false" : "");
    setHeated(u.heated === true ? "true" : u.heated === false ? "false" : "");
    setUsage(u.usage ?? "");
  }

  async function loadUser() {
    const res = await fetch("/api/users");
    const data: User[] = await res.json();
    const u = data.find((x) => x.id === userId) ?? null;
    setUser(u);
    if (u) applyUser(u);
  }

  async function loadTests() {
    const res = await fetch(`/api/tests?userId=${userId}`);
    const data = await res.json();
    if (res.ok) setTests(data);
  }

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadUser(), loadTests()]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSavedMsg(false);
    setError(null);
    try {
      const body: Record<string, unknown> = { name, volumeLiters: Number(volume) };
      if (filterType) body.filterType = filterType;
      if (sanitizer) body.sanitizer = sanitizer;
      if (covered !== "") body.covered = covered === "true";
      if (heated !== "") body.heated = heated === "true";
      if (usage) body.usage = usage;

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się zapisać");
      setUser(data);
      setSavedMsg(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) return <div className="text-slate-400">Ładowanie…</div>;
  if (!user)
    return (
      <div className="space-y-3">
        <div className="card border-rose-200 bg-rose-50 text-rose-700 p-4">Nie znaleziono profilu.</div>
        <button onClick={() => router.push("/")} className="btn-secondary">← Profile</button>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="btn-ghost px-2" title="Profile">←</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
          <p className="text-slate-500 text-sm">{user.volumeLiters.toLocaleString("pl-PL")} l wody</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm">
        {(
          [
            ["test", "🧪 Test"],
            ["history", "📜 Historia"],
            ["settings", "⚙️ Ustawienia"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setOpenTest(null); }}
            className={`flex-1 rounded-lg py-2 font-medium transition ${
              tab === key ? "bg-white text-pool-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="card border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}

      {tab === "test" && <TestWizard user={user} onSaved={loadTests} />}

      {tab === "settings" && (
        <form onSubmit={saveSettings} className="card p-5 space-y-5">
          <h2 className="font-semibold text-slate-800">Ustawienia profilu (Einstellungen)</h2>

          {/* Podstawowe */}
          <div className="space-y-3">
            <div>
              <label className="label">Nazwa profilu</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Objętość wody w basenie (litry)</label>
              <input className="input" type="number" min={1} value={volume} onChange={(e) => setVolume(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Np. basen 5×3×1,4 m ≈ 21 000 l</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Techniczne — dla Gemini */}
          <div>
            <p className="text-xs font-semibold text-pool-600 uppercase tracking-wide mb-3">Dane techniczne basenu (dla analizy AI)</p>
            <div className="space-y-3">
              <div>
                <label className="label">Typ filtra</label>
                <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType | "")}>
                  <option value="">— nie podano —</option>
                  {(Object.entries(FILTER_LABELS) as [FilterType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Środek dezynfekujący</label>
                <select className="input" value={sanitizer} onChange={(e) => setSanitizer(e.target.value as SanitizerType | "")}>
                  <option value="">— nie podano —</option>
                  {(Object.entries(SANITIZER_LABELS) as [SanitizerType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Intensywność użytkowania</label>
                <select className="input" value={usage} onChange={(e) => setUsage(e.target.value as UsageLevel | "")}>
                  <option value="">— nie podano —</option>
                  {(Object.entries(USAGE_LABELS) as [UsageLevel, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Przykrycie basenu</label>
                  <select className="input" value={covered} onChange={(e) => setCovered(e.target.value as "" | "true" | "false")}>
                    <option value="">— nie podano —</option>
                    <option value="true">Tak — przykrywany</option>
                    <option value="false">Nie — odkryty</option>
                  </select>
                </div>
                <div>
                  <label className="label">Podgrzewanie wody</label>
                  <select className="input" value={heated} onChange={(e) => setHeated(e.target.value as "" | "true" | "false")}>
                    <option value="">— nie podano —</option>
                    <option value="true">Tak — podgrzewany</option>
                    <option value="false">Nie — bez ogrzewania</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button className="btn-primary" disabled={savingSettings}>
              {savingSettings ? "Zapisuję…" : "Zapisz ustawienia"}
            </button>
            {savedMsg && <span className="text-emerald-600 text-sm">Zapisano ✓</span>}
          </div>
        </form>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {openTest ? (
            <div className="space-y-3">
              <button onClick={() => setOpenTest(null)} className="btn-ghost text-sm">← Lista testów</button>
              <div className="text-sm text-slate-500">{new Date(openTest.createdAt).toLocaleString("pl-PL")}</div>
              <ResultsTable test={openTest} volumeLiters={user.volumeLiters} user={user} />
            </div>
          ) : tests.length === 0 ? (
            <div className="text-slate-400">Brak zapisanych testów. Wykonaj pierwszy w zakładce „Test".</div>
          ) : (
            tests.map((t) => {
              const rows = analyzeTest(t, user.volumeLiters);
              const measured = rows.filter((r) => r.status !== "missing");
              const problems = measured.filter((r) => r.status !== "ok");
              return (
                <button key={t.id} onClick={() => setOpenTest(t)} className="card p-4 w-full text-left hover:border-pool-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{new Date(t.createdAt).toLocaleString("pl-PL")}</span>
                    <span className={`text-xs rounded-full border px-2 py-0.5 ${problems.length === 0 ? statusColor("ok") : statusColor("high")}`}>
                      {measured.length === 0 ? "—" : problems.length === 0 ? "Wszystko OK" : `${problems.length} do poprawy`}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    {rows.filter((r) => r.status !== "missing").map((r) => (
                      <span key={r.key} className={`rounded-full border px-2 py-0.5 ${statusColor(r.status)}`}>
                        {r.label}: {r.value} {statusLabel(r.status) !== "OK" ? `(${statusLabel(r.status)})` : "✓"}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
