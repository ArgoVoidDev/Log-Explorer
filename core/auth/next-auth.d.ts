import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    phone: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      phone: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    phone?: string;
    error?: string;
  }
}

export {};
