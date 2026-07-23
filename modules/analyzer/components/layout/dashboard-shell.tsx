import type { CSSProperties, ReactNode } from "react";

import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

type DashboardShellProps = {
  userName: string;
  children: ReactNode;
};

const shellStyle = {
  "--font-saas-display": "var(--font-portfolio-display)",
  "--saas-bg": "oklch(0.97 0.008 230)",
  "--saas-panel": "oklch(0.99 0.004 230)",
  "--saas-surface": "oklch(0.94 0.012 220)",
  "--saas-ink": "oklch(0.24 0.03 250)",
  "--saas-muted": "oklch(0.5 0.02 250)",
  "--saas-line": "oklch(0.88 0.015 230)",
  "--saas-accent": "oklch(0.55 0.08 220)",
  background:
    "linear-gradient(180deg, var(--saas-bg) 0%, oklch(0.95 0.012 210) 100%)",
} as CSSProperties;

/** Account-style chrome for SaaS customer routes (sidebar + topbar). */
export function DashboardShell({ userName, children }: DashboardShellProps) {
  return (
    <div
      className="saas-dashboard flex min-h-svh text-[var(--saas-ink)]"
      style={shellStyle}
    >
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar userName={userName} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
