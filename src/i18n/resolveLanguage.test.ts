import { resolveLanguage } from "./resolveLanguage";

describe("resolveLanguage", () => {
  it.each([
    [["pt"], "pt"],
    [["es"], "es"],
    [["en"], "en"],
  ] as const)("uses a supported device language %j → %s", (codes, expected) => {
    expect(resolveLanguage(codes)).toBe(expected);
  });

  it("ignores the case of the language code", () => {
    expect(resolveLanguage(["PT"])).toBe("pt");
  });

  it("picks the first supported language in the device preference order", () => {
    expect(resolveLanguage(["fr", "es", "pt"])).toBe("es");
  });

  it("falls back to English when no device language is supported", () => {
    expect(resolveLanguage(["fr", "de"])).toBe("en");
  });

  it("falls back to English when the device does not report a language", () => {
    expect(resolveLanguage([null])).toBe("en");
    expect(resolveLanguage([])).toBe("en");
  });
});
