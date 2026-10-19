import { citySchema, citySearchSchema } from "@/schemas/geocoding.schema";
import type { City } from "@/types/city";
import type { Language } from "@/types/language";

import { httpGet } from "./http";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";
const SEARCH_RESULT_COUNT = 10;

export function searchCities(
  term: string,
  language: Language,
  signal?: AbortSignal,
): Promise<City[]> {
  const params = new URLSearchParams({
    name: term,
    count: String(SEARCH_RESULT_COUNT),
    language,
    format: "json",
  });
  return httpGet(`${GEOCODING_URL}/search?${params}`, citySearchSchema, signal);
}

export function getCity(id: number, language: Language, signal?: AbortSignal): Promise<City> {
  const params = new URLSearchParams({ id: String(id), language });
  return httpGet(`${GEOCODING_URL}/get?${params}`, citySchema, signal);
}
