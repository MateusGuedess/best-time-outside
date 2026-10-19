import { z } from "zod";

import type { DailyForecast, Forecast, HourlyForecast, LocalDateTime } from "@/types/forecast";

const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;

const localDateTimeSchema = z
  .string()
  .regex(LOCAL_DATE_TIME)
  .transform((value): LocalDateTime => {
    const [, date = "", hour = "", minute = ""] = LOCAL_DATE_TIME.exec(value) ?? [];
    return { date, hour: Number(hour), minute: Number(minute) };
  });

const missingNumber = z.number().nullable();

function haveSameLength(arrays: readonly unknown[][]): boolean {
  return arrays.every((array) => array.length === arrays[0]?.length);
}

function isComplete<T extends object>(row: T): row is { [K in keyof T]: NonNullable<T[K]> } {
  return Object.values(row).every((value) => value !== null);
}

const hourlySchema = z
  .object({
    time: z.array(localDateTimeSchema),
    temperature_2m: z.array(missingNumber),
    apparent_temperature: z.array(missingNumber),
    precipitation_probability: z.array(missingNumber),
    wind_speed_10m: z.array(missingNumber),
    uv_index: z.array(missingNumber),
    weather_code: z.array(z.number().int().nullable()),
  })
  .refine((hourly) => haveSameLength(Object.values(hourly)), {
    message: "Hourly arrays must have the same length",
  })
  .transform((hourly): HourlyForecast[] =>
    hourly.time
      .map((time, index) => ({
        time,
        temperature: hourly.temperature_2m[index]!,
        apparentTemperature: hourly.apparent_temperature[index]!,
        precipitationProbability: hourly.precipitation_probability[index]!,
        windSpeed: hourly.wind_speed_10m[index]!,
        uvIndex: hourly.uv_index[index]!,
        weatherCode: hourly.weather_code[index]!,
      }))
      .filter(isComplete),
  );

const dailySchema = z
  .object({
    time: z.array(z.string()),
    sunrise: z.array(localDateTimeSchema.nullable()),
    sunset: z.array(localDateTimeSchema.nullable()),
  })
  .refine((daily) => haveSameLength(Object.values(daily)), {
    message: "Daily arrays must have the same length",
  })
  .transform((daily): DailyForecast[] =>
    daily.time
      .map((date, index) => ({
        date,
        sunrise: daily.sunrise[index]!,
        sunset: daily.sunset[index]!,
      }))
      .filter(isComplete),
  );

export const forecastSchema = z
  .object({
    utc_offset_seconds: z.number().int(),
    timezone: z.string(),
    hourly: hourlySchema,
    daily: dailySchema,
  })
  .transform(({ utc_offset_seconds, timezone, hourly, daily }): Forecast => ({
    utcOffsetSeconds: utc_offset_seconds,
    timezone,
    hours: hourly,
    days: daily,
  }));
