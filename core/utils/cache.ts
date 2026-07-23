import "server-only";

import { unstable_cache } from "next/cache";

/** Shared revalidate windows (seconds) — modules pick per-read. */
export const RevalidateWindows = {
  /** Shop grid / catalog PDP */
  short: 60,
  /** Showcase, category, homepage */
  medium: 300,
  /** Sitemap / rarely changing */
  long: 3600,
} as const;

export type CachedQueryOptions = {
  /** Unique key segments (plus tags) for the Data Cache entry. */
  key: string[];
  /** Cache tags for `revalidateTag` invalidation. */
  tags: string[];
  /**
   * Seconds until background revalidation.
   * `false` = tag-only (no time-based revalidate).
   * Default: `RevalidateWindows.medium`.
   */
  revalidate?: number | false;
};

/**
 * Wrap a server read with Next.js Data Cache (`unstable_cache`).
 * Safe for repositories / data loaders — never import from Client Components.
 *
 * @example
 * ```ts
 * export const getShopProducts = () =>
 *   cachedQuery(
 *     () => listUnifiedProducts(),
 *     { key: ["shop", "products"], tags: ["shop", "products"], revalidate: 60 },
 *   );
 * ```
 */
export function cachedQuery<T>(
  fn: () => Promise<T>,
  options: CachedQueryOptions,
): Promise<T> {
  const revalidate =
    options.revalidate === undefined
      ? RevalidateWindows.medium
      : options.revalidate;

  return unstable_cache(fn, options.key, {
    tags: options.tags,
    ...(revalidate === false ? {} : { revalidate }),
  })();
}

/**
 * Factory that returns a stable cached loader (same key/tags every call).
 * Prefer when the loader takes no runtime args.
 */
export function createCachedQuery<T>(
  fn: () => Promise<T>,
  options: CachedQueryOptions,
): () => Promise<T> {
  const cached = unstable_cache(fn, options.key, {
    tags: options.tags,
    ...(options.revalidate === false
      ? {}
      : {
          revalidate:
            options.revalidate === undefined
              ? RevalidateWindows.medium
              : options.revalidate,
        }),
  });
  return () => cached();
}

/**
 * Cached loader with a single string/number argument folded into the cache key.
 * `tags` may be static or derived from the argument (e.g. `product:${slug}`).
 */
export function createCachedByKey<TArg extends string | number, T>(
  fn: (arg: TArg) => Promise<T>,
  options: {
    /** Prefix segments; arg is appended automatically. */
    keyPrefix: string[];
    tags: string[] | ((arg: TArg) => string[]);
    revalidate?: number | false;
  },
): (arg: TArg) => Promise<T> {
  return (arg: TArg) =>
    cachedQuery(() => fn(arg), {
      key: [...options.keyPrefix, String(arg)],
      tags:
        typeof options.tags === "function" ? options.tags(arg) : options.tags,
      revalidate: options.revalidate,
    });
}
