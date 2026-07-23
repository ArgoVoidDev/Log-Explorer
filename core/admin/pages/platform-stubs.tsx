import { Typography } from "@core/ui";

import { AdminPanelCard } from "../shell/admin-primitives";

type PlatformStubProps = {
  title: string;
  description: string;
};

function PlatformStub({ title, description }: PlatformStubProps) {
  return (
    <div className="space-y-6">
      <div>
        <Typography
          variant="h2"
          className="border-0 font-[family-name:var(--font-admin-display)] text-[var(--admin-ink)]"
        >
          {title}
        </Typography>
        <Typography variant="muted" className="mt-2 text-[var(--admin-muted)]">
          {description}
        </Typography>
      </div>
      <AdminPanelCard
        title="Coming soon"
        description="Platform section placeholder — wire real UI when ready."
      >
        <p className="text-sm text-[var(--admin-muted)]">
          This view is registered by core so navigation stays complete while
          domain modules inject their own pages.
        </p>
      </AdminPanelCard>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <PlatformStub
      title="Settings"
      description="Site-wide configuration for the ArgoCore platform."
    />
  );
}

export function AdminAccessPage() {
  return (
    <PlatformStub
      title="Access control"
      description="Role permissions and staff assignments."
    />
  );
}

export function AdminAuditLogsPage() {
  return (
    <PlatformStub
      title="Audit logs"
      description="History of sensitive staff actions."
    />
  );
}
