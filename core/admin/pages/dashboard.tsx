import Link from "next/link";

import { buttonVariants, Typography } from "@core/ui";
import { cn } from "@core/lib/utils";

import { getAdminViews } from "../registry";
import { AdminPanelCard, AdminStatCard } from "../shell/admin-primitives";

/** Core dashboard — lists registered module views; no domain imports. */
export function AdminDashboardPage() {
  const views = getAdminViews().filter((v) => v.href !== "/admin");

  return (
    <div className="space-y-6">
      <div>
        <Typography
          variant="h2"
          className="border-0 font-[family-name:var(--font-admin-display)] text-[var(--admin-ink)]"
        >
          Dashboard
        </Typography>
        <Typography variant="muted" className="mt-2 text-[var(--admin-muted)]">
          Overview of active admin modules. Views appear here when modules
          register.
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStatCard label="Registered views" value={views.length} />
        <AdminStatCard
          label="Modules"
          value={new Set(views.map((v) => v.moduleId)).size}
        />
      </div>

      <AdminPanelCard
        title="Module views"
        description="Plug-and-play sections injected by active modules."
      >
        {views.length === 0 ? (
          <p className="text-sm text-[var(--admin-muted)]">
            No module views registered. Set{" "}
            <code className="rounded bg-[var(--admin-surface)] px-1.5 py-0.5 text-xs">
              ACTIVE_MODULES
            </code>{" "}
            and ensure modules call{" "}
            <code className="rounded bg-[var(--admin-surface)] px-1.5 py-0.5 text-xs">
              registerAdminView
            </code>
            .
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {views.map((view) => (
              <li key={view.id}>
                <Link
                  href={view.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-auto w-full flex-col items-start gap-1 border-[var(--admin-line)] px-4 py-3 text-start text-[var(--admin-ink)]",
                  )}
                >
                  <span className="font-medium">{view.label}</span>
                  <span className="text-xs font-normal text-[var(--admin-muted)]">
                    {view.moduleId} · {view.href}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminPanelCard>
    </div>
  );
}
