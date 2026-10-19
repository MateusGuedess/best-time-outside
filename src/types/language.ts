export const SUPPORTED_LANGUAGES = ["pt", "en", "es"] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];
