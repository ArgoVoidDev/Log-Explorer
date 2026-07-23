import type { Metadata } from "next";

import { BillingPageContent, getBillingSummary } from "@modules/saas";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const billing = await getBillingSummary("guest");

  return <BillingPageContent billing={billing} />;
}
