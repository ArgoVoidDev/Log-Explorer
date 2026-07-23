/**
 * SaaS admin entry — loaded by core/admin bootstrap when ACTIVE_MODULES
 * includes "saas". Side-effect registration only.
 */

import { registerSaasAdmin } from "./register";

registerSaasAdmin();

export { UsersAdminView } from "./users-admin-view";
export { registerSaasAdmin, SaasAdminSections } from "./register";
