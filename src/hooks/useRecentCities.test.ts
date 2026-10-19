import { act, renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadRecentCities, saveRecentCities } from "@/services/recentCities";
import type { City } from "@/types/city";

import { useRecentCities } from "./useRecentCities";

function city(id: number): City {
  return { id, name: `City ${id}`, latitude: 0, longitude: 0 };
}

afterEach(() => AsyncStorage.clear());

describe("useRecentCities", () => {
  it("loads the cities saved in a previous session", async () => {
    await saveRecentCities([city(1)]);

    const { result } = await renderHook(useRecentCities);

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.cities).toEqual([city(1)]);
  });

  it("adds a city and persists the new list", async () => {
    await saveRecentCities([city(1)]);
    const { result } = await renderHook(useRecentCities);
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    await act(() => result.current.add(city(2)));

    expect(result.current.cities).toEqual([city(2), city(1)]);
    await waitFor(async () => expect(await loadRecentCities()).toEqual([city(2), city(1)]));
  });
});

describe("useRecentCities before the storage is read", () => {
  it("keeps a city added while the saved list is still loading", async () => {
    await saveRecentCities([city(1)]);
    const { result } = await renderHook(useRecentCities);

    await act(() => result.current.add(city(2)));
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    expect(result.current.cities).toEqual([city(2), city(1)]);
  });
});
