import type { NextAuthConfig } from "next-auth";

import { isStaffRole } from "./rbac";

/**
 * Edge-safe NextAuth config (no Node/Prisma imports).
 * Coarse route gates only — fine-grained RBAC runs in Node (layout + actions).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const role = auth?.user?.role;

      if (path.startsWith("/admin")) {
        return isLoggedIn && !!role && isStaffRole(role);
      }

      if (path.startsWith("/account")) {
        return isLoggedIn;
      }

      if (path.startsWith("/checkout") || path.startsWith("/orders")) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      token.id =
        (token.id as string | undefined) ??
        (token.sub as string | undefined);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role =
          token.role as import("@prisma/client").UserRole;
        session.user.phone = (token.phone as string) ?? "";
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt", updateAge: 60 },
  trustHost: true,
} satisfies NextAuthConfig;
