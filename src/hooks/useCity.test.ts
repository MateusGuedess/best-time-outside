import { renderHook, waitFor } from "@testing-library/react-native";

import { getCity } from "@/services/geocoding";
import { cityKeys } from "@/services/queryKeys";
import {
  clearTestQueryClients,
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/queryWrapper";
import type { City } from "@/types/city";

import { useCity } from "./useCity";

jest.mock("@/services/geocoding");

const getCityMock = jest.mocked(getCity);

const lisbon: City = {
  id: 2267057,
  name: "Lisboa",
  latitude: 38.71667,
  longitude: -9.13333,
  region: "Lisboa",
  country: "Portugal",
  countryCode: "PT",
};

afterEach(() => {
  clearTestQueryClients();
  getCityMock.mockReset();
});

describe("useCity", () => {
  it("fetches the city by id", async () => {
    getCityMock.mockResolvedValue(lisbon);

    const { result } = await renderHook(() => useCity(lisbon.id), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(lisbon));
    expect(getCityMock).toHaveBeenCalledWith(lisbon.id, "pt", expect.any(AbortSignal));
  });

  it("reads a city seeded by the search without a request", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(cityKeys.detail(lisbon.id, "pt"), lisbon);

    const { result } = await renderHook(() => useCity(lisbon.id), {
      wrapper: createQueryWrapper(queryClient),
    });

    expect(result.current.data).toEqual(lisbon);
    expect(getCityMock).not.toHaveBeenCalled();
  });
});
