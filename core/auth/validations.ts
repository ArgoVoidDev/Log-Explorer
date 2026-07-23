import { z } from "zod";

export const credentialsSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
  captchaToken: z.string().optional(),
  captchaBypass: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6).regex(/^\d{6}$/),
});

export const otpCredentialsSchema = verifyOtpSchema.extend({
  captchaToken: z.string().optional(),
});
