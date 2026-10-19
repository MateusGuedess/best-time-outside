import type { WindowFactors } from "@/types/recommendation";

import { sceneFor, weatherKind } from "./weatherKind";

describe("weatherKind", () => {
  it.each([
    [0, "clear"],
    [1, "clear"],
    [2, "partly"],
    [3, "cloudy"],
    [45, "cloudy"],
    [53, "rain"],
    [81, "rain"],
    [73, "cloudy"],
    [95, "storm"],
  ] as const)("weather code %s is %s", (code, kind) => {
    expect(weatherKind(code)).toBe(kind);
  });
});

describe("sceneFor", () => {
  const calm: WindowFactors = {
    temperature: "pleasant",
    rain: "low",
    wind: "light",
    uvAlert: false,
    storm: false,
  };

  it("always shows the sun by day and the moon at night", () => {
    expect(sceneFor({ period: "day", rating: "great", factors: calm })).toEqual({
      body: "sun",
      sky: "clear",
      wind: "light",
    });
    expect(
      sceneFor({ period: "night", rating: "avoid", factors: { ...calm, storm: true } }).body,
    ).toBe("moon");
  });

  it("covers it with rain when the window is avoided because of rain", () => {
    const wet = { ...calm, rain: "possible" } as const;

    expect(sceneFor({ period: "day", rating: "avoid", factors: wet }).sky).toBe("rain");
    expect(sceneFor({ period: "day", rating: "good", factors: wet }).sky).toBe("clear");
  });

  it("shows a storm whenever there is one, even if rain is unlikely", () => {
    expect(
      sceneFor({ period: "night", rating: "avoid", factors: { ...calm, storm: true } }).sky,
    ).toBe("storm");
  });

  it("keeps a clear sky when the window is avoided for another reason", () => {
    const cold = { ...calm, temperature: "cold" } as const;

    expect(sceneFor({ period: "day", rating: "avoid", factors: cold }).sky).toBe("clear");
  });

  it("carries the wind level of the window", () => {
    expect(
      sceneFor({ period: "day", rating: "good", factors: { ...calm, wind: "strong" } }).wind,
    ).toBe("strong");
  });
});
