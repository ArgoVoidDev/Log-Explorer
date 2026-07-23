import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

import { MIME_TO_EXT } from "./constants";
import type { AllowedImageMime, UploadResult } from "./types";

/**
 * Persist an upload under `public/uploads/<prefix>/<uuid>.<ext>`.
 * Returns a site-relative public URL.
 */
export async function saveLocalUpload(options: {
  prefix: string;
  contentType: AllowedImageMime;
  body: Buffer | Uint8Array;
}): Promise<UploadResult> {
  const ext = MIME_TO_EXT[options.contentType];
  const filename = `${randomUUID()}.${ext}`;
  const relativeDir = join("uploads", options.prefix);
  const absDir = join(process.cwd(), "public", relativeDir);

  await mkdir(absDir, { recursive: true });

  const absPath = join(absDir, filename);
  await writeFile(absPath, options.body);

  const key = `${options.prefix}/${filename}`;
  const publicUrl = `/uploads/${options.prefix}/${filename}`;

  return {
    publicUrl,
    key,
    storage: "local",
  };
}
