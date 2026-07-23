import type { Session } from "next-auth";

import {
  AdminSections,
  canAccessSection,
  getSessionPermissions,
  isStaffRole,
} from "@core/auth";

import { consumeUploadQuota } from "./throttle";
import { MediaPrefixes } from "./prefixes";
import type { UploadAccessResult, UploadPrefixConfig } from "./types";

const registry = new Map<string, UploadPrefixConfig>();

function registerDefaults() {
  if (registry.size > 0) return;

  registerUploadPrefix({
    prefix: MediaPrefixes.AVATARS,
    access: { kind: "customer" },
    quota: "avatar",
  });
  registerUploadPrefix({
    prefix: MediaPrefixes.CUSTOM_ORDERS,
    access: { kind: "authenticated" },
    quota: "custom-order",
  });
  registerUploadPrefix({
    prefix: MediaPrefixes.PRODUCTS,
    access: {
      kind: "staff-section",
      section: AdminSections.PRODUCTS,
      mode: "write",
    },
    quota: "staff",
  });
  registerUploadPrefix({
    prefix: MediaPrefixes.SHOWCASES,
    access: {
      kind: "staff-section",
      section: AdminSections.PRODUCTS,
      mode: "write",
    },
    quota: "staff",
  });
  registerUploadPrefix({
    prefix: MediaPrefixes.HOMEPAGE,
    access: {
      kind: "staff-section",
      section: AdminSections.HOMEPAGE_CONTENT,
      mode: "write",
    },
    quota: "staff",
  });
  /** Portfolio gallery — any staff; modules may re-register with a section. */
  registerUploadPrefix({
    prefix: MediaPrefixes.GALLERY,
    access: { kind: "staff" },
    quota: "staff",
  });
}

/** Register or override an upload prefix (modules extend core media). */
export function registerUploadPrefix(config: UploadPrefixConfig): void {
  const prefix = config.prefix.trim();
  if (!prefix || prefix.includes("/") || prefix.includes("..")) {
    throw new Error(`Invalid upload prefix: ${config.prefix}`);
  }
  registry.set(prefix, { ...config, prefix });
}

export function getUploadPrefixConfig(
  prefix: string,
): UploadPrefixConfig | undefined {
  registerDefaults();
  return registry.get(prefix);
}

export function isRegisteredUploadPrefix(prefix: string): boolean {
  return Boolean(getUploadPrefixConfig(prefix));
}

export function listUploadPrefixes(): string[] {
  registerDefaults();
  return [...registry.keys()];
}

/**
 * Auth + RBAC + upload quota for a registered prefix.
 * Returns `{ ok, userId }` or `{ ok:false, status, error }` (401/403/429).
 */
export async function assertUploadAccess(
  session: Session | null,
  prefix: string,
): Promise<UploadAccessResult> {
  const config = getUploadPrefixConfig(prefix);
  if (!config) {
    return {
      ok: false,
      status: 403,
      error: "پیشوند نامعتبر است",
    };
  }

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "برای آپلود باید وارد شوید" };
  }

  const userId = session.user.id;
  const role = session.user.role;

  const allowed = await evaluateAccess(config, role);
  if (!allowed) {
    return {
      ok: false,
      status: 403,
      error: "اجازه آپلود برای این بخش را ندارید",
    };
  }

  const quota = await consumeUploadQuota(userId, config.quota);
  if (!quota.ok) {
    return { ok: false, status: 429, error: quota.error };
  }

  return { ok: true, userId };
}

async function evaluateAccess(
  config: UploadPrefixConfig,
  role: Session["user"]["role"] | undefined,
): Promise<boolean> {
  if (!role) return false;

  switch (config.access.kind) {
    case "customer":
      return role === "CUSTOMER";
    case "authenticated":
      return true;
    case "staff":
      return isStaffRole(role);
    case "staff-section": {
      if (!isStaffRole(role)) return false;
      const mode = config.access.mode ?? "write";
      const permissions = await getSessionPermissions(role);
      return canAccessSection(role, config.access.section, mode, permissions);
    }
    default:
      return false;
  }
}
