import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoolHero — analiza wody basenowej",
  description: "Aplikacja do obsługi fotometru PoolLab 1.0: testy wody, analiza i dawkowanie chemii.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0084cd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <header className="border-b border-pool-100 bg-white/70 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <a href="/" className="font-bold text-lg text-pool-800">
              PoolHero
            </a>
            <span className="ml-auto text-xs text-slate-400">PoolLab 1.0</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-slate-400">
          Dawki są przybliżone — zawsze sprawdzaj etykietę preparatu. Normy: basen prywatny.
        </footer>
      </body>
    </html>
  );
}
