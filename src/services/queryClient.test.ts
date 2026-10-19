import { HttpError, NetworkError, ParseError } from "./http";
import { MAX_RETRIES, shouldRetry } from "./queryClient";

describe("shouldRetry", () => {
  it("retries transient failures", () => {
    expect(shouldRetry(0, new NetworkError())).toBe(true);
    expect(shouldRetry(0, new HttpError(503))).toBe(true);
  });

  it("stops after the maximum number of retries", () => {
    expect(shouldRetry(MAX_RETRIES, new NetworkError())).toBe(false);
  });

  it("never retries contract errors", () => {
    expect(shouldRetry(0, new HttpError(404))).toBe(false);
    expect(shouldRetry(0, new ParseError())).toBe(false);
  });
});
