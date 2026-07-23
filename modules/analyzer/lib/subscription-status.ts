import type { SubscriptionStatus } from "../types";

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
  paused: "Paused",
};

export function isSubscriptionUsable(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}
