import pt from "@/i18n/locales/pt.json";
import { at } from "@/test/forecastFactory";
import type { Condition } from "@/types/recommendation";

import { suggestionsFor, timeOfDay, type TimeOfDay } from "./suggestions";

const times: TimeOfDay[] = ["morning", "afternoon", "evening", "late"];
const conditions: Condition[] = ["pleasant", "hot", "cold", "indoor"];

function translationAt(key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, segment) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[segment]
          : undefined,
      pt,
    );
}

describe("timeOfDay", () => {
  it.each([
    [5, "morning"],
    [7, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [17, "afternoon"],
    [18, "evening"],
    [21, "evening"],
    [22, "late"],
    [1, "late"],
    [4, "late"],
  ] as const)("a window starting at %sh is in the %s", (hour, expected) => {
    expect(timeOfDay(at("2026-10-19", hour))).toBe(expected);
  });
});

describe("suggestionsFor", () => {
  describe.each(times)("%s", (time) => {
    it.each(conditions)("offers 2 to 3 translated suggestions when %s", (condition) => {
      const keys = suggestionsFor(time, condition);

      expect(keys.length).toBeGreaterThanOrEqual(2);
      expect(keys.length).toBeLessThanOrEqual(3);
      keys.forEach((key) => expect(typeof translationAt(key)).toBe("string"));
    });
  });

  it("only suggests places that are open early on a rainy morning", () => {
    const keys = suggestionsFor(timeOfDay(at("2026-10-19", 7)), "indoor");

    expect(keys).not.toContain("activities.cinema");
    expect(keys).not.toContain("activities.museum");
    expect(keys).toContain("activities.bakeryBreakfast");
  });
});
