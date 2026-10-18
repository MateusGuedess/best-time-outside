import type { z } from "zod";

export const REQUEST_TIMEOUT_MS = 10_000;

export class NetworkError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Network request failed", options);
    this.name = "NetworkError";
  }
}

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export class ParseError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Response does not match the expected format", options);
    this.name = "ParseError";
  }
}

export function isRetryable(error: unknown): boolean {
  return error instanceof NetworkError || (error instanceof HttpError && error.status >= 500);
}

export async function httpGet<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
  signal?: AbortSignal,
): Promise<z.output<Schema>> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, REQUEST_TIMEOUT_MS);
  signal?.addEventListener("abort", abort);
  if (signal?.aborted) abort();

  const fail =
    (toError: (cause: unknown) => Error) =>
    (error: unknown): never => {
      if (signal?.aborted) throw error;
      if (controller.signal.aborted) throw new NetworkError({ cause: error });
      throw toError(error);
    };

  try {
    const response = await fetch(url, { signal: controller.signal }).catch(
      fail((cause) => new NetworkError({ cause })),
    );
    if (!response.ok) throw new HttpError(response.status);

    const json: unknown = await response.json().catch(fail((cause) => new ParseError({ cause })));

    const result = schema.safeParse(json);
    if (!result.success) throw new ParseError({ cause: result.error });
    return result.data;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
