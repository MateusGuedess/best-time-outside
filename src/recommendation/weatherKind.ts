import type { Period, PeriodRecommendation, WindLevel } from "@/types/recommendation";

import { isStorm } from "./score";

export type WeatherKind = "clear" | "partly" | "cloudy" | "rain" | "storm";

export type Scene = {
  body: "sun" | "moon";
  sky: "clear" | "rain" | "storm";
  wind: WindLevel;
};

const RAIN_CODES = [
  [51, 67],
  [80, 82],
] as const;

export function weatherKind(code: number): WeatherKind {
  if (isStorm(code)) return "storm";
  if (RAIN_CODES.some(([from, to]) => code >= from && code <= to)) return "rain";
  if (code <= 1) return "clear";
  if (code === 2) return "partly";
  return "cloudy";
}

export function sceneFor({
  period,
  rating,
  factors,
}: Pick<PeriodRecommendation, "rating" | "factors"> & { period: Period }): Scene {
  const isRainy = rating === "avoid" && factors.rain !== "low";
  return {
    body: period === "day" ? "sun" : "moon",
    sky: factors.storm ? "storm" : isRainy ? "rain" : "clear",
    wind: factors.wind,
  };
}
