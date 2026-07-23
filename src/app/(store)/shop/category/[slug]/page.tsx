import { buildPageMetadata } from "@core/seo";
import { notFound } from "next/navigation";

import {
  filterProducts,
  getCategoryBySlug,
  getShopProducts,
  listCategories,
  parseShopSearchParams,
  ShopPageClient,
  storeConfig,
} from "@modules/ecommerce";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return listCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "گالری آثار" };

  return buildPageMetadata({
    title: category.nameFa,
    description: `آثار دسته ${category.nameFa}`,
    path: `/shop/category/${slug}`,
    siteName: storeConfig.name,
  });
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const query = await searchParams;
  const filters = parseShopSearchParams(query, category.slug);
  const products = filterProducts(
    await getShopProducts(),
    filters,
    category.filterKey,
  );

  return (
    <ShopPageClient
      products={products}
      filters={filters}
      categories={listCategories()}
      title={category.nameFa}
      description={`آثار دسته ${category.nameFa}`}
    />
  );
}
