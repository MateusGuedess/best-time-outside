import { z } from "zod";

import {
  HttpError,
  NetworkError,
  ParseError,
  REQUEST_TIMEOUT_MS,
  httpGet,
  isRetryable,
} from "./http";

const ENDPOINT = "https://api.example.com/resource";

const schema = z
  .object({ is_day: z.union([z.literal(0), z.literal(1)]) })
  .transform(({ is_day }) => ({ isDay: is_day === 1 }));

const fetchMock = jest.spyOn(globalThis, "fetch");

function respondWith(body: string, status = 200) {
  fetchMock.mockResolvedValue(new Response(body, { status }));
}

function respondNever() {
  fetchMock.mockImplementation(
    (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(Object.assign(new Error("Aborted"), { name: "AbortError" })),
        );
      }),
  );
}

afterEach(() => {
  fetchMock.mockReset();
  jest.useRealTimers();
});

describe("httpGet", () => {
  it("returns the data validated and transformed by the schema", async () => {
    respondWith(JSON.stringify({ is_day: 1 }));

    await expect(httpGet(ENDPOINT, schema)).resolves.toEqual({ isDay: true });
  });

  it("throws HttpError with the status when the response is not 2xx", async () => {
    respondWith("Not found", 404);

    const error = await httpGet(ENDPOINT, schema).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(404);
  });

  it("throws ParseError when the body does not match the schema", async () => {
    respondWith(JSON.stringify({ is_day: "yes" }));

    await expect(httpGet(ENDPOINT, schema)).rejects.toBeInstanceOf(ParseError);
  });

  it("throws ParseError when the body is not JSON", async () => {
    respondWith("<html>Bad gateway</html>");

    await expect(httpGet(ENDPOINT, schema)).rejects.toBeInstanceOf(ParseError);
  });

  it("throws NetworkError when the request fails without a response", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    await expect(httpGet(ENDPOINT, schema)).rejects.toBeInstanceOf(NetworkError);
  });

  it("throws NetworkError when the server takes longer than the timeout", async () => {
    jest.useFakeTimers();
    respondNever();

    const request = httpGet(ENDPOINT, schema);
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);

    await expect(request).rejects.toBeInstanceOf(NetworkError);
  });

  it("rethrows the abort as is when the caller cancels the request", async () => {
    respondNever();
    const controller = new AbortController();

    const request = httpGet(ENDPOINT, schema, controller.signal);
    controller.abort();

    const error = await request.catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(NetworkError);
    expect((error as Error).name).toBe("AbortError");
  });
});

describe("isRetryable", () => {
  it.each([
    ["NetworkError", new NetworkError(), true],
    ["HttpError 503", new HttpError(503), true],
    ["HttpError 404", new HttpError(404), false],
    ["ParseError", new ParseError(), false],
    ["unknown error", new Error("boom"), false],
  ])("%s → %s", (_label, error, expected) => {
    expect(isRetryable(error)).toBe(expected);
  });
});
