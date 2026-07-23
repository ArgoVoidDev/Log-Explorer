import { env } from "@core/env";

import type { AdminModuleId } from "./types";

const DEFAULT_ACTIVE = ["saas"] as const;

/** Legacy env alias: analyzer app routes live under modules/analyzer. */
const MODULE_ALIASES: Record<string, AdminModuleId> = {
  analyzer: "saas",
};

function normalizeModuleId(raw: string): AdminModuleId | null {
  const id = raw.trim().toLowerCase();
  if (id in MODULE_ALIASES) return MODULE_ALIASES[id];
  if (id === "ecommerce" || id === "saas" || id === "portfolio" || id === "core") {
    return id;
  }
  return null;
}

/** Parse ACTIVE_MODULES env (comma-separated). Defaults to saas. */
export function getActiveModules(): AdminModuleId[] {
  const raw = env.ACTIVE_MODULES;
  if (!raw) return [...DEFAULT_ACTIVE];

  const parsed = raw
    .split(",")
    .map(normalizeModuleId)
    .filter((id): id is AdminModuleId => id !== null);

  return parsed.length > 0 ? parsed : [...DEFAULT_ACTIVE];
}

export function isModuleActive(id: AdminModuleId): boolean {
  if (id === "core") return true;
  return getActiveModules().includes(id);
}
