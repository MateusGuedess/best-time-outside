import { QueryClient } from "@tanstack/react-query";

import { isRetryable } from "./http";

export const MAX_RETRIES = 2;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  return isRetryable(error) && failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
    },
  });
}
