import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

import {
  MAX_UPLOAD_BYTES,
  MIME_TO_EXT,
  PRESIGN_EXPIRES_SECONDS,
} from "./constants";
import { getArvanConfig, hasS3Config } from "./env";
import type { AllowedImageMime, PresignResult, UploadResult } from "./types";

let cachedClient: S3Client | null = null;

function requireS3() {
  const cfg = getArvanConfig();
  if (!hasS3Config() || !cfg.endpoint || !cfg.accessKey || !cfg.secretKey || !cfg.bucket) {
    throw new Error("S3 is not configured");
  }
  return {
    endpoint: cfg.endpoint,
    accessKey: cfg.accessKey,
    secretKey: cfg.secretKey,
    bucket: cfg.bucket,
    cdnDomain: cfg.cdnDomain,
  };
}

function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const { endpoint, accessKey, secretKey } = requireS3();
  cachedClient = new S3Client({
    region: "default",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
  return cachedClient;
}

export function buildObjectKey(prefix: string, contentType: AllowedImageMime): string {
  const ext = MIME_TO_EXT[contentType];
  return `${prefix}/${randomUUID()}.${ext}`;
}

export function publicUrlForKey(key: string): string {
  const { endpoint, bucket, cdnDomain } = requireS3();
  if (cdnDomain) {
    const host = cdnDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}/${key}`;
  }
  const base = endpoint.replace(/\/$/, "");
  return `${base}/${bucket}/${key}`;
}

export function validateUploadInput(options: {
  contentType: string;
  contentLength: number;
}): AllowedImageMime {
  const { contentType, contentLength } = options;
  if (
    contentType !== "image/jpeg" &&
    contentType !== "image/png" &&
    contentType !== "image/webp"
  ) {
    throw new Error("نوع فایل مجاز نیست");
  }
  if (contentLength < 1 || contentLength > MAX_UPLOAD_BYTES) {
    throw new Error("حجم فایل نامعتبر است");
  }
  return contentType;
}

export async function uploadObjectDirect(options: {
  prefix: string;
  contentType: AllowedImageMime;
  body: Buffer | Uint8Array;
}): Promise<UploadResult> {
  const { bucket } = requireS3();
  const key = buildObjectKey(options.prefix, options.contentType);
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: options.body,
      ContentType: options.contentType,
    }),
  );

  return {
    publicUrl: publicUrlForKey(key),
    key,
    storage: "s3",
  };
}

export async function createPresignedUpload(options: {
  prefix: string;
  contentType: AllowedImageMime;
  contentLength: number;
}): Promise<PresignResult> {
  validateUploadInput({
    contentType: options.contentType,
    contentLength: options.contentLength,
  });

  const { bucket } = requireS3();
  const key = buildObjectKey(options.prefix, options.contentType);
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: options.contentType,
    ContentLength: options.contentLength,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGN_EXPIRES_SECONDS,
  });

  return {
    uploadUrl,
    publicUrl: publicUrlForKey(key),
    key,
  };
}

/**
 * Best-effort delete from S3 or local disk. Failures are logged, not thrown.
 */
export async function deleteMediaFile(fileUrl: string): Promise<void> {
  try {
    const key = extractObjectKey(fileUrl);
    if (!key) return;

    if (key.startsWith("uploads/") || fileUrl.startsWith("/uploads/")) {
      const { unlink } = await import("fs/promises");
      const { join } = await import("path");
      const relative = key.startsWith("uploads/")
        ? key
        : fileUrl.replace(/^\//, "");
      const abs = join(process.cwd(), "public", relative);
      await unlink(abs).catch(() => undefined);
      return;
    }

    if (!hasS3Config()) return;
    const { bucket } = requireS3();
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (err) {
    console.error("[media] deleteMediaFile failed:", fileUrl, err);
  }
}

/** Extract object key from CDN, path-style S3, or `/uploads/...` URLs. */
export function extractObjectKey(fileUrl: string): string | null {
  try {
    if (fileUrl.startsWith("/uploads/")) {
      return fileUrl.replace(/^\//, "");
    }

    const url = new URL(fileUrl);
    const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!pathname) return null;

    const cfg = getArvanConfig();
    if (cfg.bucket && pathname.startsWith(`${cfg.bucket}/`)) {
      return pathname.slice(cfg.bucket.length + 1);
    }

    return pathname;
  } catch {
    return null;
  }
}
