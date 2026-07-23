import type {
  CustomerBillingSummary,
  DashboardOverview,
  Invoice,
  Plan,
  SubscriptionWithPlan,
} from "../types";

/**
 * Billing data access — typed stubs until SaaS Prisma models ship.
 * Isolated from ecommerce Payment / CatalogOrder repositories.
 */

export async function getPlans(): Promise<Plan[]> {
  return [];
}

export async function getSubscriptionForUser(
  _userId: string,
): Promise<SubscriptionWithPlan | null> {
  return null;
}

export async function getInvoicesForUser(
  _userId: string,
): Promise<Invoice[]> {
  return [];
}

export async function getBillingSummary(
  userId: string,
): Promise<CustomerBillingSummary> {
  const [subscription, invoices] = await Promise.all([
    getSubscriptionForUser(userId),
    getInvoicesForUser(userId),
  ]);

  return { subscription, invoices };
}

export async function getDashboardOverview(
  userId: string,
): Promise<DashboardOverview> {
  const { subscription, invoices } = await getBillingSummary(userId);

  return {
    planName: subscription?.plan.name ?? null,
    subscriptionStatus: subscription?.status ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    openInvoiceCount: invoices.filter((invoice) => invoice.status === "open")
      .length,
  };
}
