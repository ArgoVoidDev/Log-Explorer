import { AdminPanelCard } from "@core/admin/shell/admin-primitives";
import { Typography } from "@core/ui";

/** SaaS Users admin view — stub ready for staff/customer user management. */
export function UsersAdminView() {
  return (
    <div className="space-y-6">
      <div>
        <Typography
          variant="h2"
          className="border-0 font-[family-name:var(--font-admin-display)] text-[var(--admin-ink)]"
        >
          Users
        </Typography>
        <Typography variant="muted" className="mt-2 text-[var(--admin-muted)]">
          Account and membership management from the saas module.
        </Typography>
      </div>

      <AdminPanelCard
        title="Users Admin View"
        description="Injected by @modules/saas — replace this stub with user list and role tools."
      >
        <p className="text-sm text-[var(--admin-muted)]">
          No domain logic lives in the core admin layout. This view is registered
          via <code className="rounded bg-[var(--admin-surface)] px-1.5 py-0.5 text-xs">registerAdminView</code> when the saas module is active.
        </p>
      </AdminPanelCard>
    </div>
  );
}
