import { focusManager } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";

import { useAppStateFocus } from "./useAppStateFocus";

const remove = jest.fn();
let emitAppState: (status: AppStateStatus) => void = () => {};

jest.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => {
  emitAppState = listener;
  return { remove };
});

afterEach(() => {
  focusManager.setFocused(undefined);
  remove.mockClear();
});

describe("useAppStateFocus", () => {
  it("marks queries as unfocused when the app goes to the background", async () => {
    await renderHook(useAppStateFocus);

    emitAppState("background");

    expect(focusManager.isFocused()).toBe(false);
  });

  it("marks queries as focused when the app becomes active again", async () => {
    await renderHook(useAppStateFocus);

    emitAppState("background");
    emitAppState("active");

    expect(focusManager.isFocused()).toBe(true);
  });

  it("stops listening on unmount", async () => {
    const { unmount } = await renderHook(useAppStateFocus);

    await unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
