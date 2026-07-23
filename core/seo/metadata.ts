import type { Metadata } from "next";

import { absoluteUrl, canonicalPath, getSiteUrl } from "./url";

export type PageMetadataInput = {
  title: string;
  description?: string;
  /** Path for canonical + OG URL (e.g. `/shop/foo`). */
  path?: string;
  /** Absolute or site-relative image URL for OG/Twitter. */
  image?: string;
  /** Override default site name used in OG. */
  siteName?: string;
  /** `noindex` for private surfaces (cart, account, admin). */
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
};

function resolveImage(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return absoluteUrl(image);
}

/**
 * Generic Next.js `Metadata` builder (title, description, canonical, OG/Twitter).
 * Domain modules pass entity fields; core stays schema-agnostic.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description?.trim() || undefined;
  const canonical = input.path ? canonicalPath(input.path) : undefined;
  const image = resolveImage(input.image);
  const ogUrl = canonical ? absoluteUrl(canonical) : undefined;

  return {
    title: input.title,
    description,
    ...(canonical
      ? { alternates: { canonical } }
      : {}),
    ...(input.noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
    openGraph: {
      title: input.title,
      description,
      type: input.type ?? "website",
      url: ogUrl,
      siteName: input.siteName,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export type RootMetadataInput = {
  name: string;
  description: string;
  /** Title template; default `%s · {name}`. */
  titleTemplate?: string;
  locale?: string;
};

/** Root layout metadata with `metadataBase` for absolute OG URLs. */
export function buildRootMetadata(input: RootMetadataInput): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: input.name,
      template: input.titleTemplate ?? `%s · ${input.name}`,
    },
    description: input.description,
    openGraph: {
      type: "website",
      siteName: input.name,
      locale: input.locale,
    },
  };
}
