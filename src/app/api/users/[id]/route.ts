import { NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const patch: { name?: string; volumeLiters?: number } = {};
    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.volumeLiters !== undefined) {
      const v = Number(body.volumeLiters);
      if (!Number.isFinite(v) || v <= 0) {
        return NextResponse.json({ error: "Podaj poprawną objętość wody (w litrach)" }, { status: 400 });
      }
      patch.volumeLiters = v;
    }
    const user = await updateUser(params.id, patch);
    if (!user) return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteUser(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
