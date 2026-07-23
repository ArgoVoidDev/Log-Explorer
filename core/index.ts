/** Shared platform layer — auth, UI, db, lib, admin, actions, api, utils, seo. No domain logic. */

export {
  env,
  requireEnv,
  getSiteUrlFromEnv,
  hasS3ConfigFromEnv,
  hasCaptchaConfig,
  hasKavenegarConfig,
  warnIfProductionLocalUploads,
} from "./env";
export type { Env } from "./env";

export { db, pgPool, UserRole } from "./database";

export type { Prisma, User } from "./database";



export {

  auth,

  handlers,

  signIn,

  signOut,

  requireAuth,

  requireStaff,

  requireAdmin,

  requireCustomer,

  requireSection,

  getSessionPermissions,

  getFreshSession,

  getFreshStaffSession,

  requirePageAccess,

  isStaffRole,

  canAccessSection,

  canAssignRole,

  getAssignableRoles,

  AdminSections,

  authMiddlewareConfig,

} from "./auth";

export type {

  AdminSection,

  FreshStaffSession,

  PermissionMode,

  SectionPermission,

  StaffRole,

} from "./auth";



export { cn } from "./lib";



export {

  MediaPrefixes,

  hasS3Config,

  deleteMediaFile,

  storeValidatedImage,

  registerUploadPrefix,

  assertUploadAccess,

  handleUploadPost,

  handlePresignPost,

} from "./media";

export type {

  MediaPrefix,

  UploadResult,

  UploadPrefixConfig,

} from "./media";



/** Prefer `@core/actions` / `@core/api` for tree-shaking; barrel also re-exports. */

export {

  createAction,

  actionOk,

  actionFail,

  isActionOk,

  ActionError,

  DEFAULT_ACTION_MESSAGES,

} from "./actions";

export type {

  ActionResult,

  ActionSuccess,

  ActionFailure,

  ActionMessages,

  CreateActionOptions,

} from "./actions";



export {

  createApiHandler,

  apiOk,

  apiError,

  ApiError,

  DEFAULT_API_MESSAGES,

} from "./api";

export type {

  ApiErrorBody,

  ApiHandlerMessages,

  ApiStatus,

  CreateApiHandlerOptions,

  ApiHandlerContext,

} from "./api";



/** Prefer `@core/utils` / `@core/seo` direct imports for tree-shaking. */

export {

  RevalidateWindows,

  cachedQuery,

  createCachedQuery,

  createCachedByKey,

  revalidateTags,

  revalidatePaths,

  revalidateCache,

  clientIsland,

} from "./utils";

export type { CachedQueryOptions } from "./utils";



export {

  getSiteUrl,

  absoluteUrl,

  canonicalPath,

  buildPageMetadata,

  buildRootMetadata,

  buildOrganizationJsonLd,

  buildWebSiteJsonLd,

  buildBreadcrumbJsonLd,

  buildProductJsonLd,

  buildCreativeWorkJsonLd,

  buildJsonLdGraph,

  JsonLd,

} from "./seo";

export type {

  PageMetadataInput,

  RootMetadataInput,

  JsonLdData,

  BreadcrumbItem,

  OrganizationJsonLdInput,

  WebSiteJsonLdInput,

  ProductJsonLdInput,

  CreativeWorkJsonLdInput,

} from "./seo";


