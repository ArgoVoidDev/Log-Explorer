import type { UserRole } from "@prisma/client";

import type {
  AdminNavItem,
  AdminSection,
  PermissionMode,
  SectionPermission,
  StaffRole,
} from "./types";
import { AdminSections } from "./types";

export const STAFF_ROLES: StaffRole[] = [
  "ADMIN",
  "MANAGER",
  "EDITOR",
  "SUPPORT",
];

export function isStaffRole(role: UserRole): role is StaffRole {
  return STAFF_ROLES.includes(role as StaffRole);
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "مدیر",
  MANAGER: "مدیر فروش",
  EDITOR: "ویرایشگر",
  SUPPORT: "پشتیبانی",
  CUSTOMER: "مشتری",
};

/**
 * Platform-only nav. Domain sections are appended by modules via
 * `registerAdminNav` / `registerAdminView` (core/admin).
 */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    section: AdminSections.DASHBOARD,
    icon: "LayoutDashboard",
  },
];

const routeSectionMap: Record<string, AdminSection> = {
  "/admin": AdminSections.DASHBOARD,
};

const routePrefixes: Array<{ prefix: string; section: AdminSection }> = [];

/** Modules register extra exact routes (e.g. `/admin/users` → `saas:USERS`). */
export function registerAdminRoutes(
  routes: Record<string, AdminSection>,
): void {
  Object.assign(routeSectionMap, routes);
}

/** Modules register extra prefix → section mappings. */
export function registerAdminRoutePrefixes(
  entries: Array<{ prefix: string; section: AdminSection }>,
): void {
  routePrefixes.push(...entries);
}

/** Modules append nav items for their admin sections. */
export function registerAdminNav(items: AdminNavItem[]): void {
  for (const item of items) {
    if (ADMIN_NAV.some((existing) => existing.href === item.href)) continue;
    ADMIN_NAV.push(item);
  }
}

export function resolveAdminSection(pathname: string): AdminSection | null {
  if (routeSectionMap[pathname]) return routeSectionMap[pathname];
  for (const { prefix, section } of routePrefixes) {
    if (pathname.startsWith(prefix)) return section;
  }
  return null;
}

function rw(section: AdminSection, canWrite = true): SectionPermission {
  return { section, canRead: true, canWrite };
}

export const DEFAULT_PERMISSIONS: Record<StaffRole, SectionPermission[]> = {
  ADMIN: [rw(AdminSections.DASHBOARD)],
  MANAGER: [rw(AdminSections.DASHBOARD)],
  EDITOR: [rw(AdminSections.DASHBOARD, false)],
  SUPPORT: [rw(AdminSections.DASHBOARD, false)],
};

/** Merge or replace default permissions for a staff role (module extension). */
export function registerDefaultPermissions(
  role: StaffRole,
  permissions: SectionPermission[],
  mode: "replace" | "merge" = "merge",
): void {
  if (mode === "replace") {
    DEFAULT_PERMISSIONS[role] = permissions;
    return;
  }
  const existing = new Map(
    DEFAULT_PERMISSIONS[role].map((p) => [p.section, p] as const),
  );
  for (const perm of permissions) {
    existing.set(perm.section, perm);
  }
  DEFAULT_PERMISSIONS[role] = [...existing.values()];
}

export function canAccessSection(
  role: UserRole,
  section: AdminSection,
  mode: PermissionMode,
  permissions: SectionPermission[],
): boolean {
  if (role === "ADMIN") return true;
  if (!isStaffRole(role)) return false;

  const perm = permissions.find((p) => p.section === section);
  if (!perm) {
    const fallback = DEFAULT_PERMISSIONS[role].find(
      (p) => p.section === section,
    );
    if (!fallback) return false;
    return mode === "read" ? fallback.canRead : fallback.canWrite;
  }
  return mode === "read" ? perm.canRead : perm.canWrite;
}

export function getAssignableRoles(callerRole: UserRole): UserRole[] {
  if (callerRole === "ADMIN") {
    return ["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "CUSTOMER"];
  }
  if (callerRole === "MANAGER") {
    return ["EDITOR", "SUPPORT", "CUSTOMER"];
  }
  return [];
}

export function canAssignRole(
  callerRole: UserRole,
  targetRole: UserRole,
): boolean {
  return getAssignableRoles(callerRole).includes(targetRole);
}
