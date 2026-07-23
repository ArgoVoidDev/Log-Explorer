import { headers } from "next/headers";

/** Best-effort client IP for rate limiting (proxy-aware). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  const realIp =
    h.get("cf-connecting-ip")?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-client-ip")?.trim();

  if (realIp) return realIp.slice(0, 64);
  return "unknown";
}
