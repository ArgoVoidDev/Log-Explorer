import type { Metadata } from "next";

import {
  BillingPageContent,
  getBillingSummary,
  requireCustomerDashboard,
} from "@modules/saas";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const session = await requireCustomerDashboard();
  const billing = await getBillingSummary(session.user.id);

  return <BillingPageContent billing={billing} />;
}
