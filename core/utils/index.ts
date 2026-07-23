/**
 * ArgoCore shared server utilities — caching, revalidation, bundle helpers.
 *
 * Caching / revalidation are server-only (`import "server-only"`).
 * Bundle helpers are safe from Server Components that load client islands.
 */

export {
  RevalidateWindows,
  cachedQuery,
  createCachedQuery,
  createCachedByKey,
  type CachedQueryOptions,
} from "./cache";

export {
  revalidateTags,
  revalidatePaths,
  revalidateCache,
} from "./revalidate";

export { clientIsland, TREE_SHAKE_PACKAGES } from "./bundle";
