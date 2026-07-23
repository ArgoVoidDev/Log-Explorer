"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@core/ui";
import { cn } from "@core/lib/utils";

import { saasConfig, saasDashboardNav } from "../../config";

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className={cn("flex flex-col gap-1", className)}>
      {saasDashboardNav.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-start px-3 text-[var(--saas-muted)] hover:bg-[var(--saas-surface)] hover:text-[var(--saas-ink)]",
              active &&
                "bg-[var(--saas-surface)] font-medium text-[var(--saas-ink)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-e border-[var(--saas-line)] bg-[var(--saas-panel)] lg:block">
      <div className="sticky top-0 flex h-svh flex-col gap-8 px-4 py-6">
        <Link
          href="/dashboard"
          className="px-3 font-[family-name:var(--font-saas-display)] text-lg font-semibold tracking-tight text-[var(--saas-ink)]"
        >
          {saasConfig.name}
        </Link>
        <NavLinks />
      </div>
    </aside>
  );
}

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="saas-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-[var(--saas-ink)]",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <XIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div
          id="saas-mobile-nav"
          className="absolute inset-x-0 top-full z-30 border-b border-[var(--saas-line)] bg-[var(--saas-panel)] px-4 py-4 shadow-sm"
        >
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
