import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";

import { auth } from "@core/auth";

import {
  ApiError,
  isForbiddenError,
  isUnauthorizedError,
} from "./errors";
import { apiError, apiOk } from "./response";
import {
  DEFAULT_API_MESSAGES,
  type ApiHandlerMessages,
  type ApiStatus,
} from "./types";

type InferSchema<S extends z.ZodType | undefined> = S extends z.ZodType
  ? z.infer<S>
  : undefined;

type InputSource = "json" | "query" | "none";

export type ApiHandlerContext<S extends z.ZodType | undefined> = {
  request: NextRequest | Request;
  input: InferSchema<S>;
  session: Session | null;
};

export type CreateApiHandlerOptions<S extends z.ZodType | undefined> = {
  /** Zod schema for JSON body or query params. */
  schema?: S;
  /** Where to read + validate input (default `json`). */
  input?: InputSource;
  /**
   * `true` → require session (401 if missing).
   * `false` / omit → public; session still loaded when available.
   */
  auth?: boolean;
  messages?: ApiHandlerMessages;
  /**
   * Return a plain object (wrapped with `apiOk`) or a `NextResponse`
   * (redirects, custom headers, etc.).
   */
  handler: (
    ctx: ApiHandlerContext<S>,
  ) => Promise<unknown | NextResponse>;
};

async function readJsonBody(request: Request): Promise<
  { ok: true; body: unknown } | { ok: false }
> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

function queryObject(request: Request): Record<string, string> {
  const url = new URL(request.url);
  const out: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/**
 * Generic App Router handler: optional auth → Zod input → typed JSON/`NextResponse`.
 *
 * Status mapping (see `doc/API_REFERENCE.md`):
 * - `ApiError` → its status + `{ error }`
 * - `Unauthorized` / missing session when `auth: true` → 401
 * - `Forbidden` → 403
 * - other errors → 500
 *
 * @example
 * ```ts
 * // app/api/products/catalog/route.ts
 * export const GET = createApiHandler({
 *   input: "query",
 *   schema: catalogQuerySchema,
 *   handler: async ({ input }) => listCatalogProducts(input),
 * });
 * ```
 */
export function createApiHandler<S extends z.ZodType | undefined = undefined>(
  options: CreateApiHandlerOptions<S>,
): (request: NextRequest | Request) => Promise<NextResponse> {
  const messages: Required<ApiHandlerMessages> = {
    ...DEFAULT_API_MESSAGES,
    ...options.messages,
  };
  const source: InputSource = options.input ?? (options.schema ? "json" : "none");

  return async (request: NextRequest | Request): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (options.auth && !session?.user?.id) {
        return apiError(messages.unauthorized, 401);
      }

      let input: InferSchema<S>;

      if (source === "none" || !options.schema) {
        input = undefined as InferSchema<S>;
      } else {
        let raw: unknown;
        if (source === "json") {
          const parsed = await readJsonBody(request);
          if (!parsed.ok) {
            return apiError(messages.invalidBody, 400);
          }
          raw = parsed.body;
        } else {
          raw = queryObject(request);
        }

        const validated = options.schema.safeParse(raw);
        if (!validated.success) {
          return apiError(messages.validation, 400);
        }
        input = validated.data as InferSchema<S>;
      }

      const result = await options.handler({ request, input, session });

      if (result instanceof NextResponse) {
        return result;
      }
      return apiOk(result);
    } catch (err) {
      if (err instanceof ApiError) {
        return apiError(err.message, err.status);
      }
      if (isUnauthorizedError(err)) {
        return apiError(messages.unauthorized, 401);
      }
      if (isForbiddenError(err)) {
        return apiError(messages.forbidden, 403);
      }

      console.error("[createApiHandler]", err);
      return apiError(
        err instanceof Error ? err.message : messages.unexpected,
        500 as ApiStatus,
      );
    }
  };
}
