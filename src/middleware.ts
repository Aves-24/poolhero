import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "ph_session";

/**
 * Chroni wszystkie trasy /api/* poza logowaniem.
 * Bez ważnego ciasteczka sesji API zwraca 401 — dane są niedostępne
 * dla kogokolwiek, kto nie jest zalogowany.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Endpoint logowania musi być dostępny bez sesji
  if (pathname.startsWith("/api/login")) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = process.env.AUTH_SECRET || "poolhero-insecure-default-change-me";

  if (token !== expected) {
    return NextResponse.json({ error: "Brak autoryzacji — zaloguj się." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
