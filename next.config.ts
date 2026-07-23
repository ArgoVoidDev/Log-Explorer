import type { NextConfig } from "next";

/**
 * Production Next.js config — security headers, image domains, redirects.
 * Edge middleware matcher lives in `src/middleware.ts` (@core/auth).
 */

function arvanCdnHostname(): string | undefined {
  const raw = process.env.ARVAN_CDN_DOMAIN?.trim();
  if (!raw) return undefined;
  try {
    const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(withProtocol).hostname;
  } catch {
    return undefined;
  }
}

const cdnHost = arvanCdnHostname();
const isProd = process.env.NODE_ENV === "production";

/** OWASP-oriented baseline; CSP left permissive enough for Next + Turnstile. */
const securityHeaders: { key: string; value: string }[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
      "frame-src 'self' https://challenges.cloudflare.com https://www.google.com",
      "connect-src 'self' https: wss:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

if (isProd) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(cdnHost
        ? [
            {
              protocol: "https" as const,
              hostname: cdnHost,
            },
          ]
        : []),
    ],
  },

  /**
   * Tree-shake barrel imports (lucide, Base UI) so client islands stay small.
   * Keep in sync with `TREE_SHAKE_PACKAGES` in `@core/utils/bundle`.
   */
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/login",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/home",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/signin",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/sign-in",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/signup",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
