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

export type WeightedFactor = { value: number; grade: number; weight: number };

export type Multiplier = { value: number; factor: number };

export type HourBreakdown = {
  temperature: WeightedFactor;
  wind: WeightedFactor;
  uv: WeightedFactor;
  comfort: number;
  rain: Multiplier;
  strongWind: Multiplier;
  storm: boolean;
  score: number;
};

export function explainHour(hour: HourlyForecast, period: Period): HourBreakdown {
  const weights = comfortWeights[period];
  const temperature = {
    value: hour.apparentTemperature,
    grade: trapezoid(hour.apparentTemperature, factorRanges.temperature),
    weight: weights.temperature,
  };
  const wind = {
    value: hour.windSpeed,
    grade: trapezoid(hour.windSpeed, factorRanges.wind),
    weight: weights.wind,
  };
  const uv = {
    value: hour.uvIndex,
    grade: trapezoid(hour.uvIndex, factorRanges.uv),
    weight: weights.uv,
  };
  const comfort = [temperature, wind, uv].reduce(
    (sum, factor) => sum + factor.weight * factor.grade,
    0,
  );
  const rain = {
    value: hour.precipitationProbability,
    factor: trapezoid(hour.precipitationProbability, factorRanges.rain),
  };
  const strongWind = {
    value: hour.windSpeed,
    factor: trapezoid(hour.windSpeed, factorRanges.strongWind),
  };
  const storm = isStorm(hour.weatherCode);
  const score = storm ? 0 : comfort * rain.factor * strongWind.factor * 100;

  return { temperature, wind, uv, comfort, rain, strongWind, storm, score };
}

export function scoreHour(hour: HourlyForecast, period: Period): ScoredHour {
  return { ...hour, period, score: explainHour(hour, period).score };
}
