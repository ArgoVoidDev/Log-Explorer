import {
  DashboardOverviewContent,
  getDashboardOverview,
  guestCustomerProfile,
} from "@modules/saas";

export default async function DashboardPage() {
  const overview = await getDashboardOverview(guestCustomerProfile.id);

  return (
    <DashboardOverviewContent
      profile={guestCustomerProfile}
      overview={overview}
    />
  );
}
