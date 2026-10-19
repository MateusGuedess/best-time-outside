import type { SuggestionKey } from "@/recommendation/suggestions";

import type { HourlyForecast, LocalDateTime } from "./forecast";

export type Period = "day" | "night";

export type Rating = "great" | "good" | "avoid";

export type TemperatureLevel = "cold" | "cool" | "pleasant" | "warm" | "hot";

export type RainLevel = "low" | "possible" | "likely";

export type WindLevel = "light" | "breezy" | "strong";

export type Condition = "pleasant" | "hot" | "cold" | "indoor";

export type ScoredHour = HourlyForecast & {
  period: Period;
  score: number;
};

export type WindowFactors = {
  temperature: TemperatureLevel;
  rain: RainLevel;
  wind: WindLevel;
  uvAlert: boolean;
  storm: boolean;
};

export type PeriodRecommendation = {
  period: Period;
  isTomorrow: boolean;
  from: LocalDateTime;
  to: LocalDateTime;
  hours: ScoredHour[];
  candidates: ScoredHour[];
  score: number;
  rating: Rating;
  feelsLike: number;
  factors: WindowFactors;
  condition: Condition;
  suggestions: SuggestionKey[];
  sunset: LocalDateTime | null;
};

export type Recommendation = {
  day: PeriodRecommendation | null;
  night: PeriodRecommendation | null;
  best: Period | null;
  isBadDay: boolean;
};
