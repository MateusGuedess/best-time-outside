import type { Period } from "@/types/recommendation";

export type ColorScheme = "light" | "dark";

export type PeriodColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  sun: string;
  moon: string;
  moonShade: string;
  cloud: string;
  flash: string;
};

export const palette: Record<ColorScheme, Record<Period, PeriodColors>> = {
  light: {
    day: {
      background: "#F7F2EB",
      surface: "#E6DFDB",
      text: "#000000",
      muted: "#5D5850",
      accent: "#EFD8BC",
      sun: "#E51B0E",
      moon: "#D8915A",
      moonShade: "#B1784C",
      cloud: "#605F5F",
      flash: "#F2C14E",
    },
    night: {
      background: "#252525",
      surface: "#2F2F2F",
      text: "#FFFFFF",
      muted: "#CDCDCD",
      accent: "#6F4C33",
      sun: "#E51B0E",
      moon: "#D8915A",
      moonShade: "#B1784C",
      cloud: "#8A8989",
      flash: "#F5D98B",
    },
  },
  dark: {
    day: {
      background: "#1F1C19",
      surface: "#2B2723",
      text: "#F2ECE4",
      muted: "#A39E96",
      accent: "#4A3F33",
      sun: "#C4473B",
      moon: "#C2824F",
      moonShade: "#9E6B44",
      cloud: "#8A8785",
      flash: "#C9A24A",
    },
    night: {
      background: "#141518",
      surface: "#1E1F23",
      text: "#E6E6E6",
      muted: "#A6A7AB",
      accent: "#3D352D",
      sun: "#C4473B",
      moon: "#C2824F",
      moonShade: "#9E6B44",
      cloud: "#7E7F84",
      flash: "#D4B970",
    },
  },
};

const cssTokens = ["background", "surface", "text", "muted", "accent"] as const;

function toRgbChannels(hex: string): string {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(" ");
}

export function cssVariables(colors: PeriodColors): Record<`--color-${string}`, string> {
  return Object.fromEntries(
    cssTokens.map((token) => [`--color-${token}`, toRgbChannels(colors[token])]),
  );
}
