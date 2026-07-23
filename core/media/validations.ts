import { z } from "zod";

import { ALLOWED_IMAGE_MIMES, MAX_UPLOAD_BYTES } from "./constants";

export const imageContentTypeSchema = z.enum(ALLOWED_IMAGE_MIMES);

/** Prefix validated against the registry in the route handler. */
export const presignSchema = z.object({
  prefix: z.string().min(1),
  contentType: imageContentTypeSchema,
  contentLength: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

export type PresignInput = z.infer<typeof presignSchema>;
