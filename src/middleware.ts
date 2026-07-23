import authMiddleware from "@core/auth/middleware";

/**
 * Edge middleware entry — auth gates + `x-pathname` forwarding.
 * Security headers / redirects: `next.config.ts` + `vercel.json`.
 *
 * Matcher must be an inline object literal (Next.js static analysis).
 * Keep in sync with `@core/auth/middleware-config`.
 */
export default authMiddleware;

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/dashboard/:path*",
    "/checkout",
    "/orders/:path*",
  ],
};
