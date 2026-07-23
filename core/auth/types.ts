import type { UserRole } from "@prisma/client";

/** Staff roles that may access admin panels across modules. */
export type StaffRole = Extract<
  UserRole,
  "ADMIN" | "MANAGER" | "EDITOR" | "SUPPORT"
>;

export type PermissionMode = "read" | "write";

/**
 * Admin section key. Core ships documented ecommerce sections as plain strings;
 * modules may register additional keys (e.g. `saas:SUBSCRIPTIONS`).
 */
export type AdminSection = string;

export interface SectionPermission {
  section: AdminSection;
  canRead: boolean;
  canWrite: boolean;
}

export interface AdminNavItem {
  href: string;
  label: string;
  section: AdminSection;
  icon?: string;
}

/** Core / ecommerce section constants (PERMISSIONS.md). */
export const AdminSections = {
  DASHBOARD: "DASHBOARD",
  ORDERS: "ORDERS",
  CUSTOM_REQUESTS: "CUSTOM_REQUESTS",
  PRODUCTS: "PRODUCTS",
  INVENTORY: "INVENTORY",
  CATEGORIES: "CATEGORIES",
  CUSTOMERS: "CUSTOMERS",
  REVIEWS: "REVIEWS",
  COUPONS: "COUPONS",
  ANALYTICS: "ANALYTICS",
  HOMEPAGE_CONTENT: "HOMEPAGE_CONTENT",
  SETTINGS: "SETTINGS",
  ACCESS_CONTROL: "ACCESS_CONTROL",
  AUDIT_LOGS: "AUDIT_LOGS",
} as const;

export type CoreAdminSection =
  (typeof AdminSections)[keyof typeof AdminSections];
