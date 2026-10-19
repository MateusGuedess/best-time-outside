import { factorRanges } from "./config";
import { scoreHour, trapezoid } from "./score";

import { hourAt } from "@/test/forecastFactory";

describe("trapezoid", () => {
  it.each([
    [22, 1],
    [18, 1],
    [26, 1],
    [28, 0.75],
    [30, 0.5],
    [34, 0],
    [40, 0],
    [13, 0.5],
    [8, 0],
  ])("scores a feels-like temperature of %s°C as %s", (value, expected) => {
    expect(trapezoid(value, factorRanges.temperature)).toBeCloseTo(expected);
  });

  it("only penalizes high values when there is no lower limit", () => {
    expect(trapezoid(0, factorRanges.rain)).toBe(1);
    expect(trapezoid(40, factorRanges.rain)).toBeCloseTo(0.5);
    expect(trapezoid(70, factorRanges.rain)).toBe(0);
  });
});

describe("scoreHour", () => {
  it("gives 100 to a perfect hour", () => {
    expect(scoreHour(hourAt("2026-10-18", 10), "day").score).toBeCloseTo(100);
  });

  it("does not let good comfort compensate for rain", () => {
    const rainy = hourAt("2026-10-18", 10, { precipitationProbability: 90 });

    expect(scoreHour(rainy, "day").score).toBe(0);
  });

  it("lets comfort factors compensate each other", () => {
    const windy = hourAt("2026-10-18", 10, { windSpeed: 27.5 });

    expect(scoreHour(windy, "day").score).toBeCloseTo(87.5);
  });

  it("does not let good comfort compensate for a gale", () => {
    const gale = hourAt("2026-10-18", 10, { windSpeed: 45 });
    const strong = hourAt("2026-10-18", 10, { windSpeed: 35 });

    expect(scoreHour(gale, "day").score).toBeCloseTo(18.75);
    expect(scoreHour(strong, "day").score).toBeCloseTo(60);
  });

  it("vetoes thunderstorms regardless of the other factors", () => {
    const storm = hourAt("2026-10-18", 10, { weatherCode: 95 });

    expect(scoreHour(storm, "day").score).toBe(0);
  });

  it("ignores UV at night by redistributing its weight", () => {
    const highUv = hourAt("2026-10-18", 20, { uvIndex: 11 });

    expect(scoreHour(highUv, "day").score).toBeCloseTo(80);
    expect(scoreHour(highUv, "night").score).toBeCloseTo(100);
  });
});
