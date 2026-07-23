import { NextResponse } from "next/server";

import { env } from "@core/env";

/**
 * Authorize `/api/cron/*` with Bearer or `x-cron-secret`.
 * Missing CRON_SECRET → 503; bad/missing token → 401.
 */
export function authorizeCronRequest(
  request: Request,
): NextResponse | null {
  const secret = env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  const querySecret = new URL(request.url).searchParams.get("secret")?.trim();
  const token = bearer || headerSecret || querySecret;

  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
