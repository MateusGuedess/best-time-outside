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
    [4, "morning"],
    [7, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [17, "afternoon"],
    [18, "evening"],
    [20, "evening"],
  ] as const)("a day window starting at %sh is in the %s", (hour, expected) => {
    expect(timeOfDay(at("2026-10-19", hour), "day")).toBe(expected);
  });

  it.each([
    [17, "evening"],
    [18, "evening"],
    [21, "evening"],
    [22, "late"],
    [1, "late"],
    [4, "late"],
  ] as const)("a night window starting at %sh is in the %s", (hour, expected) => {
    expect(timeOfDay(at("2026-10-19", hour), "night")).toBe(expected);
  });

  it("never suggests afternoon activities after an early sunset", () => {
    expect(suggestionsFor(timeOfDay(at("2026-12-21", 17), "night"), "pleasant")).not.toContain(
      "activities.picnic",
    );
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
    const keys = suggestionsFor(timeOfDay(at("2026-10-19", 7), "day"), "indoor");

    expect(keys).not.toContain("activities.cinema");
    expect(keys).not.toContain("activities.museum");
    expect(keys).toContain("activities.bakeryBreakfast");
  });
});
