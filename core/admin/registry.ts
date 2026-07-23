import type { AdminNavItem } from "@core/auth";
import {
  registerAdminNav,
  registerAdminRoutePrefixes,
  registerAdminRoutes,
} from "@core/auth";

import type { AdminViewDefinition } from "./types";

const views = new Map<string, AdminViewDefinition>();
const registeredHrefs = new Set<string>();

function normalizeHref(href: string): string {
  if (href === "/admin") return "/admin";
  return href.replace(/\/+$/, "") || "/admin";
}

/**
 * Register a module (or core) admin view. Wires RBAC nav + route → section.
 * Idempotent for the same `id`; throws if another id claims the same href.
 */
export function registerAdminView(def: AdminViewDefinition): void {
  const href = normalizeHref(def.href);
  const existing = views.get(def.id);
  if (existing && existing.href !== href) {
    throw new Error(
      `Admin view "${def.id}" already registered at ${existing.href}`,
    );
  }
  if (registeredHrefs.has(href) && !views.has(def.id)) {
    throw new Error(`Admin href "${href}" already registered`);
  }

  const normalized: AdminViewDefinition = { ...def, href };
  views.set(def.id, normalized);
  registeredHrefs.add(href);

  if (!existing) {
    const navItem: AdminNavItem = {
      href,
      label: def.label,
      section: def.section,
      icon: def.icon,
    };
    // registerAdminNav skips duplicate hrefs (e.g. dashboard already in ADMIN_NAV).
    registerAdminNav([navItem]);
    registerAdminRoutes({ [href]: def.section });
    if (href !== "/admin") {
      registerAdminRoutePrefixes([{ prefix: href, section: def.section }]);
    }
  }
}

export function getAdminViews(): AdminViewDefinition[] {
  return [...views.values()].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.label.localeCompare(b.label),
  );
}

export function getAdminViewByPath(pathname: string): AdminViewDefinition | null {
  const clean = normalizeHref(pathname.split("?")[0]?.split("#")[0] || "/admin");

  const exact = [...views.values()].find((v) => v.href === clean);
  if (exact) return exact;

  // Longest prefix match for nested paths (e.g. /admin/products/catalog/new).
  let best: AdminViewDefinition | null = null;
  for (const view of views.values()) {
    if (view.href === "/admin") continue;
    if (clean.startsWith(`${view.href}/`)) {
      if (!best || view.href.length > best.href.length) best = view;
    }
  }
  return best;
}

export function getRegisteredAdminNav(): AdminNavItem[] {
  return getAdminViews().map((v) => ({
    href: v.href,
    label: v.label,
    section: v.section,
    icon: v.icon,
  }));
}
