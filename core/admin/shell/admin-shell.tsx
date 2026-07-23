"use client";

import type { CSSProperties } from "react";

import type { AdminShellProps } from "../types";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

const shellStyle = {
  "--font-admin-display": "var(--font-portfolio-display)",
  "--admin-bg": "oklch(0.97 0.006 250)",
  "--admin-panel": "oklch(0.99 0.003 250)",
  "--admin-surface": "oklch(0.94 0.01 250)",
  "--admin-ink": "oklch(0.24 0.03 250)",
  "--admin-muted": "oklch(0.5 0.02 250)",
  "--admin-line": "oklch(0.88 0.012 250)",
  "--admin-accent": "oklch(0.45 0.06 250)",
  background:
    "linear-gradient(180deg, var(--admin-bg) 0%, oklch(0.95 0.01 230) 100%)",
} as CSSProperties;

/** Staff chrome: sidebar + topbar + main. Nav filtered by caller (RBAC). */
export function AdminShell({ userName, navItems, children }: AdminShellProps) {
  return (
    <div
      className="admin-panel flex min-h-svh text-[var(--admin-ink)]"
      style={shellStyle}
    >
      <AdminSidebar items={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar userName={userName} navItems={navItems} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
