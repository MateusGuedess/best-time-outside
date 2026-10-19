import { useTranslation } from "react-i18next";

import { resolveLanguage } from "@/i18n/resolveLanguage";
import type { Language } from "@/types/language";

export function useLanguage(): Language {
  const { i18n } = useTranslation();
  return resolveLanguage([i18n.language]);
}
