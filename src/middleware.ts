import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Chroni wszystkie trasy /api/* poza samym mechanizmem logowania (/api/auth/*).
 * Bez ważnej sesji Google API zwraca 401 — dane są niedostępne dla niezalogowanych.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Endpointy NextAuth (logowanie, callback, sesja) muszą być dostępne
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Zaloguj się, aby uzyskać dostęp." }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
