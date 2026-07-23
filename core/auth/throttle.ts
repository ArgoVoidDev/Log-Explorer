import { normalizeIranMobile } from "./phone";
import {
  getRateLimitBlock,
  rateLimitKey,
  recordRateLimitFailure,
  resetRateLimit,
  type RateLimitResult,
} from "./rate-limit";
import { getClientIp } from "./request-ip";

const LOGIN_ID = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
  lockMs: 15 * 60 * 1000,
} as const;

const LOGIN_IP = {
  limit: 25,
  windowMs: 15 * 60 * 1000,
  lockMs: 30 * 60 * 1000,
} as const;

export function normalizeAuthIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  const phone = normalizeIranMobile(trimmed);
  if (phone) return phone;
  return trimmed.toLowerCase();
}

function firstBlock(results: RateLimitResult[]): RateLimitResult {
  for (const r of results) {
    if (!r.ok) return r;
  }
  return { ok: true };
}

export async function assertLoginAllowed(
  identifier: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const id = normalizeAuthIdentifier(identifier);
  return firstBlock([
    await getRateLimitBlock(rateLimitKey("login:id", id)),
    await getRateLimitBlock(rateLimitKey("login:ip", ip)),
  ]);
}

export async function recordLoginIpFailure(): Promise<void> {
  const ip = await getClientIp();
  await recordRateLimitFailure(rateLimitKey("login:ip", ip), LOGIN_IP);
}

export async function recordLoginIdentifierFailure(
  identifier: string,
): Promise<void> {
  const id = normalizeAuthIdentifier(identifier);
  await recordRateLimitFailure(rateLimitKey("login:id", id), LOGIN_ID);
}

export async function clearLoginSuccess(identifier: string): Promise<void> {
  const id = normalizeAuthIdentifier(identifier);
  await resetRateLimit(rateLimitKey("login:id", id));
}
