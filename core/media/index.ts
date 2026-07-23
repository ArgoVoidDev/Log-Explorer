/**
 * ArgoCore media — uploads, validation, S3/local storage (server-safe).
 *
 * Client compression/upload: `import { uploadImageFile } from "@core/media/client"`
 * - Ecommerce: `uploadImageFile(file, MediaPrefixes.PRODUCTS)`
 * - Portfolio: `uploadImageFile(file, MediaPrefixes.GALLERY)`
 */

export { MediaPrefixes, type BuiltInMediaPrefix, type MediaPrefix } from "./prefixes";

export {
  type AllowedImageMime,
  type MediaStorage,
  type PresignResult,
  type UploadAccessPolicy,
  type UploadAccessResult,
  type UploadPrefixConfig,
  type UploadQuotaKind,
  type UploadResult,
} from "./types";

export {
  ALLOWED_IMAGE_MIMES,
  IMAGE_OPTIMIZE,
  MAX_UPLOAD_BYTES,
  MIME_TO_EXT,
} from "./constants";

export { hasS3Config, getArvanConfig, warnIfProductionLocalUploads } from "./env";

export {
  assertImageBufferMatchesDeclaredType,
  isAllowedImageMime,
} from "./image-mime";

export {
  buildObjectKey,
  createPresignedUpload,
  deleteMediaFile,
  extractObjectKey,
  publicUrlForKey,
  uploadObjectDirect,
  validateUploadInput,
} from "./s3";

export { saveLocalUpload } from "./local-upload";

export { consumeUploadQuota } from "./throttle";

export {
  assertUploadAccess,
  getUploadPrefixConfig,
  isRegisteredUploadPrefix,
  listUploadPrefixes,
  registerUploadPrefix,
} from "./auth";

export { storeValidatedImage } from "./store";

export { handlePresignPost, handleUploadPost } from "./handlers";

export { presignSchema, imageContentTypeSchema } from "./validations";
