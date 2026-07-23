import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

export { authMiddlewareConfig } from "./middleware-config";

const { auth } = NextAuth(authConfig);

/**
 * Auth gate + forward pathname so layouts can enforce section RBAC
 * on every nested route (including direct URL access).
 *
 * Wire in `src/middleware.ts`:
 * ```ts
 * export { default, config } from "@core/auth/middleware";
 * // or:
 * import authMiddleware, { authMiddlewareConfig } from "@core/auth/middleware";
 * export default authMiddleware;
 * export const config = authMiddlewareConfig;
 * ```
 */
export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});
