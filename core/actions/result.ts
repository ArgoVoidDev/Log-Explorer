import type { z } from "zod";

import type { ActionFailure, ActionResult, ActionSuccess } from "./types";

/** Build a success result; extra fields are flattened onto `{ ok: true }`. */
export function actionOk(): ActionSuccess;
export function actionOk<T extends Record<string, unknown>>(
  data: T,
): ActionSuccess<T>;
export function actionOk<T extends Record<string, unknown>>(
  data?: T,
): ActionSuccess<T> {
  return { ok: true, ...(data ?? {}) } as ActionSuccess<T>;
}

/** Build a failure result. */
export function actionFail(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionFailure {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error };
}

/** Narrow an `ActionResult` to success. */
export function isActionOk<T extends Record<string, unknown>>(
  result: ActionResult<T>,
): result is ActionSuccess<T> {
  return result.ok;
}

/** Collect Zod issues into a path → messages map. */
export function zodFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
