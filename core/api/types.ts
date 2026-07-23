/**
 * Shared HTTP JSON shapes for App Router route handlers.
 * Matches conventions in `doc/API_REFERENCE.md`.
 */

export type ApiErrorBody = {
  error: string;
};

export type ApiOkBody = {
  ok: true;
};

/** Status codes used by platform route handlers. */
export type ApiStatus =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 429
  | 500
  | 503;

export type ApiHandlerMessages = {
  invalidBody?: string;
  validation?: string;
  unauthorized?: string;
  forbidden?: string;
  unexpected?: string;
};

export const DEFAULT_API_MESSAGES = {
  invalidBody: "درخواست نامعتبر است",
  validation: "ورودی نامعتبر است",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  unexpected: "خطای سرور",
} as const satisfies Required<ApiHandlerMessages>;
