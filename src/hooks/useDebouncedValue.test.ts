import { act, renderHook } from "@testing-library/react-native";

import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("returns the initial value immediately", async () => {
    const { result } = await renderHook(() => useDebouncedValue("sa", 350));

    expect(result.current).toBe("sa");
  });

  it("only updates after the value stops changing for the delay", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 350),
      { initialProps: { value: "sa" } },
    );

    await rerender({ value: "san" });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: "santa" });
    await act(() => jest.advanceTimersByTime(200));

    // 400 ms se passaram no total, mas só 200 ms desde a última mudança
    expect(result.current).toBe("sa");

    await act(() => jest.advanceTimersByTime(150));

    expect(result.current).toBe("santa");
  });
});
