import type { LocalDateTime } from "@/types/forecast";
import type { Language } from "@/types/language";

export type TemperatureUnit = "celsius" | "fahrenheit";

function twelveHour(hour: number): { hour: number; suffix: "AM" | "PM" } {
  return { hour: hour % 12 || 12, suffix: hour < 12 ? "AM" : "PM" };
}

export function formatHour({ hour }: LocalDateTime, language: Language): string {
  if (language !== "en") return `${hour}h`;
  const clock = twelveHour(hour);
  return `${clock.hour} ${clock.suffix}`;
}

export function formatTime({ hour, minute }: LocalDateTime, language: Language): string {
  const minutes = String(minute).padStart(2, "0");
  if (language !== "en") return `${hour}h${minutes}`;
  const clock = twelveHour(hour);
  return `${clock.hour}:${minutes} ${clock.suffix}`;
}

export function toDisplayTemperature(celsius: number, unit: TemperatureUnit): number {
  return Math.round(unit === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius);
}

export function formatDate(date: string, localeTag: string): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat(localeTag, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, day));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type WindUnit = "kmh" | "mph";

export function toDisplayWind(kmh: number, unit: WindUnit): number {
  return Math.round(unit === "mph" ? kmh / 1.609344 : kmh);
}
