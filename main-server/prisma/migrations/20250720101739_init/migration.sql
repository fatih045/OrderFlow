/*
  Warnings:

  - You are about to drop the column `platformCustomerId` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `postcode` on the `deliveries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `city` on the `deliveries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `street` on the `deliveries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `number` on the `deliveries` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `description` on the `discounts` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `localInfo` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `orders` table. All the data in the column will be lost.
  - You are about to alter the column `token` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(512)`.
  - You are about to alter the column `code` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `shortCode` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `variation` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `unitPrice` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the `order_discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_prices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_product_discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_product_topping_discounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_product_toppings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_toppings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `deliveries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[priceId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `corporateTaxId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localInfoId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPickUpTimestamp` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preparationTimeIntervals` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `expiryDate` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `expeditionType` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `platformRestaurantId` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `orderId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpeditionType" AS ENUM ('pickup', 'delivery');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid');

-- CreateEnum
CREATE TYPE "ItemUnavailabilityHandling" AS ENUM ('REMOVE', 'REDUCE_QUANTITY', 'CALL_CUSTOMER_AND_REPLACE', 'CANCEL_ORDER');

-- CreateEnum
CREATE TYPE "ToppingType" AS ENUM ('PRODUCT', 'VARIANT', 'EXTRA');

-- CreateEnum
CREATE TYPE "SponsorType" AS ENUM ('PLATFORM', 'VENDOR', 'THIRD_PARTY');

-- DropForeignKey
ALTER TABLE "order_discounts" DROP CONSTRAINT "order_discounts_discountId_fkey";

-- DropForeignKey
ALTER TABLE "order_discounts" DROP CONSTRAINT "order_discounts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_prices" DROP CONSTRAINT "order_prices_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_discounts" DROP CONSTRAINT "order_product_discounts_discountId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_discounts" DROP CONSTRAINT "order_product_discounts_orderProductId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_topping_discounts" DROP CONSTRAINT "order_product_topping_discounts_discountId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_topping_discounts" DROP CONSTRAINT "order_product_topping_discounts_orderProductToppingId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_toppings" DROP CONSTRAINT "order_product_toppings_orderProductId_fkey";

-- DropForeignKey
ALTER TABLE "order_product_toppings" DROP CONSTRAINT "order_product_toppings_toppingId_fkey";

-- DropForeignKey
ALTER TABLE "order_products" DROP CONSTRAINT "order_products_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_products" DROP CONSTRAINT "order_products_productId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_deliveryId_fkey";

-- DropForeignKey
ALTER TABLE "product_toppings" DROP CONSTRAINT "product_toppings_productId_fkey";

-- DropIndex
DROP INDEX "customers_email_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "platformCustomerId",
ADD COLUMN     "platformId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "building" VARCHAR(255),
ADD COLUMN     "company" VARCHAR(255),
ADD COLUMN     "deliveryArea" VARCHAR(255),
ADD COLUMN     "deliveryInstructions" VARCHAR(2048),
ADD COLUMN     "deliveryMainArea" VARCHAR(255),
ADD COLUMN     "entrance" VARCHAR(255),
ADD COLUMN     "flatNumber" VARCHAR(255),
ADD COLUMN     "floor" VARCHAR(255),
ADD COLUMN     "intercom" VARCHAR(255),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "orderId" TEXT NOT NULL,
ALTER COLUMN "postcode" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "street" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "number" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "description",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "toppingId" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "deliveryId",
DROP COLUMN "localInfo",
DROP COLUMN "paymentStatus",
DROP COLUMN "paymentType",
DROP COLUMN "status",
ADD COLUMN     "corporateOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "corporateTaxId" VARCHAR(512) NOT NULL,
ADD COLUMN     "integrationInfo" JSONB,
ADD COLUMN     "invoicingCarrierType" TEXT,
ADD COLUMN     "invoicingCarrierValue" TEXT,
ADD COLUMN     "localInfoId" TEXT NOT NULL,
ADD COLUMN     "maxPickUpTimestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "minPickupTimestamp" TIMESTAMP(3),
ADD COLUMN     "mobileOrder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "orderAcceptedUrl" TEXT,
ADD COLUMN     "orderPickedUpUrl" TEXT,
ADD COLUMN     "orderPreparationTimeAdjustmentUrl" TEXT,
ADD COLUMN     "orderPreparedUrl" TEXT,
ADD COLUMN     "orderProductModificationUrl" TEXT,
ADD COLUMN     "orderRejectedUrl" TEXT,
ADD COLUMN     "paymentId" TEXT NOT NULL,
ADD COLUMN     "preparationTimeIntervals" JSONB NOT NULL,
ADD COLUMN     "priceId" TEXT NOT NULL,
ADD COLUMN     "webOrder" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "token" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "shortCode" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "createdAt" DROP DEFAULT,
ALTER COLUMN "expiryDate" SET NOT NULL,
DROP COLUMN "expeditionType",
ADD COLUMN     "expeditionType" "ExpeditionType" NOT NULL,
ALTER COLUMN "platformRestaurantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isActive",
DROP COLUMN "variation",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "discountAmount" TEXT,
ADD COLUMN     "halfHalf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemUnavailabilityHandling" "ItemUnavailabilityHandling",
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "paidPrice" DECIMAL(10,2),
ADD COLUMN     "quantity" TEXT NOT NULL,
ADD COLUMN     "selectedChoices" JSONB,
ADD COLUMN     "variationName" TEXT,
ADD COLUMN     "vatPercentage" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "unitPrice" DROP NOT NULL,
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2);

-- DropTable
DROP TABLE "order_discounts";

-- DropTable
DROP TABLE "order_prices";

-- DropTable
DROP TABLE "order_product_discounts";

-- DropTable
DROP TABLE "order_product_topping_discounts";

-- DropTable
DROP TABLE "order_product_toppings";

-- DropTable
DROP TABLE "order_products";

-- DropTable
DROP TABLE "product_toppings";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "pickups" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pickupTime" TIMESTAMP(3),
    "pickupCode" TEXT,

    CONSTRAINT "pickups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "type" TEXT NOT NULL,
    "remoteCode" TEXT,
    "requiredMoneyChange" TEXT,
    "vatId" TEXT,
    "vatName" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "totalNet" DECIMAL(10,2) NOT NULL,
    "subTotal" DECIMAL(10,2),
    "vatTotal" DECIMAL(10,2) NOT NULL,
    "vatPercent" TEXT,
    "vatVisible" BOOLEAN NOT NULL DEFAULT true,
    "minimumDeliveryValue" DECIMAL(10,2),
    "differenceToMinimumDeliveryValue" DECIMAL(10,2),
    "payRestaurant" DECIMAL(10,2),
    "riderTip" DECIMAL(10,2),
    "collectFromCustomer" DECIMAL(10,2),
    "comission" DECIMAL(10,2),
    "containerCharge" DECIMAL(10,2),
    "deliveryFee" DECIMAL(10,2),
    "discountAmountTotal" DECIMAL(10,2),
    "deliveryFeeDiscount" DECIMAL(10,2),
    "serviceFeePercent" DECIMAL(5,2),
    "serviceFeeTotal" DECIMAL(10,2),
    "serviceTax" DECIMAL(10,2),
    "serviceTaxValue" DECIMAL(10,2),

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_info" (
    "id" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "currencySymbol" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformKey" TEXT NOT NULL,
    "currencySymbolPosition" TEXT,
    "currencySymbolSpaces" TEXT,
    "decimalDigits" TEXT,
    "decimalSeparator" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "thousandsSeparator" TEXT,
    "website" TEXT,

    CONSTRAINT "local_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_restaurants" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "platform_restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toppings" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "parentId" TEXT,
    "platformId" TEXT,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL,
    "remoteCode" TEXT,
    "type" "ToppingType",
    "itemUnavailabilityHandling" "ItemUnavailabilityHandling",

    CONSTRAINT "toppings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsorships" (
    "id" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "sponsor" "SponsorType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "sponsorships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_fees" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT,
    "value" DECIMAL(10,2),

    CONSTRAINT "delivery_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pickups_orderId_key" ON "pickups"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_restaurants_platformId_key" ON "platform_restaurants"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_orderId_key" ON "deliveries"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_paymentId_key" ON "orders"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_priceId_key" ON "orders"("priceId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_localInfoId_fkey" FOREIGN KEY ("localInfoId") REFERENCES "local_info"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_platformRestaurantId_fkey" FOREIGN KEY ("platformRestaurantId") REFERENCES "platform_restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toppings" ADD CONSTRAINT "toppings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toppings" ADD CONSTRAINT "toppings_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "toppings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_toppingId_fkey" FOREIGN KEY ("toppingId") REFERENCES "toppings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_fees" ADD CONSTRAINT "delivery_fees_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
