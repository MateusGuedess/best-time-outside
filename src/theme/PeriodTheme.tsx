import { vars } from "nativewind";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme, View } from "react-native";

import type { Period } from "@/types/recommendation";

import { cssVariables, palette, type PeriodColors } from "./palette";

const PeriodColorsContext = createContext<PeriodColors>(palette.light.day);

export function usePalette(period: Period): PeriodColors {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return palette[scheme][period];
}

export function usePeriodColors(): PeriodColors {
  return useContext(PeriodColorsContext);
}

type PeriodThemeProps = {
  period: Period;
  className?: string;
  children: ReactNode;
};

export function PeriodTheme({ period, className, children }: PeriodThemeProps) {
  const colors = usePalette(period);
  const style = useMemo(() => vars(cssVariables(colors)), [colors]);

  return (
    <PeriodColorsContext.Provider value={colors}>
      <View style={style} className={className}>
        {children}
      </View>
    </PeriodColorsContext.Provider>
  );
}
