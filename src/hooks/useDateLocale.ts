import { useLocales } from "expo-localization";

import { useLanguage } from "./useLanguage";

export function useDateLocale(): string {
  const [locale] = useLocales();
  const language = useLanguage();
  return locale?.languageCode === language && locale.languageTag ? locale.languageTag : language;
}
