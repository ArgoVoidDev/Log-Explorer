/**
 * Client-bundle optimization helpers.
 *
 * Prefer Server Components by default. Reach for these only when a true
 * interactive island is required (`"use client"`).
 */

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

type IslandLoader<P> = () => Promise<{ default: ComponentType<P> }>;

type ClientIslandOptions = {
  /** Optional loading placeholder (keeps LCP calm for below-fold islands). */
  loading?: () => ReactNode;
  /**
   * When false, skip SSR for the island (modals, theme toggles, cart drawers).
   * Default true — SSR the island shell when possible for better FCP.
   */
  ssr?: boolean;
};

/**
 * Lazy-load a Client Component island from a Server Component parent.
 * Keeps heavy interactive code out of the initial JS for the route.
 *
 * @example
 * ```tsx
 * // page.tsx (Server Component)
 * const ProductFilters = clientIsland(
 *   () => import("./product-filters"),
 *   { loading: () => <FiltersSkeleton /> },
 * );
 * ```
 */
export function clientIsland<P extends object>(
  loader: IslandLoader<P>,
  options: ClientIslandOptions = {},
): ComponentType<P> {
  return dynamic(loader, {
    loading: options.loading,
    ssr: options.ssr ?? true,
  }) as ComponentType<P>;
}

/**
 * Packages that should be imported via named/tree-shakeable paths.
 * Keep in sync with `optimizePackageImports` in `next.config.ts`.
 */
export const TREE_SHAKE_PACKAGES = [
  "lucide-react",
  "@base-ui/react",
] as const;
