/**
 * ArgoCore API route primitives — JSON helpers + Zod/auth wrapper
 * for App Router handlers under `src/app/api/*`.
 *
 * Domain modules implement business logic; routes stay thin:
 * `export const POST = createApiHandler({ … })`.
 *
 * @example
 * ```ts
 * import { createApiHandler, apiError, ApiError } from "@core/api";
 * ```
 */

export {
  createApiHandler,
  type ApiHandlerContext,
  type CreateApiHandlerOptions,
} from "./create-handler";

export { ApiError, isForbiddenError, isUnauthorizedError } from "./errors";

export { apiError, apiOk } from "./response";

export {
  DEFAULT_API_MESSAGES,
  type ApiErrorBody,
  type ApiHandlerMessages,
  type ApiOkBody,
  type ApiStatus,
} from "./types";
