-- CreateEnum
CREATE TYPE "CatalogOrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFa" TEXT NOT NULL,
    "filterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoeModelOption" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "labelFa" TEXT NOT NULL,
    "labelEn" TEXT,
    "previewImage" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShoeModelOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseColorOption" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "labelFa" TEXT NOT NULL,
    "labelEn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BaseColorOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "baseShoeModelId" TEXT NOT NULL,
    "baseColorId" TEXT NOT NULL,
    "animeSeries" TEXT,
    "categoryId" TEXT NOT NULL,
    "sizes" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProductSizeInventory" (
    "id" TEXT NOT NULL,
    "catalogProductId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CatalogProductSizeInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "catalogProductId" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrderAmount" INTEGER,
    "maxUses" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CatalogOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "subtotal" INTEGER NOT NULL,
    "shippingCost" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingCity" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "trackingCode" TEXT,
    "couponId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,

    CONSTRAINT "CatalogOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authority" TEXT,
    "refId" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShoeModelOption_slug_key" ON "ShoeModelOption"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BaseColorOption_slug_key" ON "BaseColorOption"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProduct_slug_key" ON "CatalogProduct"("slug");

-- CreateIndex
CREATE INDEX "CatalogProduct_animeSeries_idx" ON "CatalogProduct"("animeSeries");

-- CreateIndex
CREATE INDEX "CatalogProduct_categoryId_idx" ON "CatalogProduct"("categoryId");

-- CreateIndex
CREATE INDEX "CatalogProduct_inStock_idx" ON "CatalogProduct"("inStock");

-- CreateIndex
CREATE INDEX "CatalogProduct_baseShoeModelId_idx" ON "CatalogProduct"("baseShoeModelId");

-- CreateIndex
CREATE INDEX "CatalogProduct_baseColorId_idx" ON "CatalogProduct"("baseColorId");

-- CreateIndex
CREATE INDEX "CatalogProductSizeInventory_catalogProductId_idx" ON "CatalogProductSizeInventory"("catalogProductId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogProductSizeInventory_catalogProductId_size_key" ON "CatalogProductSizeInventory"("catalogProductId", "size");

-- CreateIndex
CREATE INDEX "ProductImage_catalogProductId_idx" ON "ProductImage"("catalogProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_orderId_key" ON "CouponUsage"("orderId");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_couponId_userId_key" ON "CouponUsage"("couponId", "userId");

-- CreateIndex
CREATE INDEX "CatalogOrder_userId_idx" ON "CatalogOrder"("userId");

-- CreateIndex
CREATE INDEX "CatalogOrder_status_idx" ON "CatalogOrder"("status");

-- CreateIndex
CREATE INDEX "CatalogOrder_couponId_idx" ON "CatalogOrder"("couponId");

-- CreateIndex
CREATE INDEX "CatalogOrderItem_orderId_idx" ON "CatalogOrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_authority_key" ON "Payment"("authority");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSetting_key_key" ON "StoreSetting"("key");

-- CreateIndex
CREATE INDEX "SavedAddress_userId_idx" ON "SavedAddress"("userId");

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_baseShoeModelId_fkey" FOREIGN KEY ("baseShoeModelId") REFERENCES "ShoeModelOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogProduct" ADD CONSTRAINT "CatalogProduct_baseColorId_fkey" FOREIGN KEY ("baseColorId") REFERENCES "BaseColorOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogProductSizeInventory" ADD CONSTRAINT "CatalogProductSizeInventory_catalogProductId_fkey" FOREIGN KEY ("catalogProductId") REFERENCES "CatalogProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_catalogProductId_fkey" FOREIGN KEY ("catalogProductId") REFERENCES "CatalogProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CatalogOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogOrder" ADD CONSTRAINT "CatalogOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogOrder" ADD CONSTRAINT "CatalogOrder_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogOrderItem" ADD CONSTRAINT "CatalogOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CatalogOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogOrderItem" ADD CONSTRAINT "CatalogOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CatalogProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CatalogOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
