import { HttpError, NetworkError, ParseError } from "@/services/http";

import { errorMessageKey } from "./errorMessageKey";

describe("errorMessageKey", () => {
  it.each([
    ["NetworkError", new NetworkError(), "errors.network"],
    ["HttpError 503", new HttpError(503), "errors.server"],
    ["HttpError 400", new HttpError(400), "errors.generic"],
    ["ParseError", new ParseError(), "errors.generic"],
    ["unknown error", new Error("boom"), "errors.generic"],
  ])("%s → %s", (_label, error, expected) => {
    expect(errorMessageKey(error)).toBe(expected);
  });
});
