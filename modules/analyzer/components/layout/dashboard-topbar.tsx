import { Typography } from "@core/ui";

import { DashboardMobileNav } from "./dashboard-sidebar";

type DashboardTopbarProps = {
  userName: string;
};

export function DashboardTopbar({ userName }: DashboardTopbarProps) {
  return (
    <header className="relative z-20 flex h-14 items-center justify-between gap-4 border-b border-[var(--saas-line)] bg-[var(--saas-panel)]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <DashboardMobileNav />
        <Typography
          variant="small"
          className="hidden text-[var(--saas-muted)] sm:block"
        >
          Customer dashboard
        </Typography>
      </div>

      <Typography
        variant="small"
        className="max-w-[10rem] truncate text-[var(--saas-ink)] md:max-w-xs"
      >
        {userName}
      </Typography>
    </header>
  );
}
