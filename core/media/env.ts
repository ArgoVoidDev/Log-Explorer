/**
 * Arvan / S3 env helpers. All optional so the app boots without object storage.
 */

import {
  env,
  hasS3ConfigFromEnv,
  warnIfProductionLocalUploads as warnLocalUploads,
} from "@core/env";

export function getArvanConfig() {
  return {
    endpoint: env.ARVAN_ENDPOINT,
    accessKey: env.ARVAN_ACCESS_KEY,
    secretKey: env.ARVAN_SECRET_KEY,
    bucket: env.ARVAN_BUCKET,
    cdnDomain: env.ARVAN_CDN_DOMAIN,
  };
}

/** True when all required Arvan S3 credentials are set. */
export function hasS3Config(): boolean {
  return hasS3ConfigFromEnv();
}

/** Warn once in production when uploads fall back to local disk. */
export function warnIfProductionLocalUploads(): void {
  warnLocalUploads();
}
