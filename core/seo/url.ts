/** Absolute site URL helpers for metadata, canonicals, and JSON-LD. */

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

/** Join site origin with a path (`/shop/foo` or `shop/foo`). */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Normalize a path for `alternates.canonical` (always leading `/`). */
export function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}
