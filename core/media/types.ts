import type { AdminSection } from "@core/auth";

export { MediaPrefixes, type BuiltInMediaPrefix, type MediaPrefix } from "./prefixes";

/** Storage backend used for an uploaded object. */
export type MediaStorage = "s3" | "local";

export type UploadQuotaKind = "avatar" | "custom-order" | "staff";

export type UploadAccessPolicy =
  | { kind: "customer" }
  | { kind: "authenticated" }
  | { kind: "staff" }
  | { kind: "staff-section"; section: AdminSection; mode?: "read" | "write" };

export type UploadPrefixConfig = {
  prefix: string;
  access: UploadAccessPolicy;
  quota: UploadQuotaKind;
};

export type UploadResult = {
  publicUrl: string;
  key: string;
  storage: MediaStorage;
};

export type PresignResult = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

export type UploadAccessOk = { ok: true; userId: string };
export type UploadAccessDenied = {
  ok: false;
  status: 401 | 403 | 429;
  error: string;
};
export type UploadAccessResult = UploadAccessOk | UploadAccessDenied;

export type AllowedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp";
