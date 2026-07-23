import type { ApiStatus } from "./types";

/**
 * Throw from an API handler to return `{ error }` with an HTTP status.
 * Uncaught exceptions become 500 via `createApiHandler`.
 */
export class ApiError extends Error {
  readonly status: ApiStatus;

  constructor(message: string, status: ApiStatus = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof Error && err.message === "Unauthorized";
}

export function isForbiddenError(err: unknown): boolean {
  return err instanceof Error && err.message === "Forbidden";
}
