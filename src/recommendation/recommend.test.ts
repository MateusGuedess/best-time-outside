import { at, twoDayForecast } from "@/test/forecastFactory";
import type { LocalDateTime } from "@/types/forecast";
import type { PeriodRecommendation } from "@/types/recommendation";

import { recommend } from "./recommend";

const RAIN = { precipitationProbability: 90 };
const HOT = { apparentTemperature: 33, uvIndex: 9 };

function span(period: PeriodRecommendation | null) {
  const label = ({ hour }: LocalDateTime) => `${hour}h`;
  return period && `${label(period.from)}–${label(period.to)}`;
}

describe("recommend", () => {
  it("recommends the pleasant hours of the afternoon and avoids a rainy night", () => {
    const forecast = twoDayForecast((date, hour) => {
      if (date === "2026-10-19") return hour < 2 ? RAIN : {};
      if (hour >= 19) return RAIN;
      if (hour < 15) return HOT;
      return {};
    });

    const { day, night, best, isBadDay } = recommend(forecast, at("2026-10-18", 9, 30));

    expect(span(day)).toBe("15h–19h");
    expect(day?.rating).toBe("great");
    expect(day?.factors).toMatchObject({ temperature: "pleasant", rain: "low", wind: "light" });
    expect(night?.rating).toBe("avoid");
    expect(night?.condition).toBe("indoor");
    expect(night?.suggestions).toContain("suggestions.night.indoor.movieAtHome");
    expect(best).toBe("day");
    expect(isBadDay).toBe(false);
  });

  it("never recommends hours that already passed", () => {
    const forecast = twoDayForecast((_date, hour) => (hour === 10 ? {} : { windSpeed: 25 }));

    const { day } = recommend(forecast, at("2026-10-18", 14, 0));

    expect(day?.from.hour).toBeGreaterThanOrEqual(14);
  });

  it("lets the day window cross the sunset without repeating hours at night", () => {
    const forecast = twoDayForecast((date, hour) =>
      date === "2026-10-18" && hour >= 17 && hour <= 20 ? {} : { apparentTemperature: 31 },
    );

    const { day, night } = recommend(forecast, at("2026-10-18", 12, 0));

    expect(span(day)).toBe("17h–21h");
    expect(day?.sunset).toEqual(at("2026-10-18", 18, 30));
    expect(night?.from.hour).toBe(21);
  });

  it("marks a bad day when both periods should be avoided", () => {
    const forecast = twoDayForecast(() => RAIN);

    const { day, night, isBadDay } = recommend(forecast, at("2026-10-18", 8, 0));

    expect(day?.rating).toBe("avoid");
    expect(night?.rating).toBe("avoid");
    expect(isBadDay).toBe(true);
    expect(day?.suggestions).toContain("suggestions.day.indoor.cinema");
  });

  it("suggests indoor activities whenever the window should be avoided, even without likely rain", () => {
    const forecast = twoDayForecast(() => ({ precipitationProbability: 45 }));

    const { day } = recommend(forecast, at("2026-10-18", 8, 0));

    expect(day?.factors.rain).toBe("possible");
    expect(day?.rating).toBe("avoid");
    expect(day?.condition).toBe("indoor");
    expect(day?.suggestions).toContain("suggestions.day.indoor.museum");
  });

  it("shows tomorrow's daylight once today's is over", () => {
    const { day, night } = recommend(twoDayForecast(), at("2026-10-18", 21, 0));

    expect(day?.isTomorrow).toBe(true);
    expect(day?.from.date).toBe("2026-10-19");
    expect(night?.from).toEqual(at("2026-10-18", 21, 0));
  });

  it("never recommends going out in a thunderstorm", () => {
    const forecast = twoDayForecast((date, hour) =>
      date === "2026-10-18" && hour === 16 ? { weatherCode: 95 } : { windSpeed: 25 },
    );

    const { day } = recommend(forecast, at("2026-10-18", 14, 0));

    expect(day?.hours.some(({ time }) => time.hour === 16)).toBe(false);
  });

  it("prefers hours with lower UV when the rest is equal", () => {
    const forecast = twoDayForecast((_date, hour) =>
      hour >= 11 && hour <= 13 ? { uvIndex: 9 } : {},
    );

    const { day } = recommend(forecast, at("2026-10-18", 11, 0));

    expect(day?.from.hour).toBe(14);
    expect(day?.factors.uvAlert).toBe(false);
  });

  it("warns about very high UV when it cannot be avoided", () => {
    const forecast = twoDayForecast(() => ({ uvIndex: 9 }));

    const { day } = recommend(forecast, at("2026-10-18", 11, 0));

    expect(day?.factors.uvAlert).toBe(true);
  });

  it("returns no periods when the forecast has no hours left", () => {
    const empty = { ...twoDayForecast(), hours: [] };

    expect(recommend(empty, at("2026-10-18", 12, 0))).toEqual({
      day: null,
      night: null,
      best: null,
      isBadDay: false,
    });
  });
});
