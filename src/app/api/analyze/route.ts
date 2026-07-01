import { NextResponse } from "next/server";
import type { TestResult, User } from "@/lib/types";
import { FILTER_LABELS, SANITIZER_LABELS, USAGE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function fetchWeatherSummary(city: string): Promise<string | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pl&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    if (!geoData.results?.length) return null;
    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration` +
        `&past_days=7&forecast_days=0&timezone=auto`,
      { next: { revalidate: 3600 } }
    );
    if (!weatherRes.ok) return null;
    const w = await weatherRes.json();
    const d = w.daily;
    if (!d) return null;

    const lines: string[] = (d.time as string[]).map((date: string, i: number) => {
      const tmax = d.temperature_2m_max[i];
      const tmin = d.temperature_2m_min[i];
      const rain = d.precipitation_sum[i] ?? 0;
      const sunH = d.sunshine_duration[i] ? Math.round(d.sunshine_duration[i] / 3600) : 0;
      return `  ${date}: ${tmin}–${tmax}°C, opady ${rain} mm, słońce ${sunH}h`;
    });

    return `Pogoda dla ${name} (${country}) – ostatnie 7 dni:\n${lines.join("\n")}`;
  } catch {
    return null;
  }
}

async function buildPrompt(test: TestResult, volumeLiters: number, user?: User): Promise<string> {
  const measurements: string[] = [];
  if (test.ph !== undefined) measurements.push(`- pH: ${test.ph}`);
  if (test.freeCl !== undefined) measurements.push(`- Chlor wolny: ${test.freeCl} mg/l`);
  if (test.totalCl !== undefined) measurements.push(`- Chlor całkowity: ${test.totalCl} mg/l`);
  if (test.combinedCl !== undefined) measurements.push(`- Chlor związany: ${test.combinedCl} mg/l`);
  if (test.alkalinity !== undefined) measurements.push(`- Zasadowość (TA): ${test.alkalinity} mg/l`);
  if (test.cya !== undefined) measurements.push(`- Stabilizator (CYA): ${test.cya} mg/l`);

  const technical: string[] = [];
  if (user?.filterType) technical.push(`- Typ filtra: ${FILTER_LABELS[user.filterType]}`);
  if (user?.sanitizer || user?.sanitizerNote) {
    const label = user.sanitizer ? SANITIZER_LABELS[user.sanitizer] : "";
    const note = user.sanitizerNote ?? "";
    technical.push(`- Środek dezynfekujący: ${[label, note].filter(Boolean).join(" — ")}`);
  } else if (user?.sanitizerNote) {
    technical.push(`- Środek dezynfekujący: ${user.sanitizerNote}`);
  }
  if (user?.covered !== undefined) technical.push(`- Przykrycie basenu: ${user.covered ? "tak, basen jest przykrywany" : "nie, basen odkryty"}`);
  if (user?.heated !== undefined) technical.push(`- Podgrzewanie wody: ${user.heated ? "tak, woda jest podgrzewana" : "nie, bez ogrzewania"}`);
  if (user?.usage) technical.push(`- Intensywność użytkowania: ${USAGE_LABELS[user.usage]}`);

  let prompt =
    `Jesteś ekspertem od domowych basenów. Mój basen ma ${volumeLiters.toLocaleString("pl-PL")} litrów wody.\n\n` +
    `Zmierzyłem wartości wody i moje wyniki są następujące:\n${measurements.join("\n")}\n\n`;

  if (technical.length > 0) {
    prompt += `Dane techniczne basenu:\n${technical.join("\n")}\n\n`;
  }

  if (user?.city) {
    const weather = await fetchWeatherSummary(user.city);
    if (weather) {
      prompt += `${weather}\n\n`;
    }
  }

  prompt +=
    `Sprawdź w swojej bazie wiedzy czy jest coś do poprawy. Jeśli tak, zaproponuj konkretne rozwiązanie ` +
    `(jakie preparaty dodać i w jakiej przybliżonej ilości na ${volumeLiters.toLocaleString("pl-PL")} litrów). ` +
    `Uwzględnij dane techniczne basenu oraz warunki pogodowe przy dawkowaniu i rekomendacjach ` +
    `(np. wysokie temperatury i intensywne nasłonecznienie przyspieszają rozkład chloru, intensywne opady mogą rozcieńczyć wodę). ` +
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

    const prompt = await buildPrompt(test, volumeLiters, user);

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
