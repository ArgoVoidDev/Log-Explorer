/**
 * ArgoCore SEO — metadata builders + generic JSON-LD injection.
 * Server-first: use from layouts/pages (Server Components) only.
 */

export {
  getSiteUrl,
  absoluteUrl,
  canonicalPath,
} from "./url";

export {
  buildPageMetadata,
  buildRootMetadata,
  type PageMetadataInput,
  type RootMetadataInput,
} from "./metadata";

export {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildCreativeWorkJsonLd,
  buildJsonLdGraph,
  type JsonLdData,
  type BreadcrumbItem,
  type OrganizationJsonLdInput,
  type WebSiteJsonLdInput,
  type ProductJsonLdInput,
  type CreativeWorkJsonLdInput,
} from "./schema";

export { JsonLd } from "./json-ld";
