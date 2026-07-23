import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  ProfilePageContent,
  getCustomerProfile,
  requireCustomerDashboard,
} from "@modules/saas";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await requireCustomerDashboard();
  const profile = await getCustomerProfile(session.user.id);

  if (!profile) redirect("/login");

  return <ProfilePageContent profile={profile} />;
}
