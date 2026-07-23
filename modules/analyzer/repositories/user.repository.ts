import { db } from "@core/database";

import type { SaasCustomerProfile } from "../types";

/** Read core User fields for the SaaS customer dashboard. */
export async function getCustomerProfile(
  userId: string,
): Promise<SaasCustomerProfile | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    memberSince: user.createdAt,
  };
}
