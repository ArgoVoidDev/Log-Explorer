import bcrypt from "bcryptjs";
import {
  db,
  pgPool,
  UserRole,
  DiscountType,
} from "@core/database";
import { hasAnyStock } from "@modules/ecommerce/lib/inventory";

const BCRYPT_COST = 12;

async function seedAdminUser() {
  const phone = process.env.SEED_ADMIN_PHONE ?? "09120000000";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  await db.user.upsert({
    where: { phone },
    update: {
      name: "Admin",
      email: "admin@argocore.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name: "Admin",
      phone,
      email: "admin@argocore.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

const categories = [
  { id: "cat-naruto", slug: "naruto", nameFa: "ناروتو", filterKey: "naruto" },
  { id: "cat-jjk", slug: "jjk", nameFa: "جوجوتسو کایسن", filterKey: "jjk" },
  { id: "cat-berserk", slug: "berserk", nameFa: "برزرک", filterKey: "berserk" },
  { id: "cat-gaming", slug: "gaming", nameFa: "گیمینگ", filterKey: "gaming" },
] as const;

const shoeModels = [
  { id: "shoe-af1-low", slug: "af1-low", labelFa: "AF1 Low", sortOrder: 0 },
  { id: "shoe-af1-high", slug: "af1-high", labelFa: "AF1 High", sortOrder: 1 },
  {
    id: "shoe-jordan-1-mid",
    slug: "jordan-1-mid",
    labelFa: "Jordan 1 Mid",
    sortOrder: 2,
  },
] as const;

const colors = [
  { id: "color-white", slug: "white", labelFa: "سفید", sortOrder: 0 },
  { id: "color-black", slug: "black", labelFa: "مشکی", sortOrder: 1 },
] as const;

type CatalogSeed = {
  id: string;
  slug: string;
  title: string;
  price: number;
  animeSeries: string;
  categoryId: string;
  shoeModelId: string;
  colorId: string;
  sizes: number[];
  sizeInventory: { size: number; quantity: number }[];
  images: string[];
};

const catalogSeed: CatalogSeed[] = [
  {
    id: "cat-1",
    slug: "naruto-orange-af1",
    title: "ناروتو — نارنجی کلاسیک",
    price: 4_850_000,
    animeSeries: "naruto",
    categoryId: "cat-naruto",
    shoeModelId: "shoe-af1-low",
    colorId: "color-white",
    sizes: [40, 41, 42, 43, 44],
    sizeInventory: [
      { size: 40, quantity: 1 },
      { size: 41, quantity: 2 },
      { size: 42, quantity: 0 },
      { size: 43, quantity: 1 },
      { size: 44, quantity: 0 },
    ],
    images: ["/images/products/naruto-orange.webp"],
  },
  {
    id: "cat-2",
    slug: "jjk-gojo-high",
    title: "جوجوتسو — گوجو",
    price: 5_200_000,
    animeSeries: "jjk",
    categoryId: "cat-jjk",
    shoeModelId: "shoe-af1-high",
    colorId: "color-black",
    sizes: [41, 42, 43, 44],
    sizeInventory: [
      { size: 41, quantity: 0 },
      { size: 42, quantity: 0 },
      { size: 43, quantity: 0 },
      { size: 44, quantity: 0 },
    ],
    images: ["/images/products/jjk-gojo.webp"],
  },
  {
    id: "cat-3",
    slug: "berserk-brand-jordan",
    title: "برزرک — نشان برند",
    price: 5_900_000,
    animeSeries: "berserk",
    categoryId: "cat-berserk",
    shoeModelId: "shoe-jordan-1-mid",
    colorId: "color-black",
    sizes: [42, 43, 44, 45],
    sizeInventory: [
      { size: 42, quantity: 1 },
      { size: 43, quantity: 1 },
      { size: 44, quantity: 2 },
      { size: 45, quantity: 1 },
    ],
    images: ["/images/products/berserk-brand.webp"],
  },
  {
    id: "cat-4",
    slug: "gaming-pixel-af1",
    title: "گیمینگ — پیکسل آرت",
    price: 4_200_000,
    animeSeries: "gaming",
    categoryId: "cat-gaming",
    shoeModelId: "shoe-af1-low",
    colorId: "color-white",
    sizes: [40, 41, 42, 43],
    sizeInventory: [
      { size: 40, quantity: 3 },
      { size: 41, quantity: 2 },
      { size: 42, quantity: 1 },
      { size: 43, quantity: 2 },
    ],
    images: ["/images/products/gaming-pixel.webp"],
  },
];

async function seedCatalog() {
  for (const c of categories) {
    await db.category.upsert({
      where: { id: c.id },
      update: { slug: c.slug, nameFa: c.nameFa, filterKey: c.filterKey },
      create: c,
    });
  }

  for (const m of shoeModels) {
    await db.shoeModelOption.upsert({
      where: { id: m.id },
      update: {
        slug: m.slug,
        labelFa: m.labelFa,
        sortOrder: m.sortOrder,
        active: true,
      },
      create: { ...m, active: true },
    });
  }

  for (const color of colors) {
    await db.baseColorOption.upsert({
      where: { id: color.id },
      update: {
        slug: color.slug,
        labelFa: color.labelFa,
        sortOrder: color.sortOrder,
        active: true,
      },
      create: { ...color, active: true },
    });
  }

  for (const product of catalogSeed) {
    const inStock = hasAnyStock(product.sizeInventory);
    await db.catalogProduct.upsert({
      where: { id: product.id },
      update: {
        slug: product.slug,
        title: product.title,
        price: product.price,
        inStock,
        baseShoeModelId: product.shoeModelId,
        baseColorId: product.colorId,
        animeSeries: product.animeSeries,
        categoryId: product.categoryId,
        sizes: product.sizes,
      },
      create: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        inStock,
        baseShoeModelId: product.shoeModelId,
        baseColorId: product.colorId,
        animeSeries: product.animeSeries,
        categoryId: product.categoryId,
        sizes: product.sizes,
      },
    });

    for (const row of product.sizeInventory) {
      await db.catalogProductSizeInventory.upsert({
        where: {
          catalogProductId_size: {
            catalogProductId: product.id,
            size: row.size,
          },
        },
        update: { quantity: row.quantity },
        create: {
          catalogProductId: product.id,
          size: row.size,
          quantity: row.quantity,
        },
      });
    }

    await db.productImage.deleteMany({
      where: { catalogProductId: product.id },
    });
    for (const [i, url] of product.images.entries()) {
      await db.productImage.create({
        data: {
          catalogProductId: product.id,
          url,
          sortOrder: i,
        },
      });
    }
  }
}

async function seedSettingsAndCoupon() {
  await db.storeSetting.upsert({
    where: { key: "shippingCost" },
    update: { value: "150000" },
    create: { key: "shippingCost", value: "150000" },
  });

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {
      discountType: DiscountType.PERCENT,
      value: 10,
      minOrderAmount: 1_000_000,
      maxUses: 100,
      active: true,
    },
    create: {
      code: "WELCOME10",
      discountType: DiscountType.PERCENT,
      value: 10,
      minOrderAmount: 1_000_000,
      maxUses: 100,
      active: true,
    },
  });
}

async function main() {
  await seedAdminUser();
  await seedCatalog();
  await seedSettingsAndCoupon();
  console.log("ArgoCore seed: core users + ecommerce catalog ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pgPool.end();
  });
