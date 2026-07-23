import {
  filterProducts,
  getShopProducts,
  listCategories,
  parseShopSearchParams,
  ShopPageClient,
} from "@modules/ecommerce";

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseShopSearchParams(params);

  // Legacy ?category= / ?anime= → canonical /shop/category/{slug}
  const legacySlug =
    typeof params.category === "string"
      ? params.category
      : typeof params.anime === "string"
        ? params.anime
        : null;

  const resolvedFilters = legacySlug
    ? { ...filters, categorySlug: legacySlug }
    : filters;

  const products = filterProducts(
    await getShopProducts(),
    resolvedFilters,
  );

  return (
    <ShopPageClient
      products={products}
      filters={resolvedFilters}
      categories={listCategories()}
      title="گالری آثار"
      legacyCategoryRedirect={Boolean(legacySlug)}
    />
  );
}
