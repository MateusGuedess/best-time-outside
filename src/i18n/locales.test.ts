import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";

function keysOf(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === "object" && child !== null
      ? keysOf(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe("locales", () => {
  it.each([
    ["en", en],
    ["es", es],
  ])("%s has exactly the same keys as pt", (_language, locale) => {
    expect(keysOf(locale).sort()).toEqual(keysOf(pt).sort());
  });
});
