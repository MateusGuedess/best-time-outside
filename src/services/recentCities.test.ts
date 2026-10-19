import AsyncStorage from "@react-native-async-storage/async-storage";

import type { City } from "@/types/city";

import {
  MAX_RECENT_CITIES,
  RECENT_CITIES_STORAGE_KEY,
  addRecentCity,
  loadRecentCities,
  saveRecentCities,
} from "./recentCities";

function city(id: number): City {
  return { id, name: `City ${id}`, latitude: 0, longitude: 0 };
}

afterEach(() => AsyncStorage.clear());

describe("addRecentCity", () => {
  it("puts the selected city first", () => {
    expect(addRecentCity([city(1), city(2)], city(3)).map(({ id }) => id)).toEqual([3, 1, 2]);
  });

  it("moves a city already in the list to the top without duplicating it", () => {
    expect(addRecentCity([city(1), city(2), city(3)], city(2)).map(({ id }) => id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("keeps at most the maximum number of cities, dropping the oldest", () => {
    const full = [1, 2, 3, 4, 5].map(city);

    const result = addRecentCity(full, city(6));

    expect(result).toHaveLength(MAX_RECENT_CITIES);
    expect(result.map(({ id }) => id)).toEqual([6, 1, 2, 3, 4]);
  });
});

describe("loadRecentCities", () => {
  it("returns an empty list when nothing was saved", async () => {
    await expect(loadRecentCities()).resolves.toEqual([]);
  });

  it("returns the saved cities", async () => {
    await saveRecentCities([city(1), city(2)]);

    await expect(loadRecentCities()).resolves.toEqual([city(1), city(2)]);
  });

  it("discards stored data that is not valid JSON", async () => {
    await AsyncStorage.setItem(RECENT_CITIES_STORAGE_KEY, "{not json");

    await expect(loadRecentCities()).resolves.toEqual([]);
  });

  it("discards stored data with an unexpected shape", async () => {
    await AsyncStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify([{ id: "1" }]));

    await expect(loadRecentCities()).resolves.toEqual([]);
  });

  it("returns an empty list when the storage fails", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("disk"));

    await expect(loadRecentCities()).resolves.toEqual([]);
  });
});
