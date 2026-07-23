import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import {
  ActionError,
  isForbiddenError,
  isUnauthorizedError,
} from "./errors";
import { actionFail, actionOk, zodFieldErrors } from "./result";
import {
  DEFAULT_ACTION_MESSAGES,
  type ActionMessages,
  type ActionResult,
} from "./types";

type InferSchema<S extends z.ZodType | undefined> = S extends z.ZodType
  ? z.infer<S>
  : undefined;

type HandlerReturn<T extends Record<string, unknown>> =
  | T
  | void
  | ActionResult<T>;

export type CreateActionOptions<
  S extends z.ZodType | undefined,
  T extends Record<string, unknown>,
> = {
  /** Zod schema; omit for actions with no input payload. */
  schema?: S;
  /**
   * Business logic. May return:
   * - flat success fields (`{ quote }` → `{ ok: true, quote }`)
   * - `void` → `{ ok: true }`
   * - a full `ActionResult` (already `{ ok: … }`)
   */
  handler: (input: InferSchema<S>) => Promise<HandlerReturn<T>>;
  /** Override default Persian messages. */
  messages?: ActionMessages;
  /** Include Zod `fieldErrors` on validation failure (default false). */
  includeFieldErrors?: boolean;
};

function isActionResult(
  value: unknown,
): value is ActionResult<Record<string, unknown>> {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean"
  );
}

function resolveAuthMessage(
  err: unknown,
  messages: Required<ActionMessages>,
): string | null {
  if (isUnauthorizedError(err)) return messages.unauthorized;
  if (isForbiddenError(err)) return messages.forbidden;
  return null;
}

/**
 * Generic Server Action wrapper: Zod validation → handler → typed `{ ok }` result.
 *
 * - Catches `ActionError` and auth guard failures as `{ ok: false, error }`.
 * - Rethrows Next.js `redirect` / `notFound` (via `unstable_rethrow`).
 * - Safe to import from ecommerce / saas / portfolio modules.
 *
 * @example
 * ```ts
 * export const quoteCheckoutAction = createAction({
 *   schema: checkoutQuoteSchema,
 *   messages: { validation: "اطلاعات سبد خرید نامعتبر است" },
 *   handler: async (input) => {
 *     const session = await requireAuth();
 *     const quote = await quoteCheckoutCart(session.user.id, input);
 *     return { quote };
 *   },
 * });
 * ```
 */
export function createAction<
  S extends z.ZodType | undefined = undefined,
  T extends Record<string, unknown> = Record<string, never>,
>(
  options: CreateActionOptions<S, T>,
): (input?: unknown) => Promise<ActionResult<T>> {
  const messages: Required<ActionMessages> = {
    ...DEFAULT_ACTION_MESSAGES,
    ...options.messages,
  };

  return async (input?: unknown): Promise<ActionResult<T>> => {
    try {
      let parsed: InferSchema<S>;

      if (options.schema) {
        const result = options.schema.safeParse(input);
        if (!result.success) {
          return actionFail(
            messages.validation,
            options.includeFieldErrors
              ? zodFieldErrors(result.error)
              : undefined,
          );
        }
        parsed = result.data as InferSchema<S>;
      } else {
        parsed = undefined as InferSchema<S>;
      }

      const raw = await options.handler(parsed);

      if (raw === undefined || raw === null) {
        return actionOk() as ActionResult<T>;
      }
      if (isActionResult(raw)) {
        return raw as ActionResult<T>;
      }
      return actionOk(raw as T);
    } catch (err) {
      unstable_rethrow(err);

      if (err instanceof ActionError) {
        return actionFail(err.message);
      }

      const authMessage = resolveAuthMessage(err, messages);
      if (authMessage) {
        return actionFail(authMessage);
      }

      console.error("[createAction]", err);
      return actionFail(messages.unexpected);
    }
  };
}
