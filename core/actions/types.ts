/**
 * Typed Server Action result shapes used across all domain modules.
 *
 * Success spreads extra fields flat: `{ ok: true, quote }` / `{ ok: true, user }`.
 * Failure is always `{ ok: false, error }` (Persian or module-local message).
 */

export type ActionSuccess<T extends Record<string, unknown> = Record<string, never>> =
  { ok: true } & T;

export type ActionFailure = {
  ok: false;
  error: string;
  /** Optional Zod field paths → messages for form UIs. */
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T extends Record<string, unknown> = Record<string, never>> =
  | ActionSuccess<T>
  | ActionFailure;

export type ActionMessages = {
  /** Shown when Zod validation fails. */
  validation?: string;
  /** Shown for unexpected thrown errors. */
  unexpected?: string;
  /** Map thrown `Unauthorized` → user-facing message. */
  unauthorized?: string;
  /** Map thrown `Forbidden` → user-facing message. */
  forbidden?: string;
};

export const DEFAULT_ACTION_MESSAGES = {
  validation: "ورودی نامعتبر است",
  unexpected: "خطای غیرمنتظره رخ داد",
  unauthorized: "برای ادامه وارد حساب شوید",
  forbidden: "دسترسی مجاز نیست",
} as const satisfies Required<ActionMessages>;
