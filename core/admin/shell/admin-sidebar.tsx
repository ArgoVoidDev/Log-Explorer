"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@core/ui";
import { cn } from "@core/lib/utils";

import type { AdminShellNavItem } from "../types";

function NavLinks({
  items,
  onNavigate,
  className,
}: {
  items: AdminShellNavItem[];
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-start px-3 text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-ink)]",
              active &&
                "bg-[var(--admin-surface)] font-medium text-[var(--admin-ink)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ items }: { items: AdminShellNavItem[] }) {
  return (
    <aside className="hidden w-56 shrink-0 border-e border-[var(--admin-line)] bg-[var(--admin-panel)] lg:block">
      <div className="sticky top-0 flex h-svh flex-col gap-8 px-4 py-6">
        <Link
          href="/admin"
          className="px-3 font-[family-name:var(--font-admin-display)] text-lg font-semibold tracking-tight text-[var(--admin-ink)]"
        >
          Admin
        </Link>
        <NavLinks items={items} />
      </div>
    </aside>
  );
}

export function AdminMobileNav({ items }: { items: AdminShellNavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "text-[var(--admin-ink)]",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <XIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <div
          id="admin-mobile-nav"
          className="absolute inset-x-0 top-full z-30 border-b border-[var(--admin-line)] bg-[var(--admin-panel)] px-4 py-4 shadow-sm"
        >
          <NavLinks items={items} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
