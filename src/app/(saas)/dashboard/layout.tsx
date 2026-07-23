import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  DashboardShell,
  getCustomerProfile,
  requireCustomerDashboard,
  saasConfig,
} from "@modules/saas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: `%s · ${saasConfig.name}`,
  },
  description: saasConfig.tagline,
};

export default async function SaasDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireCustomerDashboard();
  const profile = await getCustomerProfile(session.user.id);

  if (!profile) redirect("/login");

  return (
    <DashboardShell userName={profile.name}>{children}</DashboardShell>
  );
}
