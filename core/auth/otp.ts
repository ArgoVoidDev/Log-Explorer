import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

import { db } from "@core/database";

export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function getLatestOtpForPhone(phone: string) {
  return db.loginOtp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveOtpForPhone(phone: string) {
  return db.loginOtp.findFirst({
    where: {
      phone,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Seconds until resend is allowed, or 0 if allowed now. */
export async function getResendCooldownSeconds(phone: string): Promise<number> {
  const latest = await getLatestOtpForPhone(phone);
  if (!latest) return 0;
  const elapsed = Date.now() - latest.createdAt.getTime();
  const remaining = OTP_RESEND_COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export async function createLoginOtp(input: {
  userId: string;
  phone: string;
  code: string;
}) {
  const codeHash = await bcrypt.hash(input.code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  return db.$transaction(async (tx) => {
    await tx.loginOtp.updateMany({
      where: { phone: input.phone, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    return tx.loginOtp.create({
      data: {
        userId: input.userId,
        phone: input.phone,
        codeHash,
        expiresAt,
      },
    });
  });
}

export async function incrementOtpAttempts(otpId: string) {
  return db.loginOtp.update({
    where: { id: otpId },
    data: { attempts: { increment: 1 } },
  });
}

export async function consumeOtp(otpId: string) {
  return db.loginOtp.update({
    where: { id: otpId },
    data: { consumedAt: new Date() },
  });
}

export async function verifyOtpCode(codeHash: string, code: string) {
  return bcrypt.compare(code, codeHash);
}
