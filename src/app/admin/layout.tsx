import type { Metadata } from "next";

import {
  AdminShell,
  ensureModulesLoaded,
  getRegisteredAdminNav,
} from "@core/admin";
import {
  canAccessSection,
  getSessionPermissions,
  requirePageAccess,
} from "@core/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin",
  },
  description: "Staff administration panel",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureModulesLoaded();
  const session = await requirePageAccess();
  const permissions = await getSessionPermissions(session.user.role);

  const navItems = getRegisteredAdminNav().filter((item) =>
    canAccessSection(session.user.role, item.section, "read", permissions),
  );

  return (
    <AdminShell
      userName={session.user.name ?? session.user.phone ?? "Staff"}
      navItems={navItems}
    >
      {children}
    </AdminShell>
  );
}
