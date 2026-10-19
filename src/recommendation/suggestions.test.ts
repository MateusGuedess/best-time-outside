import pt from "@/i18n/locales/pt.json";
import type { Condition, Period } from "@/types/recommendation";

import { suggestionsFor } from "./suggestions";

const periods: Period[] = ["day", "night"];
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

describe("suggestionsFor", () => {
  describe.each(periods)("%s", (period) => {
    it.each(conditions)("offers 2 to 3 translated suggestions when %s", (condition) => {
      const keys = suggestionsFor(period, condition);

      expect(keys.length).toBeGreaterThanOrEqual(2);
      expect(keys.length).toBeLessThanOrEqual(3);
      keys.forEach((key) => expect(typeof translationAt(key)).toBe("string"));
    });
  });
});
