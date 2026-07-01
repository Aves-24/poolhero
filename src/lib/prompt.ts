import type { TestResult, User } from "./types";
import { t, paramLabel, filterLabels, usageLabels, type Locale } from "./i18n/translations";
import { PARAMS } from "./water";

/**
 * Buduje prompt do analizy AI (Gemini) lub do udostępnienia ręcznie.
 * `weatherBlock`, jeśli podany (pobrany po stronie serwera), zastępuje
 * samo zdanie o mieście pełnym podsumowaniem pogody z ostatnich 7 dni.
 */
export function buildAnalysisPrompt(
  locale: Locale,
  test: TestResult,
  volumeLiters: number,
  user?: User,
  weatherBlock?: string
): string {
  const localeTag = locale === "de" ? "de-DE" : "pl-PL";
  const volumeStr = volumeLiters.toLocaleString(localeTag);

  const measurementValues: Record<string, number | undefined> = {
    ph: test.ph,
    freeCl: test.freeCl,
    combinedCl: test.combinedCl,
    alkalinity: test.alkalinity,
    cya: test.cya,
  };

  const lines: string[] = [];
  PARAMS.forEach((cfg) => {
    const value = measurementValues[cfg.key];
    if (value !== undefined) {
      lines.push(`- ${paramLabel(locale, cfg.key)}: ${value}${cfg.unit ? " " + cfg.unit : ""}`);
    }
  });

  const tech: string[] = [];
  if (user?.filterType) tech.push(t(locale, "prompt.filterLine", { value: filterLabels(locale)[user.filterType] }));
  if (user?.sanitizerNote) tech.push(t(locale, "prompt.sanitizerLine", { value: user.sanitizerNote }));
  if (user?.covered !== undefined) tech.push(t(locale, user.covered ? "prompt.coveredYes" : "prompt.coveredNo"));
  if (user?.heated !== undefined) tech.push(t(locale, user.heated ? "prompt.heatedYes" : "prompt.heatedNo"));
  if (user?.usage) tech.push(t(locale, "prompt.usageLine", { value: usageLabels(locale)[user.usage] }));

  let prompt = t(locale, "prompt.intro", { volume: volumeStr }) + "\n\n";
  prompt += t(locale, "prompt.measuredIntro") + "\n" + lines.join("\n");

  if (tech.length > 0) {
    prompt += "\n\n" + t(locale, "prompt.technicalIntro") + "\n" + tech.join("\n");
  }

  if (weatherBlock) {
    prompt += "\n\n" + weatherBlock;
  } else if (user?.city) {
    prompt += "\n\n" + t(locale, "prompt.cityLine", { city: user.city });
  }

  prompt += "\n\n" + t(locale, weatherBlock ? "prompt.closingWithWeather" : "prompt.closing", { volume: volumeStr });

  return prompt;
}
