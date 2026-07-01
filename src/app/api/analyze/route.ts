import { NextResponse } from "next/server";
import type { TestResult } from "@/lib/types";

export const dynamic = "force-dynamic";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function formatValue(v: number | undefined, unit: string) {
  if (v === undefined) return null;
  return `${v} ${unit}`.trim();
}

function buildPrompt(test: TestResult, volumeLiters: number): string {
  const lines: string[] = [];

  if (test.ph !== undefined) lines.push(`- pH: ${test.ph}`);
  if (test.freeCl !== undefined) lines.push(`- Chlor wolny: ${test.freeCl} mg/l`);
  if (test.totalCl !== undefined) lines.push(`- Chlor całkowity: ${test.totalCl} mg/l`);
  if (test.combinedCl !== undefined) lines.push(`- Chlor związany: ${test.combinedCl} mg/l`);
  if (test.alkalinity !== undefined) lines.push(`- Zasadowość (TA): ${test.alkalinity} mg/l`);
  if (test.cya !== undefined) lines.push(`- Stabilizator (CYA): ${test.cya} mg/l`);

  return (
    `Jesteś ekspertem od domowych basenów. Mój basen ma ${volumeLiters.toLocaleString("pl-PL")} litrów wody. ` +
    `Zmierzyłem wartości wody i moje wyniki są następujące:\n${lines.join("\n")}\n\n` +
    `Sprawdź w swojej bazie wiedzy czy jest coś do poprawy. Jeśli tak, zaproponuj konkretne rozwiązanie ` +
    `(jakie preparaty dodać i w jakiej przybliżonej ilości na ${volumeLiters.toLocaleString("pl-PL")} litrów). ` +
    `Odpowiedz po polsku, zwięźle i praktycznie.`
  );
}

export async function POST(req: Request) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: "Brak klucza GEMINI_API_KEY — skonfiguruj zmienną środowiskową." }, { status: 503 });
  }

  try {
    const { test, volumeLiters } = (await req.json()) as { test: TestResult; volumeLiters: number };
    const prompt = buildPrompt(test, volumeLiters);

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Błąd Gemini API");

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Brak odpowiedzi.";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
