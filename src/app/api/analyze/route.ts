import { NextResponse } from "next/server";
import type { TestResult, User } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n/translations";
import { buildAnalysisPrompt } from "@/lib/prompt";

export const dynamic = "force-dynamic";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function fetchWeatherBlock(city: string, locale: Locale): Promise<string | null> {
  try {
    const geoLang = locale === "de" ? "de" : "pl";
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=${geoLang}&format=json`,
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
      return t(locale, "prompt.weatherLine", { date, tmin, tmax, rain, sun: sunH });
    });

    return t(locale, "prompt.weatherHeader", { city: name, country }) + "\n" + lines.join("\n");
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: t("pl", "analyze.missingKey") }, { status: 503 });
  }

  try {
    const { test, volumeLiters, user, locale } = (await req.json()) as {
      test: TestResult;
      volumeLiters: number;
      user?: User;
      locale?: Locale;
    };
    const loc: Locale = locale === "de" ? "de" : "pl";

    const weatherBlock = user?.city ? await fetchWeatherBlock(user.city, loc) : null;
    const prompt = buildAnalysisPrompt(loc, test, volumeLiters, user, weatherBlock ?? undefined);

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
        throw new Error(t(loc, "analyze.quotaError"));
      }
      throw new Error(msg || t(loc, "analyze.genericError"));
    }

    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
