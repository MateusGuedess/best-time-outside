import { act, renderHook, waitFor } from "@testing-library/react-native";

import { searchCities } from "@/services/geocoding";
import {
  clearTestQueryClients,
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/queryWrapper";
import type { City } from "@/types/city";

import { SEARCH_DEBOUNCE_MS, useCitySearch } from "./useCitySearch";

jest.mock("@/services/geocoding");

const searchCitiesMock = jest.mocked(searchCities);

function city(id: number, name: string): City {
  return {
    id,
    name,
    latitude: 0,
    longitude: 0,
    region: undefined,
    country: undefined,
    countryCode: undefined,
  };
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

async function renderSearch() {
  const { result, rerender } = await renderHook(
    ({ term }: { term: string }) => useCitySearch(term),
    {
      initialProps: { term: "" },
      wrapper: createQueryWrapper(createTestQueryClient()),
    },
  );
  const type = (term: string) => rerender({ term });
  return { result, type };
}

async function waitForDebounce() {
  await act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
}

beforeEach(() => jest.useFakeTimers());

afterEach(() => {
  clearTestQueryClients();
  jest.useRealTimers();
  searchCitiesMock.mockReset();
});

describe("useCitySearch", () => {
  it("stays idle and does not search with fewer than two characters", async () => {
    const { result, type } = await renderSearch();

    await type(" l ");
    await waitForDebounce();

    expect(result.current.isIdle).toBe(true);
    expect(searchCitiesMock).not.toHaveBeenCalled();
  });

  it("searches with the trimmed term once the user stops typing", async () => {
    searchCitiesMock.mockResolvedValue([city(1, "Lisboa")]);
    const { result, type } = await renderSearch();

    await type("lisboa ");

    expect(searchCitiesMock).not.toHaveBeenCalled();

    await waitForDebounce();

    expect(searchCitiesMock).toHaveBeenCalledWith("lisboa", "pt", expect.any(AbortSignal));
    await waitFor(() => expect(result.current.cities).toEqual([city(1, "Lisboa")]));
  });

  it("only searches the final term when typing quickly", async () => {
    searchCitiesMock.mockResolvedValue([]);
    const { type } = await renderSearch();

    await type("li");
    await type("lis");
    await type("lisb");
    await waitForDebounce();

    expect(searchCitiesMock).toHaveBeenCalledTimes(1);
    expect(searchCitiesMock).toHaveBeenCalledWith("lisb", "pt", expect.any(AbortSignal));
  });

  it("keeps the previous results while the next search is loading", async () => {
    searchCitiesMock.mockResolvedValueOnce([city(1, "Lisboa")]);
    const { result, type } = await renderSearch();
    await type("lis");
    await waitForDebounce();
    await waitFor(() => expect(result.current.cities).toEqual([city(1, "Lisboa")]));

    const nextSearch = deferred<City[]>();
    searchCitiesMock.mockReturnValueOnce(nextSearch.promise);
    await type("lisbon");
    await waitForDebounce();

    expect(result.current.isFetching).toBe(true);
    expect(result.current.cities).toEqual([city(1, "Lisboa")]);

    await act(async () => nextSearch.resolve([city(2, "Lisbon")]));

    await waitFor(() => expect(result.current.cities).toEqual([city(2, "Lisbon")]));
  });

  it("clears the results as soon as the field is cleared", async () => {
    searchCitiesMock.mockResolvedValue([city(1, "Lisboa")]);
    const { result, type } = await renderSearch();
    await type("lisboa");
    await waitForDebounce();
    await waitFor(() => expect(result.current.cities).toHaveLength(1));

    await type("");

    expect(result.current.isIdle).toBe(true);
    expect(result.current.cities).toBeUndefined();
  });

  it("exposes the error of a failed search", async () => {
    const failure = new Error("offline");
    searchCitiesMock.mockRejectedValue(failure);
    const { result, type } = await renderSearch();
    await type("lisboa");
    await waitForDebounce();

    await waitFor(() => expect(result.current.error).toBe(failure));
  });
});
