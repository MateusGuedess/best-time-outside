import { renderHook, waitFor } from "@testing-library/react-native";
import { useLocales, type Locale } from "expo-localization";

import i18n from "@/i18n";

import { useDeviceLanguageSync } from "./useDeviceLanguageSync";

jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  useLocales: jest.fn(),
}));

const useLocalesMock = jest.mocked(useLocales);

function deviceLanguages(...codes: string[]) {
  const locales = codes.map((languageCode) => ({ languageCode }) as Locale);
  useLocalesMock.mockReturnValue(locales as [Locale, ...Locale[]]);
}

afterEach(() => i18n.changeLanguage("pt"));

describe("useDeviceLanguageSync", () => {
  it("switches the app language when the device language changes", async () => {
    deviceLanguages("pt");
    const { rerender } = await renderHook(useDeviceLanguageSync);

    deviceLanguages("es");
    await rerender({});

    await waitFor(() => expect(i18n.language).toBe("es"));
  });

  it("falls back to English for an unsupported device language", async () => {
    deviceLanguages("fr");

    await renderHook(useDeviceLanguageSync);

    await waitFor(() => expect(i18n.language).toBe("en"));
  });
});
