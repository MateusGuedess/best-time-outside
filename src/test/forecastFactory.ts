import type { DailyForecast, Forecast, HourlyForecast, LocalDateTime } from "@/types/forecast";

export const PLEASANT: Omit<HourlyForecast, "time"> = {
  temperature: 22,
  apparentTemperature: 22,
  precipitationProbability: 0,
  windSpeed: 5,
  uvIndex: 3,
  weatherCode: 0,
};

export function at(date: string, hour: number, minute = 0): LocalDateTime {
  return { date, hour, minute };
}

export function hourAt(
  date: string,
  hour: number,
  overrides: Partial<Omit<HourlyForecast, "time">> = {},
): HourlyForecast {
  return { time: at(date, hour), ...PLEASANT, ...overrides };
}

export function dayOf(
  date: string,
  sunrise: [number, number],
  sunset: [number, number],
): DailyForecast {
  return { date, sunrise: at(date, ...sunrise), sunset: at(date, ...sunset) };
}

export function twoDayForecast(
  weather: (date: string, hour: number) => Partial<Omit<HourlyForecast, "time">> = () => ({}),
): Forecast {
  const dates = ["2026-10-18", "2026-10-19"];
  return {
    utcOffsetSeconds: -10800,
    timezone: "America/Sao_Paulo",
    hours: dates.flatMap((date) =>
      Array.from({ length: 24 }, (_, hour) => hourAt(date, hour, weather(date, hour))),
    ),
    days: dates.map((date) => dayOf(date, [5, 30], [18, 30])),
  };
}
