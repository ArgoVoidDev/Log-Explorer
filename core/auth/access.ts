import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";

import { db } from "@core/database";

import { auth, getSessionPermissions } from "./auth";
import {
  canAccessSection,
  isStaffRole,
  resolveAdminSection,
} from "./rbac";
import { AdminSections, type PermissionMode } from "./types";

export type FreshStaffSession = Session & {
  user: Session["user"] & {
    id: string;
    role: UserRole;
    phone: string;
  };
};

/**
 * Load session and overwrite role/phone from DB so demotions apply immediately.
 */
export async function getFreshSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, phone: true, email: true },
  });

  if (!dbUser) return null;

  return {
    ...session,
    user: {
      ...session.user,
      id: dbUser.id,
      role: dbUser.role,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
    },
  };
}

/** Staff-only session with DB-fresh role; redirects if unauthorized. */
export async function getFreshStaffSession(): Promise<FreshStaffSession> {
  const session = await getFreshSession();
  if (!session?.user?.id) redirect("/dashboard");
  if (!isStaffRole(session.user.role)) redirect("/");
  return session as FreshStaffSession;
}

/**
 * Enforce section RBAC for the current admin URL (server-side).
 * Prefer calling from the admin layout so every nested page is covered.
 */
export async function requirePageAccess(
  pathname?: string,
  mode: PermissionMode = "read",
): Promise<FreshStaffSession> {
  const session = await getFreshStaffSession();

  let path = pathname;
  if (!path) {
    const h = await headers();
    path = h.get("x-pathname") || h.get("x-invoke-path") || "/admin";
  }

  const clean = path.split("?")[0]?.split("#")[0] || "/admin";

  const section = resolveAdminSection(clean);
  if (!section) {
    if (clean.startsWith("/admin")) {
      redirect("/admin");
    }
    return session;
  }

  const permissions = await getSessionPermissions(session.user.role);
  if (!canAccessSection(session.user.role, section, mode, permissions)) {
    if (section === AdminSections.DASHBOARD) redirect("/");
    redirect("/admin");
  }

  return session;
}
