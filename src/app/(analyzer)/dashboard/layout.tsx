import type { Metadata } from "next";

import {
  DashboardShell,
  guestCustomerProfile,
  saasConfig,
} from "@modules/saas";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: `%s · ${saasConfig.name}`,
  },
  description: saasConfig.tagline,
};

export default function SaasDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardShell userName={guestCustomerProfile.name}>
      {children}
    </DashboardShell>
  );
}
