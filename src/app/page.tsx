"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd ładowania");
      setUsers(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, volumeLiters: Number(volume) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się dodać profilu");
      setName("");
      setVolume("");
      setUsers((u) => [...u, data]);
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(id: string) {
    if (!confirm("Usunąć ten profil wraz z historią testów?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((u) => u.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6 pb-24">
      <section>
        <h1 className="text-2xl font-bold text-slate-800">Wybierz profil basenu</h1>
        <p className="text-slate-500 mt-1">Każdy profil ma własną objętość wody i historię testów.</p>
      </section>

      {error && <div className="card border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="text-slate-400">Ładowanie…</div>
        ) : users.length === 0 ? (
          <div className="text-slate-400 col-span-full">Brak profili. Dodaj pierwszy przyciskiem + poniżej.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="card p-4 flex items-center gap-3">
              <button onClick={() => router.push(`/pool/${u.id}`)} className="flex-1 text-left">
                <div className="font-semibold text-slate-800">{u.name}</div>
                <div className="text-sm text-slate-500">{u.volumeLiters.toLocaleString("pl-PL")} l wody</div>
              </button>
              <button onClick={() => removeUser(u.id)} className="btn-ghost text-rose-500 px-2" title="Usuń">
                ✕
              </button>
            </div>
          ))
        )}
      </section>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-start sm:justify-start p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="card p-5 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Nowy profil basenu</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost px-2 text-slate-400">✕</button>
            </div>
            <form onSubmit={addUser} className="space-y-3">
              <div>
                <label className="label">Nazwa profilu</label>
                <input
                  className="input"
                  placeholder="np. Basen ogród"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Objętość wody (litry)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  placeholder="np. 24000"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full mt-1" disabled={saving}>
                {saving ? "Zapisuję…" : "Dodaj profil"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB — przycisk + w lewym dolnym rogu */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-pool-600 text-white shadow-lg hover:bg-pool-700 active:scale-95 transition flex items-center justify-center text-3xl leading-none"
        title="Dodaj profil"
      >
        +
      </button>
    </div>
  );
}
