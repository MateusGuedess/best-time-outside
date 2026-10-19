import type { LocalDateTime } from "@/types/forecast";
import type { Condition } from "@/types/recommendation";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "late";

const MORNING_FROM = 5;
const AFTERNOON_FROM = 12;
const EVENING_FROM = 18;
const LATE_FROM = 22;

const suggestionTable = {
  morning: {
    pleasant: ["park", "run", "bikeRide"],
    hot: ["earlyBeach", "shadeWalk", "streetMarket"],
    cold: ["sunWalk", "bakeryBreakfast"],
    indoor: ["bakeryBreakfast", "gym", "cityMarket"],
  },
  afternoon: {
    pleasant: ["park", "picnic", "bikeRide"],
    hot: ["beach", "iceCream", "shadeWalk"],
    cold: ["sunWalk", "viewCafe"],
    indoor: ["cinema", "museum", "cafe"],
  },
  evening: {
    pleasant: ["sidewalkBar", "outdoorDinner"],
    hot: ["bar", "acai", "boardwalk"],
    cold: ["soupRestaurant", "fondue", "hotChocolate"],
    indoor: ["cinema", "cozyRestaurant"],
  },
  late: {
    pleasant: ["sidewalkBar", "liveMusic"],
    hot: ["bar", "boardwalk"],
    cold: ["cozyBar", "liveMusic"],
    indoor: ["movieAtHome", "deliveryDinner"],
  },
} as const satisfies Record<TimeOfDay, Record<Condition, readonly string[]>>;

export type Activity = (typeof suggestionTable)[TimeOfDay][Condition][number];

export type SuggestionKey = `activities.${Activity}`;

export function timeOfDay({ hour }: LocalDateTime): TimeOfDay {
  if (hour >= MORNING_FROM && hour < AFTERNOON_FROM) return "morning";
  if (hour >= AFTERNOON_FROM && hour < EVENING_FROM) return "afternoon";
  if (hour >= EVENING_FROM && hour < LATE_FROM) return "evening";
  return "late";
}

export function suggestionsFor(time: TimeOfDay, condition: Condition): SuggestionKey[] {
  return suggestionTable[time][condition].map(
    (activity): SuggestionKey => `activities.${activity}`,
  );
}
