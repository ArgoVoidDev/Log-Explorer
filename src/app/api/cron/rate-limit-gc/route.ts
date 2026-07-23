import { NextResponse } from "next/server";

import { cleanExpiredRateLimitBuckets } from "@core/auth";
import { authorizeCronRequest } from "@core/lib/cron-auth";

export async function GET(request: Request) {
  const denied = authorizeCronRequest(request);
  if (denied) return denied;

  const deleted = await cleanExpiredRateLimitBuckets();
  return NextResponse.json({ ok: true, deleted });
}
