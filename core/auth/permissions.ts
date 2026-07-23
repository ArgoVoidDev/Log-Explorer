import type { UserRole } from "@prisma/client";

import { db } from "@core/database";

import { DEFAULT_PERMISSIONS, isStaffRole } from "./rbac";
import type { AdminSection, SectionPermission } from "./types";

export async function getPermissionsForRole(
  role: UserRole,
): Promise<SectionPermission[]> {
  const rows = await db.rolePermission.findMany({ where: { role } });
  if (rows.length === 0 && isStaffRole(role)) {
    return DEFAULT_PERMISSIONS[role];
  }
  return rows.map((row) => ({
    section: row.section,
    canRead: row.canRead,
    canWrite: row.canWrite,
  }));
}

export async function getAllRolePermissions() {
  return db.rolePermission.findMany({
    orderBy: [{ role: "asc" }, { section: "asc" }],
  });
}

export async function upsertRolePermission(input: {
  role: UserRole;
  section: AdminSection;
  canRead: boolean;
  canWrite: boolean;
}) {
  return db.rolePermission.upsert({
    where: {
      role_section: { role: input.role, section: input.section },
    },
    update: {
      canRead: input.canRead,
      canWrite: input.canWrite,
    },
    create: input,
  });
}
