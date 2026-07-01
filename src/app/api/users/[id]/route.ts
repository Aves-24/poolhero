import { NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/sheets";
import { getOwnerEmail } from "@/lib/session";
import type { FilterType, SanitizerType, UsageLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_FILTERS: FilterType[] = ["sand", "filterballs", "cartridge", "de"];
const VALID_SANITIZERS: SanitizerType[] = ["chlorine", "active_oxygen", "bromine", "phmb"];
const VALID_USAGE: UsageLevel[] = ["low", "medium", "high"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const body = await req.json();
    const patch: Parameters<typeof updateUser>[1] = {};

    if (body.name !== undefined) patch.name = String(body.name).trim();
    if (body.volumeLiters !== undefined) {
      const v = Number(body.volumeLiters);
      if (!Number.isFinite(v) || v <= 0)
        return NextResponse.json({ error: "Podaj poprawną objętość wody (w litrach)" }, { status: 400 });
      patch.volumeLiters = v;
    }
    if (body.filterType !== undefined) patch.filterType = VALID_FILTERS.includes(body.filterType) ? body.filterType : undefined;
    if (body.sanitizer !== undefined) patch.sanitizer = VALID_SANITIZERS.includes(body.sanitizer) ? body.sanitizer : undefined;
    if (body.covered !== undefined) patch.covered = Boolean(body.covered);
    if (body.heated !== undefined) patch.heated = Boolean(body.heated);
    if (body.usage !== undefined) patch.usage = VALID_USAGE.includes(body.usage) ? body.usage : undefined;
    if (body.sanitizerNote !== undefined) patch.sanitizerNote = String(body.sanitizerNote).slice(0, 200) || undefined;
    if (body.city !== undefined) patch.city = String(body.city).slice(0, 100) || undefined;

    const user = await updateUser(params.id, patch, owner);
    if (!user) return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const ok = await deleteUser(params.id, owner);
    if (!ok) return NextResponse.json({ error: "Nie znaleziono profilu" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
