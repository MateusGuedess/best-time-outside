import { act, renderHook } from "@testing-library/react-native";

import { useNow } from "./useNow";

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-10-19T12:00:00Z"));
});

afterEach(() => jest.useRealTimers());

describe("useNow", () => {
  it("starts at the current time and advances every minute", async () => {
    const { result } = await renderHook(() => useNow());

    expect(result.current).toBe(Date.parse("2026-10-19T12:00:00Z"));

    await act(() => jest.advanceTimersByTime(60 * 1000));

    expect(result.current).toBe(Date.parse("2026-10-19T12:01:00Z"));
  });
});
