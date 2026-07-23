"use client";

import imageCompression from "browser-image-compression";

import {
  IMAGE_OPTIMIZE,
  MAX_UPLOAD_BYTES,
  OPTIMIZE_FAILED_MESSAGE,
} from "./constants";
import { isAllowedImageMime } from "./image-mime";
import type { MediaPrefix } from "./prefixes";

export class UploadClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "UploadClientError";
    this.status = status;
  }
}

/**
 * Compress an image to WebP (max edge 1600, quality 0.85) for upload.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: IMAGE_OPTIMIZE.maxWidthOrHeight,
      initialQuality: IMAGE_OPTIMIZE.initialQuality,
      fileType: IMAGE_OPTIMIZE.fileType,
      useWebWorker: IMAGE_OPTIMIZE.useWebWorker,
    });
    return compressed;
  } catch {
    throw new UploadClientError(OPTIMIZE_FAILED_MESSAGE);
  }
}

/**
 * Optimize then multipart-POST to `/api/upload`.
 * Ecommerce: `MediaPrefixes.PRODUCTS` · Portfolio: `MediaPrefixes.GALLERY`.
 */
export async function uploadImageFile(
  file: File,
  prefix: MediaPrefix,
): Promise<string> {
  if (!isAllowedImageMime(file.type)) {
    throw new UploadClientError("نوع فایل مجاز نیست");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadClientError("حجم فایل بیش از حد مجاز است");
  }

  const optimized = await optimizeImageForUpload(file);

  const body = new FormData();
  body.append("file", optimized, optimized.name || "image.webp");
  body.append("prefix", prefix);

  const res = await fetch("/api/upload", {
    method: "POST",
    body,
  });

  const data = (await res.json().catch(() => null)) as
    | { publicUrl?: string; error?: string }
    | null;

  if (!res.ok) {
    throw new UploadClientError(
      data?.error || "آپلود ناموفق بود",
      res.status,
    );
  }

  if (!data?.publicUrl) {
    throw new UploadClientError("پاسخ آپلود نامعتبر است");
  }

  return data.publicUrl;
}
