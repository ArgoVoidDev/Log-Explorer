import { env } from "@core/env";

import type { AdminModuleId } from "./types";

const DEFAULT_ACTIVE = ["ecommerce", "saas"] as const;

/** Parse ACTIVE_MODULES env (comma-separated). Defaults to ecommerce,saas. */
export function getActiveModules(): AdminModuleId[] {
  const raw = env.ACTIVE_MODULES;
  if (!raw) return [...DEFAULT_ACTIVE];

  const parsed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as AdminModuleId[];

  return parsed.length > 0 ? parsed : [...DEFAULT_ACTIVE];
}

export function isModuleActive(id: AdminModuleId): boolean {
  if (id === "core") return true;
  return getActiveModules().includes(id);
}
