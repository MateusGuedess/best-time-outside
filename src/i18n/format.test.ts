import { at } from "@/test/forecastFactory";

import { formatDate, formatHour, formatTime, toDisplayTemperature, toDisplayWind } from "./format";

describe("formatHour", () => {
  it.each([
    ["pt", 17, "17h"],
    ["es", 9, "9h"],
    ["en", 17, "5 PM"],
    ["en", 0, "12 AM"],
    ["en", 12, "12 PM"],
  ] as const)("in %s, %sh is %s", (language, hour, expected) => {
    expect(formatHour(at("2026-10-19", hour), language)).toBe(expected);
  });
});

describe("formatTime", () => {
  it.each([
    ["pt", "18h05"],
    ["en", "6:05 PM"],
  ] as const)("in %s, 18:05 is %s", (language, expected) => {
    expect(formatTime(at("2026-10-19", 18, 5), language)).toBe(expected);
  });
});

describe("toDisplayTemperature", () => {
  it("keeps celsius and rounds", () => {
    expect(toDisplayTemperature(21.6, "celsius")).toBe(22);
  });

  it("converts to fahrenheit only for display", () => {
    expect(toDisplayTemperature(25, "fahrenheit")).toBe(77);
  });
});

describe("formatDate", () => {
  it.each([
    ["pt-BR", "Segunda-feira, 19 de outubro"],
    ["en-US", "Monday, October 19"],
    ["en-GB", "Monday 19 October"],
    ["es-MX", "Lunes, 19 de octubre"],
  ])("follows the device region in %s", (localeTag, expected) => {
    expect(formatDate("2026-10-19", localeTag)).toBe(expected);
  });
});

describe("toDisplayWind", () => {
  it("keeps km/h and rounds", () => {
    expect(toDisplayWind(12.4, "kmh")).toBe(12);
  });

  it("converts to mph only for display", () => {
    expect(toDisplayWind(32.2, "mph")).toBe(20);
  });
});
