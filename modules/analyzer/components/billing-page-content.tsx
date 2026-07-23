import { Typography } from "@core/ui";

import { SUBSCRIPTION_STATUS_LABELS } from "../lib/subscription-status";
import type { CustomerBillingSummary } from "../types";

type BillingPageContentProps = {
  billing: CustomerBillingSummary;
};

export function BillingPageContent({ billing }: BillingPageContentProps) {
  const { subscription, invoices } = billing;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <Typography
          variant="h2"
          className="border-0 pb-0 font-[family-name:var(--font-saas-display)] text-[var(--saas-ink)]"
        >
          Billing
        </Typography>
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          Subscription and invoice history.
        </Typography>
      </header>

      <section className="space-y-3 border border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-5">
        <Typography variant="large" className="text-[var(--saas-ink)]">
          Current plan
        </Typography>
        {subscription ? (
          <dl className="grid gap-2 text-sm text-[var(--saas-muted)]">
            <div className="flex justify-between gap-4">
              <dt>Plan</dt>
              <dd className="text-[var(--saas-ink)]">{subscription.plan.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Status</dt>
              <dd className="text-[var(--saas-ink)]">
                {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Renews</dt>
              <dd className="text-[var(--saas-ink)]">
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </dd>
            </div>
          </dl>
        ) : (
          <Typography variant="muted" className="text-[var(--saas-muted)]">
            No active subscription.
          </Typography>
        )}
      </section>

      <section className="space-y-3">
        <Typography variant="large" className="text-[var(--saas-ink)]">
          Invoices
        </Typography>
        {invoices.length === 0 ? (
          <Typography variant="muted" className="text-[var(--saas-muted)]">
            No invoices yet.
          </Typography>
        ) : (
          <ul className="divide-y divide-[var(--saas-line)] border border-[var(--saas-line)] bg-[var(--saas-panel)]">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <span className="text-[var(--saas-ink)]">
                  {invoice.createdAt.toLocaleDateString()}
                </span>
                <span className="text-[var(--saas-muted)]">{invoice.status}</span>
                <span className="tabular-nums text-[var(--saas-ink)]">
                  {(invoice.amountDue / 100).toFixed(2)}{" "}
                  {invoice.currency.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
