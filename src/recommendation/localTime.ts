import type { LocalDateTime } from "@/types/forecast";

const MINUTE_MS = 60 * 1000;
const HOUR_MINUTES = 60;

const midnightMinutesByDate = new Map<string, number>();

function minutesAtMidnight(date: string): number {
  const cached = midnightMinutesByDate.get(date);
  if (cached !== undefined) return cached;

  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const minutes = Date.UTC(year, month - 1, day) / MINUTE_MS;
  midnightMinutesByDate.set(date, minutes);
  return minutes;
}

export function toMinutes({ date, hour, minute }: LocalDateTime): number {
  return minutesAtMidnight(date) + hour * HOUR_MINUTES + minute;
}

export function fromMinutes(minutes: number): LocalDateTime {
  const instant = new Date(minutes * MINUTE_MS);
  return {
    date: instant.toISOString().slice(0, 10),
    hour: instant.getUTCHours(),
    minute: instant.getUTCMinutes(),
  };
}

export function addHours(time: LocalDateTime, hours: number): LocalDateTime {
  return fromMinutes(toMinutes(time) + hours * HOUR_MINUTES);
}

export function startOfHour(time: LocalDateTime): LocalDateTime {
  return { ...time, minute: 0 };
}

export function isWithin(
  time: LocalDateTime,
  fromInclusive: LocalDateTime,
  toExclusive: LocalDateTime,
): boolean {
  const minutes = toMinutes(time);
  return minutes >= toMinutes(fromInclusive) && minutes < toMinutes(toExclusive);
}

export function latest(a: LocalDateTime, b: LocalDateTime): LocalDateTime {
  return toMinutes(a) >= toMinutes(b) ? a : b;
}

export function cityNow(epochMs: number, utcOffsetSeconds: number): LocalDateTime {
  return fromMinutes(Math.floor((epochMs + utcOffsetSeconds * 1000) / MINUTE_MS));
}
