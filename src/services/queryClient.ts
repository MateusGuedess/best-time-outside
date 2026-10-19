import { QueryClient } from "@tanstack/react-query";

import { isRetryable } from "./http";

export const MAX_RETRIES = 2;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

export const cacheTimes = {
  city: { staleTime: 24 * HOUR_MS, gcTime: 24 * HOUR_MS },
  forecast: { staleTime: 15 * MINUTE_MS, gcTime: 30 * MINUTE_MS },
} as const;

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
