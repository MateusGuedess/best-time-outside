import { useLocales } from "expo-localization";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { resolveLanguage } from "@/i18n/resolveLanguage";

export function useDeviceLanguageSync() {
  const locales = useLocales();
  const { i18n } = useTranslation();
  const deviceLanguage = resolveLanguage(locales.map((locale) => locale.languageCode));

  useEffect(() => {
    if (i18n.language !== deviceLanguage) i18n.changeLanguage(deviceLanguage);
  }, [deviceLanguage, i18n]);
}
