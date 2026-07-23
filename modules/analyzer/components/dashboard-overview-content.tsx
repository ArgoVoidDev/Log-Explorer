import Link from "next/link";

import { buttonVariants, Typography } from "@core/ui";
import { cn } from "@core/lib/utils";

import { SUBSCRIPTION_STATUS_LABELS } from "../lib/subscription-status";
import type { DashboardOverview, SaasCustomerProfile } from "../types";

type DashboardOverviewContentProps = {
  profile: SaasCustomerProfile;
  overview: DashboardOverview;
};

export function DashboardOverviewContent({
  profile,
  overview,
}: DashboardOverviewContentProps) {
  const statusLabel = overview.subscriptionStatus
    ? SUBSCRIPTION_STATUS_LABELS[overview.subscriptionStatus]
    : "No plan";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <Typography
          variant="h2"
          className="border-0 pb-0 font-[family-name:var(--font-saas-display)] text-[var(--saas-ink)]"
        >
          Welcome, {profile.name}
        </Typography>
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          Track your plan and billing from one place.
        </Typography>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatBlock label="Plan" value={overview.planName ?? "None"} />
        <StatBlock label="Status" value={statusLabel} />
        <StatBlock
          label="Open invoices"
          value={String(overview.openInvoiceCount)}
        />
      </section>

      {!overview.planName ? (
        <Typography variant="muted" className="text-[var(--saas-muted)]">
          No subscription yet.{" "}
          <Link
            href="/dashboard/billing"
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "h-auto px-0 text-[var(--saas-accent)]",
            )}
          >
            View billing
          </Link>
        </Typography>
      ) : null}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-4">
      <Typography variant="muted" className="text-[var(--saas-muted)]">
        {label}
      </Typography>
      <Typography
        variant="large"
        className="mt-2 text-[var(--saas-ink)]"
      >
        {value}
      </Typography>
    </div>
  );
}
