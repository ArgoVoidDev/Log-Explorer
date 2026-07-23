/**
 * Edge middleware matcher (Next.js Edge Runtime).
 * Coarse auth gates only — fine-grained RBAC runs in Node (layout + actions).
 * Wired from `src/middleware.ts`.
 *
 * Excludes static assets and Next internals so the edge bundle stays lean.
 */
export const authMiddlewareConfig = {
  matcher: [
    /*
     * Match protected app routes; skip `_next`, static files, and public assets.
     * Auth API stays outside so NextAuth callbacks are never blocked.
     */
    "/admin/:path*",
    "/account/:path*",
    "/dashboard/:path*",
    "/checkout",
    "/orders/:path*",
  ],
};
