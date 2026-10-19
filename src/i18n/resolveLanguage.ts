import { SUPPORTED_LANGUAGES, type Language } from "@/types/language";

export const FALLBACK_LANGUAGE: Language = "en";

function isSupported(code: string): code is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

export function resolveLanguage(languageCodes: readonly (string | null)[]): Language {
  const supported = languageCodes.map((code) => code?.toLowerCase() ?? "").find(isSupported);
  return supported ?? FALLBACK_LANGUAGE;
}
