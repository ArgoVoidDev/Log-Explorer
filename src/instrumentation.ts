/**
 * Runs once when the Node server starts (and during `next build` Node phase).
 * Validates env via Zod so misconfigured deploys fail fast.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@core/env");
  }
}
