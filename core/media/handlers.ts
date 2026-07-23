import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@core/auth";

import {
  assertUploadAccess,
  isRegisteredUploadPrefix,
} from "./auth";
import { hasS3Config } from "./env";
import { createPresignedUpload, validateUploadInput } from "./s3";
import { storeValidatedImage } from "./store";
import { isAllowedImageMime } from "./image-mime";
import { presignSchema } from "./validations";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

/**
 * `POST /api/upload` — multipart `file` + `prefix`.
 * Compress on the client first (`uploadImageFile`); server validates + stores.
 */
export async function handleUploadPost(request: NextRequest) {
  const session = await auth();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("درخواست نامعتبر است", 400);
  }

  const file = form.get("file");
  const prefixRaw = form.get("prefix");
  const prefix = typeof prefixRaw === "string" ? prefixRaw.trim() : "";

  if (!(file instanceof File)) {
    return jsonError("فایل الزامی است", 400);
  }
  if (!prefix || !isRegisteredUploadPrefix(prefix)) {
    return jsonError("پیشوند نامعتبر است", 400);
  }

  const access = await assertUploadAccess(session, prefix);
  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!isAllowedImageMime(file.type)) {
    return jsonError("نوع فایل مجاز نیست", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await storeValidatedImage({
      prefix,
      declaredType: file.type,
      buffer,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "آپلود ناموفق بود";
    return jsonError(message, 400);
  }
}

/**
 * `POST /api/upload/presign` — JSON body for direct browser→S3 PUT.
 * Requires S3 config; returns 503 when falling back to local storage.
 */
export async function handlePresignPost(request: NextRequest) {
  const session = await auth();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("درخواست نامعتبر است", 400);
  }

  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("ورودی نامعتبر است", 400);
  }

  const { prefix, contentType, contentLength } = parsed.data;

  if (!isRegisteredUploadPrefix(prefix)) {
    return jsonError("پیشوند نامعتبر است", 400);
  }

  const access = await assertUploadAccess(session, prefix);
  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!hasS3Config()) {
    return jsonError("ذخیره‌سازی ابری پیکربندی نشده است", 503);
  }

  try {
    validateUploadInput({ contentType, contentLength });
    const result = await createPresignedUpload({
      prefix,
      contentType,
      contentLength,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "ایجاد لینک آپلود ناموفق بود";
    return jsonError(message, 400);
  }
}
