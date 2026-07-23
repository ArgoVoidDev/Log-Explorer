/**
 * SaaS product config — isolated from ecommerce/portfolio.
 * Override via NEXT_PUBLIC_SAAS_* env vars.
 */

export type SaasConfig = {
  name: string;
  tagline: string;
};

function env(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

export const saasConfig: SaasConfig = {
  name: env("NEXT_PUBLIC_SAAS_NAME", "Argo"),
  tagline: env(
    "NEXT_PUBLIC_SAAS_TAGLINE",
    "Your workspace for plans, billing, and account settings.",
  ),
};

/** Customer dashboard nav — mirrors CUSTOMER_PANEL structure for SaaS. */
export const saasDashboardNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/profile", label: "Profile" },
] as const;

export type SaasDashboardNavItem = (typeof saasDashboardNav)[number];
