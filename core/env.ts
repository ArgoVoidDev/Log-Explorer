import "server-only";

import { z } from "zod";

/**
 * Global environment validation (Zod).
 * Domain secrets (e.g. Zarinpal) stay in their modules.
 *
 * Production requires DATABASE_URL + AUTH_SECRET (≥32 chars).
 * Optional integrations degrade when unset (see SECURITY.md / DEPLOYMENT.md).
 * Set SKIP_ENV_VALIDATION=1 to bypass (CI smoke builds only).
 */

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const isProduction = process.env.NODE_ENV === "production";
const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "1" ||
  process.env.SKIP_ENV_VALIDATION === "true";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: isProduction
      ? z.preprocess(
          emptyToUndefined,
          z.string().min(1, "DATABASE_URL is required in production"),
        )
      : optionalString,

    AUTH_SECRET: isProduction
      ? z.preprocess(
          emptyToUndefined,
          z
            .string()
            .min(32, "AUTH_SECRET must be at least 32 characters in production"),
        )
      : optionalString,

    AUTH_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: optionalUrl,

    ACTIVE_MODULES: optionalString,

    CRON_SECRET: optionalString,

    NEXT_PUBLIC_CAPTCHA_SITE_KEY: optionalString,
    CAPTCHA_SECRET_KEY: optionalString,
    CAPTCHA_PROVIDER: z.preprocess(
      emptyToUndefined,
      z.enum(["turnstile", "recaptcha"]).optional(),
    ),

    ARVAN_ENDPOINT: optionalString,
    ARVAN_ACCESS_KEY: optionalString,
    ARVAN_SECRET_KEY: optionalString,
    ARVAN_BUCKET: optionalString,
    ARVAN_CDN_DOMAIN: optionalString,

    KAVENEGAR_API_KEY: optionalString,
    KAVENEGAR_OTP_TEMPLATE: optionalString,
    KAVENEGAR_ORDER_SUCCESS_TEMPLATE: optionalString,
    KAVENEGAR_ORDER_SHIPPED_TEMPLATE: optionalString,
  })
  .superRefine((data, ctx) => {
    if (!isProduction) return;

    const siteUrl = data.NEXT_PUBLIC_SITE_URL ?? data.AUTH_URL;
    if (!siteUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_SITE_URL"],
        message:
          "Set NEXT_PUBLIC_SITE_URL or AUTH_URL to the public site origin in production",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function formatEnvErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
}

function loadEnv(): Env {
  if (skipValidation) {
    return envSchema.partial().parse(process.env) as Env;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = formatEnvErrors(parsed.error);
    console.error(`Invalid environment variables:\n${details}`);
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return parsed.data;
}

/** Validated server env. Import only from server code / instrumentation. */
export const env = loadEnv();

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value as NonNullable<Env[K]>;
}

export function getSiteUrlFromEnv(): string {
  const url =
    env.NEXT_PUBLIC_SITE_URL ?? env.AUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function hasS3ConfigFromEnv(): boolean {
  return Boolean(
    env.ARVAN_ENDPOINT &&
      env.ARVAN_ACCESS_KEY &&
      env.ARVAN_SECRET_KEY &&
      env.ARVAN_BUCKET,
  );
}

export function hasCaptchaConfig(): boolean {
  return Boolean(env.CAPTCHA_SECRET_KEY);
}

export function hasKavenegarConfig(): boolean {
  return Boolean(env.KAVENEGAR_API_KEY);
}

/** Warn once when production uploads would hit ephemeral local disk. */
let warnedMissingS3 = false;
export function warnIfProductionLocalUploads(): void {
  if (warnedMissingS3) return;
  if (env.NODE_ENV !== "production") return;
  if (hasS3ConfigFromEnv()) return;

  warnedMissingS3 = true;
  console.warn(
    "Production uploads are falling back to local ephemeral storage. Set ARVAN_* environment variables to prevent data loss.",
  );
}
