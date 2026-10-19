import type { HourlyForecast } from "@/types/forecast";
import type { Period, ScoredHour } from "@/types/recommendation";

import { STORM_WEATHER_CODES, comfortWeights, factorRanges, type Trapezoid } from "./config";

export function trapezoid(
  value: number,
  { zeroBelow = -Infinity, idealFrom = -Infinity, idealTo, zeroAbove }: Trapezoid,
): number {
  if (value <= zeroBelow || value >= zeroAbove) return 0;
  if (value < idealFrom) return (value - zeroBelow) / (idealFrom - zeroBelow);
  if (value <= idealTo) return 1;
  return (zeroAbove - value) / (zeroAbove - idealTo);
}

export function isStorm(weatherCode: number): boolean {
  return weatherCode >= STORM_WEATHER_CODES.from && weatherCode <= STORM_WEATHER_CODES.to;
}

export function scoreHour(hour: HourlyForecast, period: Period): ScoredHour {
  if (isStorm(hour.weatherCode)) return { ...hour, period, score: 0 };

  const weights = comfortWeights[period];
  const comfort =
    weights.temperature * trapezoid(hour.apparentTemperature, factorRanges.temperature) +
    weights.wind * trapezoid(hour.windSpeed, factorRanges.wind) +
    weights.uv * trapezoid(hour.uvIndex, factorRanges.uv);
  const rain = trapezoid(hour.precipitationProbability, factorRanges.rain);
  const strongWind = trapezoid(hour.windSpeed, factorRanges.strongWind);

  return { ...hour, period, score: comfort * rain * strongWind * 100 };
}
