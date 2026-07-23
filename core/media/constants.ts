import type { AllowedImageMime } from "./types";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const satisfies readonly AllowedImageMime[];

export const MIME_TO_EXT: Record<AllowedImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Client-side WebP compression (PERFORMANCE.md / MEDIA_SYSTEM.md). */
export const IMAGE_OPTIMIZE = {
  maxWidthOrHeight: 1600,
  initialQuality: 0.85,
  fileType: "image/webp" as const,
  useWebWorker: true,
} as const;

export const PRESIGN_EXPIRES_SECONDS = 300;

export const UPLOAD_RETRY_MESSAGE =
  "تعداد درخواست‌های آپلود بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.";

export const INVALID_IMAGE_CONTENT_MESSAGE = "محتوای فایل تصویر معتبر نیست";
export const MIME_MISMATCH_MESSAGE = "نوع فایل با محتوا مطابقت ندارد";
export const OPTIMIZE_FAILED_MESSAGE = "بهینه‌سازی تصویر ناموفق بود";
