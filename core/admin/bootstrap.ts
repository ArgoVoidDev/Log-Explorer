import { isModuleActive } from "./active-modules";
import { registerCoreAdminViews } from "./register-core";

let loaded = false;

/**
 * Idempotent: register core platform views, then load active domain admin
 * packages so they can call `registerAdminView`.
 */
export async function ensureModulesLoaded(): Promise<void> {
  if (loaded) return;
  loaded = true;

  registerCoreAdminViews();

  const loaders: Array<Promise<unknown>> = [];

  if (isModuleActive("saas")) {
    loaders.push(import("@modules/saas/admin"));
  }

  await Promise.all(loaders);
}
