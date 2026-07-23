import { JsonLd } from "@core/seo";
import { notFound } from "next/navigation";

import {
  CatalogProductDetail,
  buildCatalogProductJsonLd,
  buildCatalogProductMetadata,
  getCatalogBySlug,
  listCatalogProducts,
} from "@modules/ecommerce";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const products = await listCatalogProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.warn(
      "[shop/[slug]] generateStaticParams skipped (database unavailable):",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogBySlug(slug);
  if (!product) return { title: "محصول" };
  return buildCatalogProductMetadata(product);
}

export default async function CatalogProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd
        id={`product-${product.slug}`}
        data={buildCatalogProductJsonLd(product)}
      />
      <CatalogProductDetail product={product} />
    </>
  );
}
