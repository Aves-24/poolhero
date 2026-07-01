import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const AUTH_COOKIE = "ph_session";
const APP_LOGIN = (process.env.APP_LOGIN || "rafal").toLowerCase();
const APP_PASSWORD = process.env.APP_PASSWORD || "Pool123!";
const AUTH_SECRET = process.env.AUTH_SECRET || "poolhero-insecure-default-change-me";

/** Sprawdza, czy bieżąca sesja jest zalogowana (dla AuthGate przy starcie). */
export async function GET() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  return NextResponse.json({ authed: token === AUTH_SECRET });
}

/** Loguje: waliduje hasło po stronie serwera i ustawia bezpieczne ciasteczko httpOnly. */
export async function POST(req: Request) {
  try {
    const { login, password } = (await req.json()) as { login?: string; password?: string };
    const okLogin = String(login ?? "").trim().toLowerCase() === APP_LOGIN;
    const okPass = String(password ?? "") === APP_PASSWORD;

    if (okLogin && okPass) {
      cookies().set(AUTH_COOKIE, AUTH_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 rok — "zapamiętaj na zawsze"
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Nieprawidłowy login lub hasło." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Błąd logowania." }, { status: 400 });
  }
}
