import { NextResponse } from "next/server";

import { authorizeCronRequest } from "@core/lib/cron-auth";
import { expireAbandonedPendingOrders } from "@modules/ecommerce";

export async function GET(request: Request) {
  const denied = authorizeCronRequest(request);
  if (denied) return denied;

  const expired = await expireAbandonedPendingOrders();
  return NextResponse.json({ ok: true, expired });
}
