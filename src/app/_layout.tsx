import "../../global.css";
import "@/i18n";

import {
  Jost_200ExtraLight,
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  useFonts,
} from "@expo-google-fonts/jost";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAssets } from "expo-asset";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { useAppStateFocus } from "@/hooks/useAppStateFocus";
import { useDeviceLanguageSync } from "@/hooks/useDeviceLanguageSync";
import { createQueryClient } from "@/services/queryClient";
import { PeriodTheme, usePalette } from "@/theme/PeriodTheme";
import { PAPER_TEXTURE } from "@/theme/textures";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 300 });

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const [fontsLoaded, fontError] = useFonts({
    Jost_200ExtraLight,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
  });
  const [textures, textureError] = useAssets([PAPER_TEXTURE]);
  const colors = usePalette("day");
  useAppStateFocus();
  useDeviceLanguageSync();

  const fontsReady = fontsLoaded || fontError;
  const texturesReady = textures || textureError;
  const isReady = Boolean(fontsReady && texturesReady);

  useEffect(() => {
    if (isReady) void SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <PeriodTheme period="day" className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </PeriodTheme>
    </QueryClientProvider>
  );
}
