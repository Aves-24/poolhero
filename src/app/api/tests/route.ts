import { NextResponse } from "next/server";
import { getTests, getAllTests, addTest } from "@/lib/sheets";
import { getOwnerEmail } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const tests = userId ? await getTests(userId, owner) : await getAllTests(owner);
    return NextResponse.json(tests);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const owner = await getOwnerEmail();
    if (!owner) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const body = await req.json();
    const userId = String(body.userId ?? "");
    if (!userId) return NextResponse.json({ error: "Brak userId" }, { status: 400 });

    const numOrUndef = (v: unknown) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };

    const test = await addTest({
      userId,
      ph: numOrUndef(body.ph),
      freeCl: numOrUndef(body.freeCl),
      totalCl: numOrUndef(body.totalCl),
      alkalinity: numOrUndef(body.alkalinity),
      cya: numOrUndef(body.cya),
      note: body.note ? String(body.note) : undefined,
    }, owner);
    if (!test) return NextResponse.json({ error: "Brak dostępu do tego profilu" }, { status: 403 });
    return NextResponse.json(test, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
