import { NextResponse } from "next/server";

import type { ApiErrorBody, ApiStatus } from "./types";

/** JSON success response (data returned as-is, per existing route handlers). */
export function apiOk<T>(data: T, status: ApiStatus = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** JSON error response: `{ error }` + status. */
export function apiError(
  error: string,
  status: ApiStatus = 400,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error }, { status });
}
