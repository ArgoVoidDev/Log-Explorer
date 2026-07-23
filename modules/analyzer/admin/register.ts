import { registerDefaultPermissions } from "@core/auth";
import { registerAdminView } from "@core/admin/registry";

import { UsersAdminView } from "./users-admin-view";

export const SaasAdminSections = {
  USERS: "saas:USERS",
} as const;

let registered = false;

function rw(section: string, canWrite = true) {
  return { section, canRead: true, canWrite };
}

/** Register saas admin views (side-effect safe / idempotent). */
export function registerSaasAdmin(): void {
  if (registered) return;
  registered = true;

  registerAdminView({
    id: "saas:users",
    href: "/admin/users",
    label: "Users",
    section: SaasAdminSections.USERS,
    icon: "Users",
    order: 30,
    moduleId: "saas",
    View: UsersAdminView,
  });

  registerDefaultPermissions("ADMIN", [rw(SaasAdminSections.USERS)]);
  registerDefaultPermissions("MANAGER", [rw(SaasAdminSections.USERS)]);
  registerDefaultPermissions("SUPPORT", [rw(SaasAdminSections.USERS, false)]);
}
