"use client";

import { useEffect, useState } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/login")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false))
      .finally(() => setChecked(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!checked) return null;

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <span className="text-5xl mb-3">💧</span>
          <h1 className="text-2xl font-bold text-pool-800">PoolHero</h1>
          <p className="text-slate-500 text-sm mt-1">Zaloguj się, aby kontynuować</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Login</label>
            <input
              className="input"
              autoComplete="username"
              autoFocus
              value={login}
              onChange={(e) => { setLogin(e.target.value); setError(false); }}
            />
          </div>
          <div>
            <label className="label">Hasło</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
            />
          </div>

          {error && (
            <div className="text-rose-600 text-sm text-center">
              Nieprawidłowy login lub hasło.
            </div>
          )}

          <button className="btn-primary w-full mt-2" type="submit" disabled={submitting}>
            {submitting ? "Logowanie…" : "Zaloguj się"}
          </button>
        </form>
      </div>
    </div>
  );
}
