import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

export function useAppStateFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);
}
