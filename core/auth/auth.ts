import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";

import { db } from "@core/database";
import { env } from "@core/env";

import { authConfig } from "./auth.config";
import { assertCaptchaForAuthorize } from "./captcha";
import {
  canAccessSection,
  isStaffRole,
} from "./rbac";
import { consumeOtp, getActiveOtpForPhone, incrementOtpAttempts, OTP_MAX_ATTEMPTS, verifyOtpCode } from "./otp";
import { getPermissionsForRole } from "./permissions";
import { normalizeIranMobile } from "./phone";
import {
  clearLoginSuccess,
  normalizeAuthIdentifier,
  recordLoginIdentifierFailure,
} from "./throttle";
import type {
  AdminSection,
  PermissionMode,
  SectionPermission,
} from "./types";
import {
  findUserByPhone,
  findUserByPhoneOrEmail,
  markPhoneVerified,
  verifyPassword,
} from "./users";
import { credentialsSchema, otpCredentialsSchema } from "./validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    updateAge: 60,
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }

      token.id =
        (token.id as string | undefined) ??
        (token.sub as string | undefined);

      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, phone: true, name: true },
          });
          if (!dbUser) {
            return {
              ...token,
              role: undefined,
              error: "UserNotFound",
            };
          }
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          if (dbUser.name) token.name = dbUser.name;
          if ("error" in token) delete token.error;
        } catch {
          // Keep prior token values on transient DB errors
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.phone = (token.phone as string) ?? "";
      }
      return session;
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        identifier: { label: "Phone or Email", type: "text" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "CAPTCHA", type: "text" },
        captchaBypass: { label: "CAPTCHA Bypass", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { getRateLimitBlock, rateLimitKey } = await import("./rate-limit");
        const normalizedId = normalizeAuthIdentifier(parsed.data.identifier);

        await assertCaptchaForAuthorize({
          captchaToken: parsed.data.captchaToken,
          captchaBypass: parsed.data.captchaBypass,
          bypassSubject: normalizedId,
        });

        const idKey = rateLimitKey("login:id", normalizedId);
        const locked = await getRateLimitBlock(idKey);
        if (!locked.ok) return null;

        const user = await findUserByPhoneOrEmail(parsed.data.identifier);
        if (!user) {
          await recordLoginIdentifierFailure(parsed.data.identifier);
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) {
          await recordLoginIdentifierFailure(parsed.data.identifier);
          return null;
        }

        await clearLoginSuccess(parsed.data.identifier);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
    Credentials({
      id: "otp",
      name: "otp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
        captchaToken: { label: "CAPTCHA", type: "text" },
      },
      async authorize(credentials) {
        const parsed = otpCredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const phone = normalizeIranMobile(parsed.data.phone);
        if (!phone) return null;

        await assertCaptchaForAuthorize({
          captchaToken: parsed.data.captchaToken,
        });

        const user = await findUserByPhone(phone);
        if (!user) return null;

        const otp = await getActiveOtpForPhone(phone);
        if (!otp) return null;

        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
          await consumeOtp(otp.id);
          return null;
        }

        const valid = await verifyOtpCode(otp.codeHash, parsed.data.code);
        if (!valid) {
          const updated = await incrementOtpAttempts(otp.id);
          if (updated.attempts >= OTP_MAX_ATTEMPTS) {
            await consumeOtp(otp.id);
          }
          return null;
        }

        await consumeOtp(otp.id);
        await markPhoneVerified(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, phone: true, email: true },
  });
  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: dbUser.id,
      role: dbUser.role,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
    },
  };
}

export async function requireStaff() {
  const session = await requireAuth();
  if (!isStaffRole(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireCustomer() {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") {
    throw new Error("Forbidden");
  }
  return session;
}

export async function getSessionPermissions(
  role: UserRole,
): Promise<SectionPermission[]> {
  if (role === "ADMIN") {
    return (await import("./rbac")).DEFAULT_PERMISSIONS.ADMIN;
  }
  if (!isStaffRole(role)) return [];
  return getPermissionsForRole(role);
}

export async function requireSection(
  section: AdminSection,
  mode: PermissionMode = "read",
) {
  const session = await requireStaff();
  const permissions = await getSessionPermissions(session.user.role);

  if (!canAccessSection(session.user.role, section, mode, permissions)) {
    throw new Error("Forbidden");
  }

  return session;
}
