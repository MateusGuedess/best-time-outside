import "../../global.css";
import "@/i18n";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";

import { useAppStateFocus } from "@/hooks/useAppStateFocus";
import { useDeviceLanguageSync } from "@/hooks/useDeviceLanguageSync";
import { createQueryClient } from "@/services/queryClient";

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  useAppStateFocus();
  useDeviceLanguageSync();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
