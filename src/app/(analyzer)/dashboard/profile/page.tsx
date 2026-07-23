import type { Metadata } from "next";

import { ProfilePageContent, guestCustomerProfile } from "@modules/saas";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return <ProfilePageContent profile={guestCustomerProfile} />;
}
