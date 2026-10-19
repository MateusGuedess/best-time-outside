import { HttpError, NetworkError } from "@/services/http";

export type ErrorMessageKey = "errors.network" | "errors.server" | "errors.generic";

export function errorMessageKey(error: unknown): ErrorMessageKey {
  if (error instanceof NetworkError) return "errors.network";
  if (error instanceof HttpError && error.status >= 500) return "errors.server";
  return "errors.generic";
}
