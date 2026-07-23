import { createHash } from "crypto";

import { db } from "@core/database";

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

function hashKeyPart(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

/** Stable bucket key; hashes sensitive parts (phone / identifier). */
export function rateLimitKey(scope: string, subject: string): string {
  return `${scope}:${hashKeyPart(subject.toLowerCase().trim())}`;
}

function retryAfterSeconds(until: Date, now = new Date()): number {
  return Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 1000));
}

/** Returns lockout without incrementing. */
export async function getRateLimitBlock(key: string): Promise<RateLimitResult> {
  const row = await db.rateLimitBucket.findUnique({ where: { key } });
  const now = new Date();
  if (row?.lockedUntil && row.lockedUntil > now) {
    return {
      ok: false,
      retryAfterSeconds: retryAfterSeconds(row.lockedUntil, now),
    };
  }
  return { ok: true };
}

/**
 * Fixed-window counter. When limit is exceeded, sets lockedUntil
 * (lockMs if provided, otherwise remainder of the window).
 */
export async function consumeRateLimit(
  key: string,
  options: { limit: number; windowMs: number; lockMs?: number },
): Promise<RateLimitResult> {
  const now = new Date();

  return db.$transaction(async (tx) => {
    const existing = await tx.rateLimitBucket.findUnique({ where: { key } });

    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return {
        ok: false as const,
        retryAfterSeconds: retryAfterSeconds(existing.lockedUntil, now),
      };
    }

    const windowExpired =
      !existing ||
      now.getTime() - existing.windowStart.getTime() >= options.windowMs;

    if (windowExpired) {
      await tx.rateLimitBucket.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          windowStart: now,
          lockedUntil: null,
        },
        update: {
          count: 1,
          windowStart: now,
          lockedUntil: null,
        },
      });
      return { ok: true as const };
    }

    if (existing.count >= options.limit) {
      const lockedUntil = new Date(
        options.lockMs
          ? now.getTime() + options.lockMs
          : existing.windowStart.getTime() + options.windowMs,
      );
      await tx.rateLimitBucket.update({
        where: { key },
        data: { lockedUntil },
      });
      return {
        ok: false as const,
        retryAfterSeconds: retryAfterSeconds(lockedUntil, now),
      };
    }

    const updated = await tx.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    if (updated.count > options.limit) {
      const lockedUntil = new Date(
        options.lockMs
          ? now.getTime() + options.lockMs
          : existing.windowStart.getTime() + options.windowMs,
      );
      await tx.rateLimitBucket.update({
        where: { key },
        data: { lockedUntil },
      });
      return {
        ok: false as const,
        retryAfterSeconds: retryAfterSeconds(lockedUntil, now),
      };
    }

    return { ok: true as const };
  });
}

export async function recordRateLimitFailure(
  key: string,
  options: { limit: number; windowMs: number; lockMs: number },
): Promise<RateLimitResult> {
  return consumeRateLimit(key, options);
}

export async function resetRateLimit(key: string): Promise<void> {
  await db.rateLimitBucket.deleteMany({ where: { key } });
}

/** Deletes expired rate-limit lockout rows in batches. */
export async function cleanExpiredRateLimitBuckets(): Promise<number> {
  let totalDeleted = 0;

  while (true) {
    const deleted = await db.$executeRaw`
      DELETE FROM "RateLimitBucket"
      WHERE id IN (
        SELECT id FROM "RateLimitBucket"
        WHERE "lockedUntil" < NOW()
        LIMIT 5000
      )
    `;

    totalDeleted += Number(deleted);
    if (deleted === 0) break;
  }

  return totalDeleted;
}
