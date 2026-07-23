/**
 * Generic schema.org JSON-LD builders.
 * Modules compose these; no ecommerce/saas/portfolio domain fields hard-coded.
 */

import { absoluteUrl, getSiteUrl } from "./url";

/** Opaque schema.org document (single node or `@graph`). */
export type JsonLdData = Record<string, unknown>;

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type OrganizationJsonLdInput = {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
};

export type WebSiteJsonLdInput = {
  name: string;
  url?: string;
  description?: string;
  /** Optional SearchAction target template with `{search_term_string}`. */
  searchUrlTemplate?: string;
};

export type ProductJsonLdInput = {
  name: string;
  description?: string;
  path: string;
  images?: string[];
  sku?: string;
  brand?: string;
  price?: number;
  priceCurrency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
};

export type CreativeWorkJsonLdInput = {
  name: string;
  description?: string;
  path: string;
  images?: string[];
  datePublished?: string;
  authorName?: string;
};

function absImages(images?: string[]): string[] | undefined {
  if (!images?.length) return undefined;
  return images.map((img) =>
    img.startsWith("http://") || img.startsWith("https://")
      ? img
      : absoluteUrl(img),
  );
}

export function buildOrganizationJsonLd(
  input: OrganizationJsonLdInput,
): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url ?? getSiteUrl(),
    ...(input.logo ? { logo: absoluteUrl(input.logo) } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

export function buildWebSiteJsonLd(input: WebSiteJsonLdInput): JsonLdData {
  const url = input.url ?? getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url,
    ...(input.description ? { description: input.description } : {}),
    ...(input.searchUrlTemplate
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: absoluteUrl(input.searchUrlTemplate),
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Generic schema.org Product — modules map their DTOs into this shape. */
export function buildProductJsonLd(input: ProductJsonLdInput): JsonLdData {
  const images = absImages(input.images);
  const availability = input.availability
    ? `https://schema.org/${input.availability}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    url: absoluteUrl(input.path),
    ...(input.description ? { description: input.description } : {}),
    ...(images ? { image: images } : {}),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.brand
      ? { brand: { "@type": "Brand", name: input.brand } }
      : {}),
    ...(input.price != null
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(input.path),
            priceCurrency: input.priceCurrency ?? "IRR",
            price: input.price,
            ...(availability ? { availability } : {}),
          },
        }
      : {}),
  };
}

/** Portfolio / case-study style CreativeWork. */
export function buildCreativeWorkJsonLd(
  input: CreativeWorkJsonLdInput,
): JsonLdData {
  const images = absImages(input.images);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    url: absoluteUrl(input.path),
    ...(input.description ? { description: input.description } : {}),
    ...(images ? { image: images } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName } }
      : {}),
  };
}

/** Merge multiple graphs into one `@graph` document (single script tag). */
export function buildJsonLdGraph(...nodes: JsonLdData[]): JsonLdData {
  const cleaned = nodes.filter(Boolean);
  if (cleaned.length === 1) return cleaned[0]!;
  return {
    "@context": "https://schema.org",
    "@graph": cleaned.map(({ "@context": _ctx, ...rest }) => rest),
  };
}
