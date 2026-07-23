import type { ComponentType, ReactNode } from "react";

import type { AdminSection } from "@core/auth";

export type AdminModuleId = "ecommerce" | "saas" | "portfolio" | "core";

export type AdminViewDefinition = {
  /** Stable key, e.g. `ecommerce:products`. */
  id: string;
  href: string;
  label: string;
  section: AdminSection;
  icon?: string;
  /** Lower sorts first; core dashboard uses 0. */
  order?: number;
  moduleId: AdminModuleId;
  View: ComponentType;
};

export type AdminShellNavItem = {
  href: string;
  label: string;
  section: AdminSection;
  icon?: string;
};

export type AdminShellProps = {
  userName: string;
  navItems: AdminShellNavItem[];
  children: ReactNode;
};
