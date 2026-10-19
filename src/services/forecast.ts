import { forecastSchema } from "@/schemas/forecast.schema";
import type { Coordinates, Forecast } from "@/types/forecast";

import { httpGet } from "./http";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const HOURLY_VARIABLES = [
  "temperature_2m",
  "apparent_temperature",
  "precipitation_probability",
  "wind_speed_10m",
  "uv_index",
  "weather_code",
];

export const FORECAST_DAYS = 2;

export function getForecast(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: HOURLY_VARIABLES.join(","),
    daily: "sunrise,sunset",
    timezone: "auto",
    forecast_days: String(FORECAST_DAYS),
  });
  return httpGet(`${FORECAST_URL}?${params}`, forecastSchema, signal);
}
