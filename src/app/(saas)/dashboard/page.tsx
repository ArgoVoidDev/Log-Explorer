import { redirect } from "next/navigation";

import {
  DashboardOverviewContent,
  getCustomerProfile,
  getDashboardOverview,
  requireCustomerDashboard,
} from "@modules/saas";

export default async function DashboardPage() {
  const session = await requireCustomerDashboard();
  const [profile, overview] = await Promise.all([
    getCustomerProfile(session.user.id),
    getDashboardOverview(session.user.id),
  ]);

  if (!profile) redirect("/login");

  return (
    <DashboardOverviewContent profile={profile} overview={overview} />
  );
}
