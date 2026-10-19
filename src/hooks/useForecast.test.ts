import { renderHook, waitFor } from "@testing-library/react-native";

import { getForecast } from "@/services/forecast";
import { twoDayForecast } from "@/test/forecastFactory";
import {
  clearTestQueryClients,
  createQueryWrapper,
  createTestQueryClient,
} from "@/test/queryWrapper";
import type { Coordinates } from "@/types/forecast";

import { useForecast } from "./useForecast";

jest.mock("@/services/forecast");

const getForecastMock = jest.mocked(getForecast);

const lisbon: Coordinates = { latitude: 38.71667, longitude: -9.13333 };

afterEach(() => {
  clearTestQueryClients();
  getForecastMock.mockReset();
});

describe("useForecast", () => {
  it("fetches the forecast for the coordinates", async () => {
    const forecast = twoDayForecast();
    getForecastMock.mockResolvedValue(forecast);

    const { result } = await renderHook(() => useForecast(lisbon), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(forecast));
    expect(getForecastMock).toHaveBeenCalledWith(lisbon, expect.any(AbortSignal));
  });

  it("waits without a request while there are no coordinates", async () => {
    const { result } = await renderHook(() => useForecast(undefined), {
      wrapper: createQueryWrapper(createTestQueryClient()),
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe("idle");
    expect(getForecastMock).not.toHaveBeenCalled();
  });
});
