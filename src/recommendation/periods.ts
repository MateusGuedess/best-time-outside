import type { DailyForecast, Forecast, HourlyForecast, LocalDateTime } from "@/types/forecast";

import { NIGHT_END_HOUR } from "./config";
import { addHours, isWithin, latest, startOfHour } from "./localTime";

export type Periods = {
  day: { hours: HourlyForecast[]; isTomorrow: boolean; sunset: LocalDateTime | null };
  night: { hours: HourlyForecast[] };
};

function hoursBetween(
  hours: readonly HourlyForecast[],
  fromInclusive: LocalDateTime,
  toExclusive: LocalDateTime,
): HourlyForecast[] {
  return hours.filter(({ time }) => isWithin(time, fromInclusive, toExclusive));
}

function nightEnd(date: string): LocalDateTime {
  return addHours({ date, hour: NIGHT_END_HOUR, minute: 0 }, 24);
}

function daylightHours(hours: readonly HourlyForecast[], day: DailyForecast, now: LocalDateTime) {
  return hoursBetween(hours, latest(startOfHour(day.sunrise), startOfHour(now)), day.sunset);
}

function noPeriods(): Periods {
  return { day: { hours: [], isTomorrow: false, sunset: null }, night: { hours: [] } };
}

export function selectPeriods(forecast: Forecast, now: LocalDateTime): Periods {
  const { hours, days } = forecast;
  const todayIndex = days.findIndex(({ date }) => date === now.date);
  const today = days[todayIndex];
  if (today === undefined) return noPeriods();

  const tomorrow = days[todayIndex + 1];
  const currentHour = startOfHour(now);

  const todayDaylight = daylightHours(hours, today, now);
  const daylight = todayDaylight.length === 0 && tomorrow ? tomorrow : today;
  const isTomorrow = daylight !== today;

  const nightHours =
    now.hour < NIGHT_END_HOUR
      ? hoursBetween(hours, currentHour, { date: now.date, hour: NIGHT_END_HOUR, minute: 0 })
      : hoursBetween(hours, latest(today.sunset, currentHour), nightEnd(today.date));

  return {
    day: {
      hours: isTomorrow ? daylightHours(hours, daylight, now) : todayDaylight,
      isTomorrow,
      sunset: daylight.sunset,
    },
    night: { hours: nightHours },
  };
}
