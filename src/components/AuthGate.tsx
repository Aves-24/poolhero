"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "ph_auth";
const VALID_LOGIN = "rafal";
const VALID_PASSWORD = "Pool123!";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem(SESSION_KEY) === "1";
    setAuthed(ok);
    setChecked(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login.trim().toLowerCase() === VALID_LOGIN && password === VALID_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
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

          <button className="btn-primary w-full mt-2" type="submit">
            Zaloguj się
          </button>
        </form>
      </div>
    </div>
  );
}
