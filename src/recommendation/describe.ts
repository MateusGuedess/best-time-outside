import type {
  Condition,
  RainLevel,
  Rating,
  ScoredHour,
  TemperatureLevel,
  WindLevel,
  WindowFactors,
} from "@/types/recommendation";

import { levelThresholds, ratingThresholds } from "./config";
import { isStorm } from "./score";

export function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function temperatureLevel(feelsLike: number): TemperatureLevel {
  const { cool, pleasant, warm, hot } = levelThresholds.temperature;
  if (feelsLike < cool) return "cold";
  if (feelsLike < pleasant) return "cool";
  if (feelsLike <= warm) return "pleasant";
  if (feelsLike <= hot) return "warm";
  return "hot";
}

export function rainLevel(probability: number): RainLevel {
  const { possible, likely } = levelThresholds.rain;
  if (probability < possible) return "low";
  if (probability <= likely) return "possible";
  return "likely";
}

export function windLevel(speed: number): WindLevel {
  const { breezy, strong } = levelThresholds.wind;
  if (speed < breezy) return "light";
  if (speed <= strong) return "breezy";
  return "strong";
}

export function rate(score: number): Rating {
  if (score >= ratingThresholds.great) return "great";
  if (score >= ratingThresholds.good) return "good";
  return "avoid";
}

export function windowScore(hours: readonly ScoredHour[]): number {
  return Math.round(average(hours.map(({ score }) => score)));
}

export function describeFactors(hours: readonly ScoredHour[]): WindowFactors {
  return {
    temperature: temperatureLevel(average(hours.map((hour) => hour.apparentTemperature))),
    rain: rainLevel(Math.max(...hours.map((hour) => hour.precipitationProbability))),
    wind: windLevel(Math.max(...hours.map((hour) => hour.windSpeed))),
    uvAlert: Math.max(...hours.map((hour) => hour.uvIndex)) >= levelThresholds.uvAlert,
    storm: hours.some((hour) => isStorm(hour.weatherCode)),
  };
}

export function dominantCondition(rating: Rating, temperature: TemperatureLevel): Condition {
  if (rating === "avoid") return "indoor";
  if (temperature === "cold") return "cold";
  if (temperature === "warm" || temperature === "hot") return "hot";
  return "pleasant";
}
