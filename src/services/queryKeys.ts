import type { Coordinates } from "@/types/forecast";
import type { Language } from "@/types/language";

export const cityKeys = {
  all: ["city"] as const,
  search: (term: string, language: Language) => ["city", "search", { term, language }] as const,
  detail: (id: number, language: Language) => ["city", "detail", { id, language }] as const,
};

export const forecastKeys = {
  all: ["forecast"] as const,
  byCoords: (coords: Coordinates) => ["forecast", coords] as const,
};
