/** Billing / subscription domain types — no ecommerce order concepts. */

export type BillingInterval = "month" | "year";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "paused";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

export type Plan = {
  id: string;
  name: string;
  description: string;
  /** Amount in the smallest currency unit (e.g. cents). */
  amount: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: Date | null;
  createdAt: Date;
};

export type SubscriptionWithPlan = Subscription & {
  plan: Plan;
};

export type Invoice = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  hostedInvoiceUrl: string | null;
  periodStart: Date;
  periodEnd: Date;
  paidAt: Date | null;
  createdAt: Date;
};

export type CustomerBillingSummary = {
  subscription: SubscriptionWithPlan | null;
  invoices: Invoice[];
};

export type DashboardOverview = {
  planName: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  openInvoiceCount: number;
};
