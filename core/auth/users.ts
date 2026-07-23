import type { UserRole } from "@prisma/client";

import { db } from "@core/database";

import { looksLikePhone, normalizeIranMobile } from "./phone";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword };

export async function findUserByPhoneOrEmail(identifier: string) {
  const trimmed = identifier.trim();

  if (looksLikePhone(trimmed)) {
    const phone = normalizeIranMobile(trimmed);
    if (!phone) return null;
    return db.user.findUnique({ where: { phone } });
  }

  return db.user.findFirst({
    where: { email: trimmed.toLowerCase() },
  });
}

export async function findUserByPhone(phone: string) {
  const normalized = normalizeIranMobile(phone) ?? phone.trim();
  return db.user.findUnique({ where: { phone: normalized } });
}

export async function createUser(input: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role?: UserRole;
}) {
  const phone = normalizeIranMobile(input.phone);
  if (!phone) throw new Error("Invalid phone");

  return db.user.create({
    data: {
      name: input.name.trim(),
      phone,
      email: input.email?.trim().toLowerCase() || null,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? "CUSTOMER",
    },
  });
}

export async function markPhoneVerified(userId: string) {
  return db.user.updateMany({
    where: { id: userId, phoneVerifiedAt: null },
    data: { phoneVerifiedAt: new Date() },
  });
}

export async function updatePasswordHash(userId: string, password: string) {
  return db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
    select: { id: true },
  });
}

export async function getUserPasswordHash(userId: string) {
  return db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });
}
