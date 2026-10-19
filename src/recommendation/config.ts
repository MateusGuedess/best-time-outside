export type Trapezoid = {
  zeroBelow?: number;
  idealFrom?: number;
  idealTo: number;
  zeroAbove: number;
};

export const factorRanges = {
  temperature: { zeroBelow: 8, idealFrom: 18, idealTo: 26, zeroAbove: 34 },
  rain: { idealTo: 10, zeroAbove: 70 },
  wind: { idealTo: 15, zeroAbove: 40 },
  strongWind: { idealTo: 30, zeroAbove: 50 },
  uv: { idealTo: 5, zeroAbove: 11 },
} as const satisfies Record<string, Trapezoid>;

export const comfortWeights = {
  day: { temperature: 0.55, wind: 0.25, uv: 0.2 },
  night: { temperature: 0.7, wind: 0.3, uv: 0 },
} as const;

export const STORM_WEATHER_CODES = { from: 95, to: 99 } as const;

export const windowRules = {
  maxHours: 4,
  maxDistanceFromBest: 10,
  minScore: 60,
} as const;

export const ratingThresholds = {
  great: 75,
  good: 50,
} as const;

export const NIGHT_END_HOUR = 2;

export const levelThresholds = {
  temperature: { cool: 12, pleasant: 18, warm: 26, hot: 30 },
  rain: { possible: 20, likely: 50 },
  wind: { breezy: 15, strong: 30 },
  uvAlert: 8,
} as const;
