import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Invalidate one or more Data Cache tags.
 * Call from Server Actions / Route Handlers after mutations.
 */
export function revalidateTags(...tags: string[]): void {
  for (const tag of tags) {
    if (tag) revalidateTag(tag);
  }
}

/**
 * Invalidate App Router paths (page cache).
 * `type` defaults to `"page"`; use `"layout"` when a shared layout must refresh.
 */
export function revalidatePaths(
  paths: string | string[],
  type?: "page" | "layout",
): void {
  const list = Array.isArray(paths) ? paths : [paths];
  for (const path of list) {
    if (path) revalidatePath(path, type);
  }
}

/** Tag + path invalidation in one call (common mutation pattern). */
export function revalidateCache(opts: {
  tags?: string[];
  paths?: string[];
  pathType?: "page" | "layout";
}): void {
  if (opts.tags?.length) revalidateTags(...opts.tags);
  if (opts.paths?.length) revalidatePaths(opts.paths, opts.pathType);
}
