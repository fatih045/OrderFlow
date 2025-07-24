-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED', 'ORDER_CANCELLED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shortCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "expeditionType" TEXT NOT NULL DEFAULT 'pickup',
    "preOrder" BOOLEAN NOT NULL DEFAULT false,
    "test" BOOLEAN NOT NULL DEFAULT false,
    "customerComment" TEXT,
    "vendorComment" TEXT,
    "extraParameters" JSONB,
    "customerId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "platformRestaurantId" TEXT,
    "localInfo" JSONB,
    "paymentStatus" TEXT,
    "paymentType" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobilePhone" TEXT,
    "flags" JSONB,
    "code" TEXT,
    "platformCustomerId" TEXT,
    "mobilePhoneCountryCode" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "postcode" TEXT,
    "city" TEXT,
    "street" TEXT,
    "number" TEXT,
    "expectedDeliveryTime" TIMESTAMP(3),
    "riderPickupTime" TIMESTAMP(3),
    "expressDelivery" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryName" TEXT,
    "description" TEXT,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "platformId" TEXT,
    "remoteCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "variation" JSONB,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_products" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "paidPrice" DECIMAL(65,30) NOT NULL,
    "comment" TEXT,
    "itemUnavailabilityHandling" TEXT,
    "halfHalf" BOOLEAN NOT NULL DEFAULT false,
    "selectedChoices" JSONB,
    "vatPercentage" TEXT,
    "discountAmount" TEXT,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_toppings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "platformId" TEXT,
    "remoteCode" TEXT,
    "type" TEXT,
    "productId" TEXT,

    CONSTRAINT "product_toppings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_product_toppings" (
    "id" TEXT NOT NULL,
    "orderProductId" TEXT NOT NULL,
    "toppingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30) NOT NULL,
    "itemUnavailabilityHandling" TEXT,
    "children" JSONB,

    CONSTRAINT "order_product_toppings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_discounts" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "sponsorships" JSONB,

    CONSTRAINT "order_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_product_discounts" (
    "id" TEXT NOT NULL,
    "orderProductId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "sponsorships" JSONB,

    CONSTRAINT "order_product_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_product_topping_discounts" (
    "id" TEXT NOT NULL,
    "orderProductToppingId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "sponsorships" JSONB,

    CONSTRAINT "order_product_topping_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_prices" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "grandTotal" DECIMAL(65,30),
    "subTotal" DECIMAL(65,30),
    "totalNet" DECIMAL(65,30),
    "vatTotal" DECIMAL(65,30),
    "vatPercent" TEXT,
    "vatVisible" BOOLEAN NOT NULL DEFAULT true,
    "deliveryFee" DECIMAL(65,30),
    "serviceFeePercent" TEXT,
    "serviceFeeTotal" DECIMAL(65,30),
    "serviceTax" DECIMAL(65,30),
    "serviceTaxValue" DECIMAL(65,30),
    "riderTip" DECIMAL(65,30),
    "containerCharge" DECIMAL(65,30),
    "commission" DECIMAL(65,30),
    "payRestaurant" DECIMAL(65,30),
    "collectFromCustomer" DECIMAL(65,30),
    "discountAmountTotal" DECIMAL(65,30),
    "deliveryFeeDiscount" DECIMAL(65,30),
    "minimumDeliveryValue" DECIMAL(65,30),
    "differenceToMinimumDeliveryValue" DECIMAL(65,30),
    "deliveryFees" JSONB,

    CONSTRAINT "order_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_token_key" ON "orders"("token");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "order_prices_orderId_key" ON "order_prices"("orderId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_toppings" ADD CONSTRAINT "product_toppings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_toppings" ADD CONSTRAINT "order_product_toppings_orderProductId_fkey" FOREIGN KEY ("orderProductId") REFERENCES "order_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_toppings" ADD CONSTRAINT "order_product_toppings_toppingId_fkey" FOREIGN KEY ("toppingId") REFERENCES "product_toppings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_discounts" ADD CONSTRAINT "order_discounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_discounts" ADD CONSTRAINT "order_product_discounts_orderProductId_fkey" FOREIGN KEY ("orderProductId") REFERENCES "order_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_discounts" ADD CONSTRAINT "order_product_discounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_topping_discounts" ADD CONSTRAINT "order_product_topping_discounts_orderProductToppingId_fkey" FOREIGN KEY ("orderProductToppingId") REFERENCES "order_product_toppings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_product_topping_discounts" ADD CONSTRAINT "order_product_topping_discounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_prices" ADD CONSTRAINT "order_prices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
