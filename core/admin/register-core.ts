import {
  AdminSections,
  registerDefaultPermissions,
} from "@core/auth";

import { registerAdminView } from "./registry";
import { AdminDashboardPage } from "./pages/dashboard";
import {
  AdminAccessPage,
  AdminAuditLogsPage,
  AdminSettingsPage,
} from "./pages/platform-stubs";

let registered = false;

function rw(section: string, canWrite = true) {
  return { section, canRead: true, canWrite };
}

/** Core platform admin views (dashboard + stubs). Idempotent. */
export function registerCoreAdminViews(): void {
  if (registered) return;
  registered = true;

  registerAdminView({
    id: "core:dashboard",
    href: "/admin",
    label: "Dashboard",
    section: AdminSections.DASHBOARD,
    icon: "LayoutDashboard",
    order: 0,
    moduleId: "core",
    View: AdminDashboardPage,
  });

  registerAdminView({
    id: "core:settings",
    href: "/admin/settings",
    label: "Settings",
    section: AdminSections.SETTINGS,
    icon: "Settings",
    order: 900,
    moduleId: "core",
    View: AdminSettingsPage,
  });

  registerAdminView({
    id: "core:access",
    href: "/admin/access",
    label: "Access",
    section: AdminSections.ACCESS_CONTROL,
    icon: "Shield",
    order: 910,
    moduleId: "core",
    View: AdminAccessPage,
  });

  registerAdminView({
    id: "core:audit-logs",
    href: "/admin/audit-logs",
    label: "Audit logs",
    section: AdminSections.AUDIT_LOGS,
    icon: "ScrollText",
    order: 920,
    moduleId: "core",
    View: AdminAuditLogsPage,
  });

  registerDefaultPermissions("ADMIN", [
    rw(AdminSections.SETTINGS),
    rw(AdminSections.ACCESS_CONTROL),
    rw(AdminSections.AUDIT_LOGS),
  ]);
  registerDefaultPermissions("MANAGER", [
    rw(AdminSections.ACCESS_CONTROL),
  ]);
}
