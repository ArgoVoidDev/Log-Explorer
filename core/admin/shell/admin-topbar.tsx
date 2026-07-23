"use client";

import { buttonVariants, Typography } from "@core/ui";
import { cn } from "@core/lib/utils";

import { signOutAction } from "../actions/auth.actions";
import type { AdminShellNavItem } from "../types";
import { AdminMobileNav } from "./admin-sidebar";

type AdminTopbarProps = {
  userName: string;
  navItems: AdminShellNavItem[];
};

export function AdminTopbar({ userName, navItems }: AdminTopbarProps) {
  return (
    <header className="relative z-20 flex h-14 items-center justify-between gap-4 border-b border-[var(--admin-line)] bg-[var(--admin-panel)]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav items={navItems} />
        <Typography
          variant="small"
          className="hidden text-[var(--admin-muted)] sm:block"
        >
          Staff panel
        </Typography>
      </div>

      <div className="flex items-center gap-3">
        <Typography
          variant="small"
          className="max-w-[10rem] truncate text-[var(--admin-ink)] md:max-w-xs"
        >
          {userName}
        </Typography>
        <form action={signOutAction}>
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-[var(--admin-line)] text-[var(--admin-ink)]",
            )}
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
