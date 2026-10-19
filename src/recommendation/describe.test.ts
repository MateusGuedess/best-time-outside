import type { ScoredHour } from "@/types/recommendation";

import { hourAt } from "@/test/forecastFactory";

import {
  describeFactors,
  dominantCondition,
  rainLevel,
  rate,
  temperatureLevel,
  windLevel,
  windowScore,
} from "./describe";
import { suggestionsFor } from "./suggestions";

function scored(overrides: Parameters<typeof hourAt>[2], score = 90): ScoredHour {
  return { ...hourAt("2026-10-18", 15, overrides), period: "day", score };
}

describe("levels", () => {
  it.each([
    [5, "cold"],
    [12, "cool"],
    [18, "pleasant"],
    [26, "pleasant"],
    [28, "warm"],
    [31, "hot"],
  ] as const)("feels-like %s°C is %s", (value, level) => {
    expect(temperatureLevel(value)).toBe(level);
  });

  it.each([
    [10, "low"],
    [20, "possible"],
    [50, "possible"],
    [60, "likely"],
  ] as const)("%s%% chance of rain is %s", (value, level) => {
    expect(rainLevel(value)).toBe(level);
  });

  it.each([
    [10, "light"],
    [20, "breezy"],
    [35, "strong"],
  ] as const)("wind of %s km/h is %s", (value, level) => {
    expect(windLevel(value)).toBe(level);
  });

  it.each([
    [80, "great"],
    [75, "great"],
    [60, "good"],
    [50, "good"],
    [49, "avoid"],
  ] as const)("score %s is rated %s", (score, rating) => {
    expect(rate(score)).toBe(rating);
  });
});

describe("describeFactors", () => {
  it("uses the average temperature and the worst rain, wind and UV of the window", () => {
    const hours = [
      scored({ apparentTemperature: 20, precipitationProbability: 5, windSpeed: 5, uvIndex: 9 }),
      scored({ apparentTemperature: 24, precipitationProbability: 30, windSpeed: 20, uvIndex: 2 }),
    ];

    expect(describeFactors(hours)).toEqual({
      temperature: "pleasant",
      rain: "possible",
      wind: "breezy",
      uvAlert: true,
      storm: false,
    });
  });

  it("flags a storm in any hour of the window", () => {
    expect(describeFactors([scored({}), scored({ weatherCode: 96 }, 0)]).storm).toBe(true);
  });
});

describe("windowScore", () => {
  it("is the rounded average of the hours", () => {
    expect(windowScore([scored({}, 90), scored({}, 85)])).toBe(88);
  });
});

describe("dominantCondition and suggestions", () => {
  it.each([
    ["great", "pleasant", "pleasant"],
    ["good", "cool", "pleasant"],
    ["great", "hot", "hot"],
    ["good", "warm", "hot"],
    ["good", "cold", "cold"],
    ["avoid", "pleasant", "indoor"],
    ["avoid", "cold", "indoor"],
  ] as const)("rated %s and %s → %s", (rating, temperature, condition) => {
    expect(dominantCondition(rating, temperature)).toBe(condition);
  });

  it("returns translation keys from a fixed table", () => {
    expect(suggestionsFor("night", "indoor")).toEqual([
      "suggestions.night.indoor.movieAtHome",
      "suggestions.night.indoor.cozyRestaurant",
    ]);
  });
});
