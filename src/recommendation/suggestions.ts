import type { Condition, Period } from "@/types/recommendation";

const suggestionTable = {
  day: {
    pleasant: [
      "suggestions.day.pleasant.park",
      "suggestions.day.pleasant.run",
      "suggestions.day.pleasant.picnic",
    ],
    hot: [
      "suggestions.day.hot.beach",
      "suggestions.day.hot.iceCream",
      "suggestions.day.hot.shadeWalk",
    ],
    cold: ["suggestions.day.cold.sunWalk", "suggestions.day.cold.viewCafe"],
    indoor: [
      "suggestions.day.indoor.cinema",
      "suggestions.day.indoor.museum",
      "suggestions.day.indoor.cafe",
    ],
  },
  night: {
    pleasant: [
      "suggestions.night.pleasant.sidewalkBar",
      "suggestions.night.pleasant.outdoorDinner",
    ],
    hot: [
      "suggestions.night.hot.bar",
      "suggestions.night.hot.acai",
      "suggestions.night.hot.boardwalk",
    ],
    cold: [
      "suggestions.night.cold.soupRestaurant",
      "suggestions.night.cold.fondue",
      "suggestions.night.cold.hotChocolate",
    ],
    indoor: ["suggestions.night.indoor.movieAtHome", "suggestions.night.indoor.cozyRestaurant"],
  },
} as const satisfies Record<Period, Record<Condition, readonly `suggestions.${string}`[]>>;

export type SuggestionKey = (typeof suggestionTable)[Period][Condition][number];

export function suggestionsFor(period: Period, condition: Condition): SuggestionKey[] {
  return [...suggestionTable[period][condition]];
}
