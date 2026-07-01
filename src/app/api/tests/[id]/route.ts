import { NextResponse } from "next/server";
import { deleteTest } from "@/lib/sheets";
import { getOwnerEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const ok = await deleteTest(params.id, owner);
    if (!ok) return NextResponse.json({ error: "Nie znaleziono wpisu" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
