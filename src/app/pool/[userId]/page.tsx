"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { FilterType, TestResult, UsageLevel, User } from "@/lib/types";
import { FILTER_LABELS, USAGE_LABELS } from "@/lib/types";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ustawienia
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [filterType, setFilterType] = useState<FilterType | "">("");
  const [sanitizerNote, setSanitizerNote] = useState("");
  const [covered, setCovered] = useState<"" | "true" | "false">("");
  const [heated, setHeated] = useState<"" | "true" | "false">("");
  const [usage, setUsage] = useState<UsageLevel | "">("");
  const [city, setCity] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  function applyUser(u: User) {
    setName(u.name);
    setVolume(String(u.volumeLiters));
    setFilterType(u.filterType ?? "");
    setSanitizerNote(u.sanitizerNote ?? "");
    setCovered(u.covered === true ? "true" : u.covered === false ? "false" : "");
    setHeated(u.heated === true ? "true" : u.heated === false ? "false" : "");
    setUsage(u.usage ?? "");
    setCity(u.city ?? "");
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
      if (covered !== "") body.covered = covered === "true";
      if (heated !== "") body.heated = heated === "true";
      if (usage) body.usage = usage;
      body.sanitizerNote = sanitizerNote;
      body.city = city;

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

  async function handleDeleteTest(testId: string) {
    if (!window.confirm("Usunąć ten wpis z historii?")) return;
    setDeletingId(testId);
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Błąd usuwania");
      }
      if (openTest?.id === testId) setOpenTest(null);
      setTests((prev) => prev.filter((t) => t.id !== testId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  function lastTestLabel(ts: TestResult[]): string {
    if (ts.length === 0) return "Brak testów";
    const days = Math.floor((Date.now() - new Date(ts[0].createdAt).getTime()) / 86_400_000);
    if (days === 0) return "Ostatni test: dzisiaj";
    if (days === 1) return "Ostatni test: 1 dzień temu";
    if (days < 5) return `Ostatni test: ${days} dni temu`;
    return `Ostatni test: ${days} dni temu`;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`/api/users/${userId}/photo`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd uploadu");
      setUser(data.user);
    } catch (err) {
      setPhotoError((err as Error).message);
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeletePhoto() {
    if (!window.confirm("Usunąć zdjęcie?")) return;
    setPhotoUploading(true);
    setPhotoError(null);
    try {
      const res = await fetch(`/api/users/${userId}/photo`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd usuwania");
      setUser(data.user);
    } catch (err) {
      setPhotoError((err as Error).message);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleDeleteUser() {
    if (!window.confirm(`Usunąć profil „${user?.name}" wraz z całą historią testów? Tej operacji nie można cofnąć.`)) return;
    setDeletingUser(true);
    try {
      await fetch(`/api/users/${userId}`, { method: "DELETE" });
      router.push("/");
    } catch {
      setDeletingUser(false);
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
          <p className="text-slate-500 text-sm">{lastTestLabel(tests)}</p>
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
        <div className="space-y-5">
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
                <input
                  className="input"
                  placeholder="Np. HTH Granulat 90%, Bayrol Chlorifix, aktywny tlen…"
                  value={sanitizerNote}
                  onChange={(e) => setSanitizerNote(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Wpisz raz — zostanie zapamiętane i dołączone do analizy AI.</p>
              </div>

              <div>
                <label className="label">Miasto (lokalizacja basenu)</label>
                <input
                  className="input"
                  placeholder="Np. Warszawa, Kraków, Berlin…"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">Gemini pobierze pogodę z ostatnich 7 dni i uwzględni ją w analizie.</p>
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

        {/* Zdjęcie profilowe */}
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold text-pool-600 uppercase tracking-wide">Zdjęcie profilowe</p>
          <div className="flex items-center gap-4">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-pool-100 flex items-center justify-center text-pool-600 text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-2">
              <label className={`btn-secondary text-sm cursor-pointer ${photoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                {photoUploading ? "Wysyłam…" : user.photoUrl ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
              </label>
              {user.photoUrl && (
                <button onClick={handleDeletePhoto} disabled={photoUploading} className="block text-xs text-rose-500 hover:text-rose-700 transition">
                  Usuń zdjęcie
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">Zdjęcie zapisuje się na Google Drive. Wyświetlane jako miniaturka na stronie głównej.</p>
          {photoError && <p className="text-xs text-rose-600">{photoError}</p>}
        </div>

        {/* Usuń profil */}
        <div className="card p-5 border-rose-100">
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-3">Strefa niebezpieczna</p>
          <button
            onClick={handleDeleteUser}
            disabled={deletingUser}
            className="text-sm text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg px-4 py-2 border border-rose-200 transition disabled:opacity-50"
          >
            {deletingUser ? "Usuwam…" : "Usuń profil i całą historię testów"}
          </button>
          <p className="text-xs text-slate-400 mt-2">Tej operacji nie można cofnąć.</p>
        </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {openTest ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button onClick={() => setOpenTest(null)} className="btn-ghost text-sm">← Lista testów</button>
                <button
                  onClick={() => handleDeleteTest(openTest.id)}
                  disabled={deletingId === openTest.id}
                  className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                >
                  {deletingId === openTest.id ? "Usuwam…" : "🗑 Usuń wpis"}
                </button>
              </div>
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
                <div key={t.id} className="card p-4 hover:border-pool-300 transition relative">
                  <button onClick={() => setOpenTest(t)} className="w-full text-left">
                    <div className="flex items-center justify-between pr-8">
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTest(t.id); }}
                    disabled={deletingId === t.id}
                    className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition text-lg leading-none disabled:opacity-40"
                    title="Usuń wpis"
                  >
                    {deletingId === t.id ? "…" : "✕"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
