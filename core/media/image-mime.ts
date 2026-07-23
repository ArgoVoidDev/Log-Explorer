import {
  INVALID_IMAGE_CONTENT_MESSAGE,
  MIME_MISMATCH_MESSAGE,
} from "./constants";
import type { AllowedImageMime } from "./types";

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((b, i) => bytes[i] === b);
}

function detectImageMime(buffer: Uint8Array): AllowedImageMime | null {
  // JPEG: FF D8 FF
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Rejects Content-Type spoofing by comparing magic bytes to the declared MIME.
 * Throws an Error with a Persian message on mismatch / unknown type.
 */
export function assertImageBufferMatchesDeclaredType(
  buffer: Uint8Array,
  declared: string,
): asserts declared is AllowedImageMime {
  const detected = detectImageMime(buffer);
  if (!detected) {
    throw new Error(INVALID_IMAGE_CONTENT_MESSAGE);
  }
  if (detected !== declared) {
    throw new Error(MIME_MISMATCH_MESSAGE);
  }
}

export function isAllowedImageMime(value: string): value is AllowedImageMime {
  return (
    value === "image/jpeg" || value === "image/png" || value === "image/webp"
  );
}
