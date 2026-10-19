import type { City } from "./city";

export type LocalDateTime = {
  date: string;
  hour: number;
  minute: number;
};

export type HourlyForecast = {
  time: LocalDateTime;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
};

export type DailyForecast = {
  date: string;
  sunrise: LocalDateTime;
  sunset: LocalDateTime;
};

export type Forecast = {
  utcOffsetSeconds: number;
  timezone: string;
  hours: HourlyForecast[];
  days: DailyForecast[];
};

export type Coordinates = Pick<City, "latitude" | "longitude">;
