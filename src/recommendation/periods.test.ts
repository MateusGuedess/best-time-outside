import { at, twoDayForecast } from "@/test/forecastFactory";
import type { HourlyForecast } from "@/types/forecast";

import { selectPeriods } from "./periods";

const forecast = twoDayForecast();

function labels(hours: HourlyForecast[]) {
  return hours.map(({ time }) => `${time.date.slice(8)} ${time.hour}h`);
}

describe("selectPeriods", () => {
  it("uses the remaining daylight hours, including the current one", () => {
    const { day } = selectPeriods(forecast, at("2026-10-18", 14, 10));

    expect(day.isTomorrow).toBe(false);
    expect(labels(day.hours)).toEqual(["18 14h", "18 15h", "18 16h", "18 17h", "18 18h"]);
  });

  it("counts an hour as daytime when it starts before sunset", () => {
    const { day, night } = selectPeriods(forecast, at("2026-10-18", 17, 0));

    expect(labels(day.hours)).toContain("18 18h");
    expect(labels(night.hours)[0]).toBe("18 19h");
  });

  it("starts the day at the hour of sunrise when it is still dark", () => {
    const { day } = selectPeriods(forecast, at("2026-10-18", 3, 0));

    expect(labels(day.hours)[0]).toBe("18 5h");
  });

  it("covers the night from sunset until 2 am of the next day", () => {
    const { night } = selectPeriods(forecast, at("2026-10-18", 14, 0));

    expect(labels(night.hours)).toEqual([
      "18 19h",
      "18 20h",
      "18 21h",
      "18 22h",
      "18 23h",
      "19 0h",
      "19 1h",
    ]);
  });

  it("falls back to tomorrow's daylight once today's is over", () => {
    const { day, night } = selectPeriods(forecast, at("2026-10-18", 20, 15));

    expect(day.isTomorrow).toBe(true);
    expect(day.sunset).toEqual(at("2026-10-19", 18, 30));
    expect(labels(day.hours)[0]).toBe("19 5h");
    expect(labels(night.hours)[0]).toBe("18 20h");
  });

  it("keeps the night in progress between midnight and 2 am", () => {
    const { day, night } = selectPeriods(forecast, at("2026-10-18", 0, 40));

    expect(labels(night.hours)).toEqual(["18 0h", "18 1h"]);
    expect(day.isTomorrow).toBe(false);
  });

  it("never includes hours that already passed", () => {
    const { day, night } = selectPeriods(forecast, at("2026-10-18", 22, 30));

    expect(labels(night.hours)[0]).toBe("18 22h");
    expect(labels(day.hours).every((label) => label.startsWith("19"))).toBe(true);
  });

  it("returns no periods when today is not in the forecast", () => {
    const { day, night } = selectPeriods(forecast, at("2026-10-21", 10, 0));

    expect(day).toEqual({ hours: [], isTomorrow: false, sunset: null });
    expect(night.hours).toEqual([]);
  });
});
