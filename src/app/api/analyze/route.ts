import { NextResponse } from "next/server";
import type { TestResult, User } from "@/lib/types";
import { FILTER_LABELS, SANITIZER_LABELS, USAGE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function buildPrompt(test: TestResult, volumeLiters: number, user?: User): string {
  const measurements: string[] = [];
  if (test.ph !== undefined) measurements.push(`- pH: ${test.ph}`);
  if (test.freeCl !== undefined) measurements.push(`- Chlor wolny: ${test.freeCl} mg/l`);
  if (test.totalCl !== undefined) measurements.push(`- Chlor całkowity: ${test.totalCl} mg/l`);
  if (test.combinedCl !== undefined) measurements.push(`- Chlor związany: ${test.combinedCl} mg/l`);
  if (test.alkalinity !== undefined) measurements.push(`- Zasadowość (TA): ${test.alkalinity} mg/l`);
  if (test.cya !== undefined) measurements.push(`- Stabilizator (CYA): ${test.cya} mg/l`);

  const technical: string[] = [];
  if (user?.filterType) technical.push(`- Typ filtra: ${FILTER_LABELS[user.filterType]}`);
  if (user?.sanitizer) technical.push(`- Środek dezynfekujący: ${SANITIZER_LABELS[user.sanitizer]}`);
  if (user?.covered !== undefined) technical.push(`- Przykrycie basenu: ${user.covered ? "tak, basen jest przykrywany" : "nie, basen odkryty"}`);
  if (user?.heated !== undefined) technical.push(`- Podgrzewanie wody: ${user.heated ? "tak, woda jest podgrzewana" : "nie, bez ogrzewania"}`);
  if (user?.usage) technical.push(`- Intensywność użytkowania: ${USAGE_LABELS[user.usage]}`);

  let prompt =
    `Jesteś ekspertem od domowych basenów. Mój basen ma ${volumeLiters.toLocaleString("pl-PL")} litrów wody.\n\n` +
    `Zmierzyłem wartości wody i moje wyniki są następujące:\n${measurements.join("\n")}\n\n`;

  if (technical.length > 0) {
    prompt += `Dane techniczne basenu:\n${technical.join("\n")}\n\n`;
  }

  prompt +=
    `Sprawdź w swojej bazie wiedzy czy jest coś do poprawy. Jeśli tak, zaproponuj konkretne rozwiązanie ` +
    `(jakie preparaty dodać i w jakiej przybliżonej ilości na ${volumeLiters.toLocaleString("pl-PL")} litrów). ` +
    `Uwzględnij dane techniczne basenu przy dawkowaniu i rekomendacjach. ` +
    `Odpowiedz po polsku, zwięźle i praktycznie.`;

  return prompt;
}

export async function POST(req: Request) {
  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: "Brak klucza GEMINI_API_KEY — skonfiguruj zmienną środowiskową na Vercel." },
      { status: 503 }
    );
  }

  try {
    const { test, volumeLiters, user } = (await req.json()) as {
      test: TestResult;
      volumeLiters: number;
      user?: User;
    };

    const prompt = buildPrompt(test, volumeLiters, user);

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg: string = data.error?.message || "";
      if (msg.includes("quota") || msg.includes("Quota") || res.status === 429) {
        throw new Error(
          "Przekroczono limit Gemini API. Włącz billing w Google Cloud Console dla projektu z kluczem API — koszt to ok. $0.00005 za analizę (Gemini 2.0 Flash). Szczegóły: https://console.cloud.google.com/billing"
        );
      }
      throw new Error(msg || "Błąd Gemini API");
    }

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Brak odpowiedzi.";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
