import { getLocales } from "expo-localization";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import { FALLBACK_LANGUAGE, resolveLanguage } from "./resolveLanguage";

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
} as const;

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLocales().map((locale) => locale.languageCode)),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
