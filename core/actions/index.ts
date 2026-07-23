/**
 * ArgoCore Server Action primitives — Zod validation, error mapping,
 * typed `{ ok: true | false }` results for all domain modules.
 *
 * @example
 * ```ts
 * import { createAction, actionOk, ActionError } from "@core/actions";
 * ```
 */

export {
  createAction,
  type CreateActionOptions,
} from "./create-action";

export {
  ActionError,
  isForbiddenError,
  isUnauthorizedError,
} from "./errors";

export {
  actionFail,
  actionOk,
  isActionOk,
  zodFieldErrors,
} from "./result";

export {
  DEFAULT_ACTION_MESSAGES,
  type ActionFailure,
  type ActionMessages,
  type ActionResult,
  type ActionSuccess,
} from "./types";
