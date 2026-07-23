/**
 * Built-in upload prefixes (no server deps — safe for client imports).
 * Ecommerce: products / showcases / custom-orders / homepage.
 * Portfolio: gallery. Shared: avatars.
 */
export const MediaPrefixes = {
  AVATARS: "avatars",
  CUSTOM_ORDERS: "custom-orders",
  PRODUCTS: "products",
  SHOWCASES: "showcases",
  HOMEPAGE: "homepage",
  GALLERY: "gallery",
} as const;

export type BuiltInMediaPrefix =
  (typeof MediaPrefixes)[keyof typeof MediaPrefixes];

/** Any registered prefix string (built-in or module-registered). */
export type MediaPrefix = BuiltInMediaPrefix | (string & {});
