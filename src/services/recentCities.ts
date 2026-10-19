import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

import { citySchema } from "@/schemas/city.schema";
import type { City } from "@/types/city";

export const RECENT_CITIES_STORAGE_KEY = "recentCities:v1";
export const MAX_RECENT_CITIES = 5;

export function addRecentCity(cities: readonly City[], city: City): City[] {
  return [city, ...cities.filter(({ id }) => id !== city.id)].slice(0, MAX_RECENT_CITIES);
}

export async function loadRecentCities(): Promise<City[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENT_CITIES_STORAGE_KEY);
    if (stored === null) return [];
    const result = z.array(citySchema).safeParse(JSON.parse(stored));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export async function saveRecentCities(cities: readonly City[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(cities));
  } catch {}
}
