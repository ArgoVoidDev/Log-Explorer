/**
 * Domain / guard errors for Server Actions.
 * Thrown errors become `{ ok: false, error }` via `createAction`.
 * Next.js `redirect` / `notFound` are rethrown and never mapped.
 */

export class ActionError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ActionError";
    this.code = code;
  }
}

/** True when `requireAuth` / guards throw plain `Error("Unauthorized")`. */
export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof Error && err.message === "Unauthorized";
}

/** True when guards throw plain `Error("Forbidden")`. */
export function isForbiddenError(err: unknown): boolean {
  return err instanceof Error && err.message === "Forbidden";
}
