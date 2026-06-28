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

  useEffect(() => {
    load();
  }, []);

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
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-800">Wybierz profil basenu</h1>
        <p className="text-slate-500 mt-1">Każdy profil ma własną objętość wody i historię testów.</p>
      </section>

      {error && <div className="card border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="text-slate-400">Ładowanie…</div>
        ) : users.length === 0 ? (
          <div className="text-slate-400 col-span-full">Brak profili. Dodaj pierwszy poniżej.</div>
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

      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-3">➕ Dodaj nowy profil</h2>
        <form onSubmit={addUser} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <label className="label">Nazwa profilu</label>
            <input className="input" placeholder="np. Basen ogród" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Objętość wody (litry)</label>
            <input
              className="input sm:w-44"
              type="number"
              min={1}
              placeholder="np. 24000"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={saving}>
            {saving ? "Zapisuję…" : "Dodaj"}
          </button>
        </form>
      </section>
    </div>
  );
}
