import { createHmac, timingSafeEqual } from "crypto";

import { CredentialsSignin } from "next-auth";

import { env } from "@core/env";

export const CAPTCHA_ERROR_MESSAGE = "لطفاً تایید کنید که ربات نیستید.";

export class CaptchaSigninError extends CredentialsSignin {
  code = "captcha";
}

type CaptchaProvider = "turnstile" | "recaptcha";

const VERIFY_URLS: Record<CaptchaProvider, string> = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  recaptcha: "https://www.google.com/recaptcha/api/siteverify",
};

function getCaptchaSecret(): string | undefined {
  return env.CAPTCHA_SECRET_KEY;
}

function getCaptchaProvider(): CaptchaProvider {
  return env.CAPTCHA_PROVIDER === "recaptcha" ? "recaptcha" : "turnstile";
}

export function getCaptchaSiteKey(): string | undefined {
  return env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
}

export function isCaptchaEnabled(): boolean {
  return Boolean(getCaptchaSecret());
}

/**
 * Verify a CAPTCHA token. When `CAPTCHA_SECRET_KEY` is missing, allows the request.
 */
export async function verifyCaptchaToken(
  token: string | undefined | null,
): Promise<void> {
  const secret = getCaptchaSecret();
  if (!secret) {
    console.warn("CAPTCHA bypassed: No secret key");
    return;
  }

  if (!token?.trim()) {
    throw new Error(CAPTCHA_ERROR_MESSAGE);
  }

  const provider = getCaptchaProvider();
  const response = await fetch(VERIFY_URLS[provider], {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(CAPTCHA_ERROR_MESSAGE);
  }

  const data = (await response.json()) as { success?: boolean };
  if (!data.success) {
    throw new Error(CAPTCHA_ERROR_MESSAGE);
  }
}

/** One-time HMAC proof so signup can auto-login after CAPTCHA was already consumed. */
export function createCaptchaBypassProof(subject: string): string {
  const authSecret = env.AUTH_SECRET;
  if (!authSecret) return "";
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", authSecret)
    .update(`captcha-bypass:${subject}:${ts}`)
    .digest("hex");
  return `${ts}.${sig}`;
}

export function verifyCaptchaBypassProof(
  subject: string,
  proof: string | undefined | null,
): boolean {
  const authSecret = env.AUTH_SECRET;
  if (!authSecret || !proof) return false;

  const [ts, sig] = proof.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(ts));
  if (age > 60) return false;

  const expected = createHmac("sha256", authSecret)
    .update(`captcha-bypass:${subject}:${ts}`)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(sig, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function assertCaptchaForAuthorize(input: {
  captchaToken?: string | null;
  captchaBypass?: string | null;
  bypassSubject?: string | null;
}): Promise<void> {
  const secret = getCaptchaSecret();
  if (!secret) {
    console.warn("CAPTCHA bypassed: No secret key");
    return;
  }

  if (
    input.bypassSubject &&
    verifyCaptchaBypassProof(input.bypassSubject, input.captchaBypass)
  ) {
    return;
  }

  try {
    await verifyCaptchaToken(input.captchaToken);
  } catch {
    throw new CaptchaSigninError();
  }
}

export function isCaptchaAuthError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: string; cause?: unknown };
  if (e.code === "captcha") return true;
  if (typeof e.cause === "object" && e.cause !== null && "code" in e.cause) {
    return (e.cause as { code?: string }).code === "captcha";
  }
  return false;
}
