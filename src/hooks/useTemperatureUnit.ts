import { useLocales } from "expo-localization";

import type { TemperatureUnit } from "@/i18n/format";

export function useTemperatureUnit(): TemperatureUnit {
  const [locale] = useLocales();
  return locale?.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius";
}
