import "../../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";

import { useAppStateFocus } from "@/hooks/useAppStateFocus";
import { createQueryClient } from "@/services/queryClient";

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  useAppStateFocus();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
