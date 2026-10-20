import type { Forecast, LocalDateTime } from "@/types/forecast";
import type {
  Period,
  PeriodRecommendation,
  Recommendation,
  ScoredHour,
} from "@/types/recommendation";

import { average, describeFactors, dominantCondition, rate, windowScore } from "./describe";
import { addHours, isWithin, toMinutes } from "./localTime";
import { selectPeriods } from "./periods";
import { scoreHour } from "./score";
import { suggestionsFor, timeOfDay } from "./suggestions";
import { findWindow } from "./window";

type PeriodInput = {
  period: Period;
  pool: ScoredHour[];
  candidates: number;
  isTomorrow: boolean;
  sunset: LocalDateTime | null;
};

function recommendPeriod({
  period,
  pool,
  candidates,
  isTomorrow,
  sunset,
}: PeriodInput): PeriodRecommendation {
  const { start, end } = findWindow(pool, candidates);
  const hours = pool.slice(start, end + 1);
  const from = hours[0]!.time;
  const to = addHours(hours[hours.length - 1]!.time, 1);
  const score = windowScore(hours);
  const rating = rate(score);
  const factors = describeFactors(hours);
  const condition = dominantCondition(rating, factors.temperature);

  return {
    period,
    isTomorrow,
    from,
    to,
    hours,
    candidates: pool.slice(0, candidates),
    score,
    rating,
    feelsLike: average(hours.map(({ apparentTemperature }) => apparentTemperature)),
    factors,
    condition,
    suggestions: suggestionsFor(timeOfDay(from, period), condition),
    sunset: sunset && isWithin(sunset, from, to) ? sunset : null,
  };
}

function startsRightAfter(next: ScoredHour[], previous: ScoredHour[]): boolean {
  const first = next[0];
  const last = previous[previous.length - 1];
  return (
    first !== undefined &&
    last !== undefined &&
    toMinutes(first.time) === toMinutes(addHours(last.time, 1))
  );
}

export function recommend(forecast: Forecast, now: LocalDateTime): Recommendation {
  const periods = selectPeriods(forecast, now);
  const dayHours = periods.day.hours.map((hour) => scoreHour(hour, "day"));
  const nightHours = periods.night.hours.map((hour) => scoreHour(hour, "night"));

  const dayCanGrowIntoNight = startsRightAfter(nightHours, dayHours);
  const day =
    dayHours.length > 0
      ? recommendPeriod({
          period: "day",
          pool: dayCanGrowIntoNight ? [...dayHours, ...nightHours] : dayHours,
          candidates: dayHours.length,
          isTomorrow: periods.day.isTomorrow,
          sunset: periods.day.sunset,
        })
      : null;

  const nightHoursUsedByDay = day?.hours.filter(({ period }) => period === "night").length ?? 0;
  const remainingNight = nightHours.slice(nightHoursUsedByDay);
  const night =
    remainingNight.length > 0
      ? recommendPeriod({
          period: "night",
          pool: remainingNight,
          candidates: remainingNight.length,
          isTomorrow: false,
          sunset: null,
        })
      : null;

  const available = [day, night].filter((period) => period !== null);
  const best = available.reduce<PeriodRecommendation | null>(
    (winner, period) => (winner === null || period.score > winner.score ? period : winner),
    null,
  );

  return {
    day,
    night,
    best: best?.period ?? null,
    isBadDay: available.length > 0 && available.every(({ rating }) => rating === "avoid"),
  };
}
