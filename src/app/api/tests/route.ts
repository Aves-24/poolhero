import { NextResponse } from "next/server";
import { getTests, addTest } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Brak userId" }, { status: 400 });
    const tests = await getTests(userId);
    return NextResponse.json(tests);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
    });
    return NextResponse.json(test, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
