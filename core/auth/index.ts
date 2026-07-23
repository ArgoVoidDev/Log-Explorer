/**
 * ArgoCore global auth — NextAuth v5 (JWT), RBAC, guards, middleware helpers.
 *
 * Modules import from `@core/auth` (never from sibling module paths).
 */

export {
  handlers,
  auth,
  signIn,
  signOut,
  requireAuth,
  requireStaff,
  requireAdmin,
  requireCustomer,
  requireSection,
  getSessionPermissions,
} from "./auth";

export { authConfig } from "./auth.config";

export {
  getFreshSession,
  getFreshStaffSession,
  requirePageAccess,
  type FreshStaffSession,
} from "./access";

export {
  STAFF_ROLES,
  isStaffRole,
  USER_ROLE_LABELS,
  ADMIN_NAV,
  DEFAULT_PERMISSIONS,
  resolveAdminSection,
  canAccessSection,
  getAssignableRoles,
  canAssignRole,
  registerAdminRoutes,
  registerAdminRoutePrefixes,
  registerAdminNav,
  registerDefaultPermissions,
} from "./rbac";

export {
  AdminSections,
  type AdminSection,
  type AdminNavItem,
  type CoreAdminSection,
  type PermissionMode,
  type SectionPermission,
  type StaffRole,
} from "./types";

export {
  getPermissionsForRole,
  getAllRolePermissions,
  upsertRolePermission,
} from "./permissions";

export {
  findUserByPhoneOrEmail,
  findUserByPhone,
  createUser,
  markPhoneVerified,
  hashPassword,
  verifyPassword,
  updatePasswordHash,
  getUserPasswordHash,
} from "./users";

export {
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_MAX_ATTEMPTS,
  generateOtpCode,
  getLatestOtpForPhone,
  getActiveOtpForPhone,
  getResendCooldownSeconds,
  createLoginOtp,
  incrementOtpAttempts,
  consumeOtp,
  verifyOtpCode,
} from "./otp";

export {
  normalizeIranMobile,
  looksLikePhone,
  toWesternDigits,
} from "./phone";

export {
  credentialsSchema,
  verifyOtpSchema,
  otpCredentialsSchema,
} from "./validations";

export {
  assertCaptchaForAuthorize,
  createCaptchaBypassProof,
  getCaptchaSiteKey,
  isCaptchaAuthError,
  isCaptchaEnabled,
  verifyCaptchaToken,
  CAPTCHA_ERROR_MESSAGE,
  CaptchaSigninError,
} from "./captcha";

export {
  rateLimitKey,
  getRateLimitBlock,
  consumeRateLimit,
  recordRateLimitFailure,
  resetRateLimit,
  cleanExpiredRateLimitBuckets,
  type RateLimitResult,
} from "./rate-limit";

export {
  assertLoginAllowed,
  clearLoginSuccess,
  normalizeAuthIdentifier,
  recordLoginIdentifierFailure,
  recordLoginIpFailure,
} from "./throttle";

export { getClientIp } from "./request-ip";

export { authMiddlewareConfig } from "./middleware-config";
