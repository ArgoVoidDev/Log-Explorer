/**
 * ArgoCore admin — shell, view registry, active-module bootstrap.
 * Domain modules inject views via `registerAdminView` (see bootstrap).
 */

export type {
  AdminModuleId,
  AdminShellNavItem,
  AdminShellProps,
  AdminViewDefinition,
} from "./types";

export {
  registerAdminView,
  getAdminViews,
  getAdminViewByPath,
  getRegisteredAdminNav,
} from "./registry";

export { getActiveModules, isModuleActive } from "./active-modules";
export { ensureModulesLoaded } from "./bootstrap";
export { registerCoreAdminViews } from "./register-core";

export { AdminShell } from "./shell/admin-shell";
export { AdminSidebar, AdminMobileNav } from "./shell/admin-sidebar";
export { AdminTopbar } from "./shell/admin-topbar";
export {
  AdminStatCard,
  AdminPanelCard,
  AdminDataTable,
} from "./shell/admin-primitives";

export { AdminDashboardPage } from "./pages/dashboard";
export {
  AdminSettingsPage,
  AdminAccessPage,
  AdminAuditLogsPage,
} from "./pages/platform-stubs";

export { signOutAction } from "./actions/auth.actions";
