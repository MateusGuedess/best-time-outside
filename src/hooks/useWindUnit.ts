import { useLocales } from "expo-localization";

import type { WindUnit } from "@/i18n/format";

export function useWindUnit(): WindUnit {
  const [locale] = useLocales();
  return locale?.measurementSystem === "us" || locale?.measurementSystem === "uk" ? "mph" : "kmh";
}
