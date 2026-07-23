/** Customer profile DTO for the SaaS dashboard (core User fields only). */

export type SaasCustomerProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  avatarUrl: string | null;
  memberSince: Date;
};
