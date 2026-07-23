import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";

import { getFreshSession, isStaffRole } from "@core/auth";

export type CustomerDashboardSession = Session & {
  user: Session["user"] & {
    id: string;
    role: UserRole;
    phone: string;
  };
};

/**
 * Gate the SaaS customer dashboard (CUSTOMER_PANEL access model).
 * - no session → /dashboard (public BYOK MVP)
 * - staff → /admin
 * - role ≠ CUSTOMER → /
 */
export async function requireCustomerDashboard(): Promise<CustomerDashboardSession> {
  const session = await getFreshSession();

  if (!session?.user?.id) redirect("/dashboard");
  if (isStaffRole(session.user.role)) redirect("/admin");
  if (session.user.role !== "CUSTOMER") redirect("/");

  return session as CustomerDashboardSession;
}
