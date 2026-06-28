import { NextResponse } from "next/server";
import { getUsers, addUser } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const volumeLiters = Number(body.volumeLiters);
    if (!name) return NextResponse.json({ error: "Podaj nazwę profilu" }, { status: 400 });
    if (!Number.isFinite(volumeLiters) || volumeLiters <= 0) {
      return NextResponse.json({ error: "Podaj poprawną objętość wody (w litrach)" }, { status: 400 });
    }
    const user = await addUser({ name, volumeLiters });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
