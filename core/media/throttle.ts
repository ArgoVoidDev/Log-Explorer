import {
  consumeRateLimit,
  getClientIp,
  rateLimitKey,
  type RateLimitResult,
} from "@core/auth";

import { UPLOAD_RETRY_MESSAGE } from "./constants";
import type { UploadQuotaKind } from "./types";

const HOUR = 60 * 60 * 1000;

const QUOTA: Record<
  UploadQuotaKind,
  { limit: number; windowMs: number; lockMs: number; scope: string }
> = {
  avatar: {
    limit: 10,
    windowMs: HOUR,
    lockMs: HOUR,
    scope: "upload:avatar",
  },
  "custom-order": {
    limit: 20,
    windowMs: HOUR,
    lockMs: HOUR,
    scope: "upload:custom-order",
  },
  staff: {
    limit: 60,
    windowMs: HOUR,
    lockMs: 30 * 60 * 1000,
    scope: "upload:staff",
  },
};

const IP_QUOTA = {
  limit: 40,
  windowMs: HOUR,
  lockMs: HOUR,
  scope: "upload:ip",
};

export type UploadQuotaDenied = {
  ok: false;
  status: 429;
  error: string;
};

/**
 * Consume per-IP + per-user upload quotas. Returns denied result on 429.
 */
export async function consumeUploadQuota(
  userId: string,
  kind: UploadQuotaKind,
): Promise<{ ok: true } | UploadQuotaDenied> {
  const ip = await getClientIp();

  const ipResult = await consumeRateLimit(
    rateLimitKey(IP_QUOTA.scope, ip),
    IP_QUOTA,
  );
  if (!ipResult.ok) return denied(ipResult);

  const userCfg = QUOTA[kind];
  const userResult = await consumeRateLimit(
    rateLimitKey(userCfg.scope, userId),
    userCfg,
  );
  if (!userResult.ok) return denied(userResult);

  return { ok: true };
}

function denied(_result: Extract<RateLimitResult, { ok: false }>): UploadQuotaDenied {
  return {
    ok: false,
    status: 429,
    error: UPLOAD_RETRY_MESSAGE,
  };
}
