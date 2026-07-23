import { warnIfProductionLocalUploads, hasS3Config } from "./env";
import { assertImageBufferMatchesDeclaredType, isAllowedImageMime } from "./image-mime";
import { saveLocalUpload } from "./local-upload";
import { uploadObjectDirect, validateUploadInput } from "./s3";
import type { AllowedImageMime, UploadResult } from "./types";

/**
 * Validate buffer + MIME, then store on S3 or local disk.
 */
export async function storeValidatedImage(options: {
  prefix: string;
  declaredType: string;
  buffer: Buffer | Uint8Array;
}): Promise<UploadResult> {
  warnIfProductionLocalUploads();

  if (!isAllowedImageMime(options.declaredType)) {
    throw new Error("نوع فایل مجاز نیست");
  }

  const contentType = options.declaredType as AllowedImageMime;
  assertImageBufferMatchesDeclaredType(options.buffer, contentType);
  validateUploadInput({
    contentType,
    contentLength: options.buffer.byteLength,
  });

  if (hasS3Config()) {
    return uploadObjectDirect({
      prefix: options.prefix,
      contentType,
      body: options.buffer,
    });
  }

  return saveLocalUpload({
    prefix: options.prefix,
    contentType,
    body: options.buffer,
  });
}
