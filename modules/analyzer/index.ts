/**
 * SaaS domain module — keep isolated from ecommerce/portfolio.
 *
 * Uses `@core/auth` for sessions and `@core/database` for user reads.
 * Billing/subscription types live here; no ecommerce order or cart imports.
 */

export {
  saasConfig,
  saasDashboardNav,
  guestCustomerProfile,
  type SaasConfig,
} from "./config";

export {
  requireCustomerDashboard,
  type CustomerDashboardSession,
} from "./access";

export type {
  BillingInterval,
  CustomerBillingSummary,
  DashboardOverview,
  Invoice,
  InvoiceStatus,
  Plan,
  SaasCustomerProfile,
  Subscription,
  SubscriptionStatus,
  SubscriptionWithPlan,
} from "./types";

export {
  SUBSCRIPTION_STATUS_LABELS,
  isSubscriptionUsable,
} from "./lib/subscription-status";

export { chunkLogText } from "./lib/chunking";

export { getCustomerProfile } from "./repositories/user.repository";
export {
  getBillingSummary,
  getDashboardOverview,
  getInvoicesForUser,
  getPlans,
  getSubscriptionForUser,
} from "./repositories/billing.repository";

export { signOutAction } from "./actions/auth.actions";

export { DashboardShell } from "./components/layout/dashboard-shell";
export { DashboardSidebar } from "./components/layout/dashboard-sidebar";
export { DashboardTopbar } from "./components/layout/dashboard-topbar";
export { DashboardOverviewContent } from "./components/dashboard-overview-content";
export { LogUploader } from "./components/log-uploader";
export { BillingPageContent } from "./components/billing-page-content";
export { ProfilePageContent } from "./components/profile-page-content";
export {
  ByokSettingsModal,
  ByokSettingsPanel,
} from "./components/byok-settings-modal";
export type { ByokSettingsModalProps } from "./components/byok-settings-modal";
export {
  useApiKey,
  GEMINI_API_KEY_STORAGE_KEY,
  readGeminiApiKey,
  writeGeminiApiKey,
  deleteGeminiApiKey,
} from "./hooks/use-api-key";
export type { UseApiKeyResult } from "./hooks/use-api-key";
