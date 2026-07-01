"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { TestResult, User } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [lastTestByUser, setLastTestByUser] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  function lastTestLabel(createdAt: string | undefined): string {
    if (!createdAt) return t("home.noTests");
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
    if (days === 0) return t("home.lastTestToday");
    if (days === 1) return t("home.lastTestOneDay");
    return t("home.lastTestDaysAgo", { n: days });
  }

  async function load() {
    setLoading(true);
    try {
      const [usersRes, testsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/tests"),
      ]);
      const usersData: User[] = await usersRes.json();
      const testsData: TestResult[] = await testsRes.json();
      if (!usersRes.ok) throw new Error((usersData as unknown as { error: string }).error || t("home.loadError"));

      setUsers(usersData);

      // Testy są już posortowane malejąco — pierwszy trafiony dla każdego userId to najnowszy
      const map: Record<string, string> = {};
      testsData.forEach((tst) => {
        if (!map[tst.userId]) map[tst.userId] = tst.createdAt;
      });
      setLastTestByUser(map);
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
      if (!res.ok) throw new Error(data.error || t("home.addError"));
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

  return (
    <div className="space-y-6 pb-24">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("home.title")}</h1>
        </div>
        {session?.user && (
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-slate-400 max-w-[10rem] truncate">{session.user.email}</div>
            <button onClick={() => signOut()} className="text-xs text-slate-500 hover:text-rose-600 transition mt-0.5">
              {t("home.signOut")}
            </button>
          </div>
        )}
      </section>

      {error && <div className="card border-rose-200 bg-rose-50 text-rose-700 p-3 text-sm">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="text-slate-400">{t("home.loading")}</div>
        ) : users.length === 0 ? (
          <div className="text-slate-400 col-span-full">{t("home.noProfiles")}</div>
        ) : (
          users.map((u) => (
            <button
              key={u.id}
              onClick={() => router.push(`/pool/${u.id}`)}
              className="card p-4 flex items-center gap-3 text-left hover:border-pool-300 transition w-full"
            >
              {u.photoUrl ? (
                <img
                  src={u.photoUrl}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-pool-100 flex items-center justify-center flex-shrink-0 text-pool-600 text-xl font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-800">{u.name}</div>
                <div className="text-sm text-slate-500">{lastTestLabel(lastTestByUser[u.id])}</div>
              </div>
            </button>
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
              <h2 className="font-semibold text-slate-800">{t("home.newProfileTitle")}</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost px-2 text-slate-400">✕</button>
            </div>
            <form onSubmit={addUser} className="space-y-3">
              <div>
                <label className="label">{t("home.profileName")}</label>
                <input
                  className="input"
                  placeholder={t("home.profileNamePlaceholder")}
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t("home.volumeLabel")}</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  placeholder={t("home.volumePlaceholder")}
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>
              <button className="btn-primary w-full mt-1" disabled={saving}>
                {saving ? t("home.saving") : t("home.addProfile")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-pool-600 text-white shadow-lg hover:bg-pool-700 active:scale-95 transition flex items-center justify-center text-3xl leading-none"
        title={t("home.addProfile")}
      >
        +
      </button>
    </div>
  );
}
