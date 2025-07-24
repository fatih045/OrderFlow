import { PrismaClient } from '@prisma/client';
import { Order } from "../types/order.types";

export interface TransformResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class OrderTransformer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Transform and save order to database
   */
  async transformAndSave(orderData: Order): Promise<TransformResult> {
    try {
      const transformedData = await this.transformOrder(orderData);

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        return await this.saveOrderWithRelations(tx, transformedData);
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Transform error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Transform order data to database format
   */
  private async transformOrder(order: Order) {
    return {
      // Main order data
      orderData: {
        token: order.token,
        code: order.code,
        shortCode: order.shortCode || null,
        createdAt: this.parseDate(order.createdAt) || new Date(),
        expiryDate: this.parseDate(order.expiryDate) || new Date(),
        expeditionType: this.transformExpeditionType(order.expeditionType),
        test: order.test || false,
        preOrder: order.preOrder || false,
        corporateOrder: false,
        mobileOrder: true,
        webOrder: false,
        corporateTaxId: order.corporateTaxId || '',
        customerComment: order.comments?.customerComment || null,
        vendorComment: null,
        extraParameters: order.extraParameters || null,
        integrationInfo: null,
        invoicingCarrierType: order.invoicingInformation?.carrierType || null,
        invoicingCarrierValue: order.invoicingInformation?.carrierValue || null,

        // Required fields with defaults
        maxPickUpTimestamp: order.PreparationTimeAdjustments?.maxPickUpTimestamp
            ? this.parseDate(order.PreparationTimeAdjustments.maxPickUpTimestamp)
            : new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        minPickupTimestamp: order.PreparationTimeAdjustments?.minPickUpTimestamp
            ? this.parseDate(order.PreparationTimeAdjustments.minPickUpTimestamp)
            : null,
        preparationTimeIntervals: order.PreparationTimeAdjustments?.preparationTimeChangeIntervalsInMinutes || [],

        // Callback URLs
        orderAcceptedUrl: order.callbackUrls?.orderAcceptedUrl || null,
        orderRejectedUrl: order.callbackUrls?.orderRejectedUrl || null,
        orderProductModificationUrl: order.callbackUrls?.orderProductModificationUrl || null,
        orderPickedUpUrl: order.callbackUrls?.orderPickedUpUrl || null,
        orderPreparedUrl: order.callbackUrls?.orderPreparedUrl || null,
        orderPreparationTimeAdjustmentUrl: order.callbackUrls?.orderPreparationTimeAdjustmentUrl || null,
      },

      // Customer data
      customer: this.transformCustomer(order.customer),

      // Payment data
      payment: this.transformPayment(order.payment),

      // Price data
      price: this.transformPrice(order.price),

      // Local info
      localInfo: this.transformLocalInfo(order.localInfo),

      // Platform restaurant
      platformRestaurant: {
        platformId: order.platformRestaurant.id,
      },

      // Delivery data (if exists)
      delivery: order.delivery ? this.transformDelivery(order.delivery) : null,

      // Pickup data (if exists)
      pickup: order.pickup ? this.transformPickup(order.pickup) : null,

      // Products
      products: order.products?.map(p => this.transformProduct(p)) || [],

      // Discounts
      discounts: order.discounts?.map(d => this.transformDiscount(d)) || [],

      // Delivery fees
      deliveryFees: order.price.deliveryFees?.map(df => ({
        name: df.name || null,
        value: this.parseDecimal(df.value),
      })) || [],
    };
  }

  private transformCustomer(customer: any) {
    if (!customer) {
      throw new Error('Customer information is required');
    }

    return {
      email: customer.email || null,
      firstName: customer.firstName || null,
      lastName: customer.lastName || null,
      mobilePhone: customer.mobilePhone || null,
      mobilePhoneCountryCode: customer.mobilePhoneCountryCode || null,
      code: customer.code || null,
      platformId: customer.platformId || null,
      flags: this.transformFlags(customer.flags),
    };
  }

  private transformFlags(flags: any): any {
    if (!flags) return null;
    if (Array.isArray(flags)) return flags;
    if (typeof flags === 'string') return [flags];
    return null;
  }

  private transformPayment(payment: any) {
    if (!payment) {
      throw new Error('Payment information is required');
    }

    return {
      status: this.transformPaymentStatus(payment.status),
      type: payment.type || 'unknown',
      remoteCode: payment.remoteCode || null,
      requiredMoneyChange: payment.requiredMoneyChange || null,
      vatId: payment.vatId || null,
      vatName: payment.vatName || null,
    };
  }

  private transformPaymentStatus(status: string): string {
    // Prisma enum values are lowercase
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'paid':
        return 'paid';
      case 'pending':
        return 'pending';
      default:
        return 'pending';
    }
  }

  private transformExpeditionType(type: string): string {
    // Prisma enum values are lowercase
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case 'pickup':
        return 'pickup';
      case 'delivery':
        return 'delivery';
      default:
        throw new Error(`Invalid expedition type: ${type}`);
    }
  }

  private transformPrice(price: any) {
    if (!price) {
      throw new Error('Price information is required');
    }

    return {
      grandTotal: this.parseDecimal(price.grandTotal) || 0,
      totalNet: this.parseDecimal(price.totalNet || price.subTotal) || 0,
      subTotal: this.parseDecimal(price.subTotal) || null,
      vatTotal: this.parseDecimal(price.vatTotal) || 0,
      vatPercent: price.vatPercent || null,
      vatVisible: price.vatVisible !== undefined ? price.vatVisible : true,

      minimumDeliveryValue: this.parseDecimal(price.minimumDeliveryValue) || null,
      differenceToMinimumDeliveryValue: this.parseDecimal(price.differenceToMinimumDeliveryValue) || null,

      payRestaurant: this.parseDecimal(price.payRestaurant) || null,
      riderTip: this.parseDecimal(price.riderTip) || null,
      collectFromCustomer: this.parseDecimal(price.collectFromCustomer) || null,

      comission: this.parseDecimal(price.comission) || null,
      containerCharge: this.parseDecimal(price.containerCharge) || null,
      deliveryFee: this.parseDecimal(price.deliveryFee) || null,
      discountAmountTotal: this.parseDecimal(price.discountAmountTotal) || null,
      deliveryFeeDiscount: this.parseDecimal(price.deliveryFeeDiscount) || null,

      serviceFeePercent: this.parseDecimal(price.serviceFeePercent) || null,
      serviceFeeTotal: this.parseDecimal(price.serviceFeeTotal) || null,
      serviceTax: this.parseDecimal(price.serviceTax) || null,
      serviceTaxValue: this.parseDecimal(price.serviceTaxValue) || null,
    };
  }

  private transformLocalInfo(localInfo: any) {
    if (!localInfo) {
      throw new Error('Local info is required');
    }

    return {
      countryCode: localInfo.countryCode,
      currencySymbol: localInfo.currencySymbol,
      platform: localInfo.platform,
      platformKey: localInfo.platformKey,
      currencySymbolPosition: localInfo.currencySymbolPosition || null,
      currencySymbolSpaces: localInfo.currencySymbolSpaces || null,
      decimalDigits: localInfo.decimalDigits || null,
      decimalSeparator: localInfo.decimalSeparator || null,
      email: localInfo.email || null,
      phone: localInfo.phone || null,
      thousandsSeparator: localInfo.thousandsSeparator || null,
      website: localInfo.website || null,
    };
  }

  private transformDelivery(delivery: any) {
    const address = delivery.address;
    return {
      expectedDeliveryTime: delivery.expectedDeliveryTime ? this.parseDate(delivery.expectedDeliveryTime) : null,
      expressDelivery: delivery.expressDelivery || false,
      riderPickupTime: delivery.riderPickupTime ? this.parseDate(delivery.riderPickupTime) : null,

      // Address fields
      building: address?.building || null,
      city: address?.city || null,
      company: address?.company || null,
      deliveryArea: address?.deliveryArea || null,
      deliveryInstructions: address?.deliveryInstructions || null,
      deliveryMainArea: address?.deliveryMainArea || null,
      entrance: address?.entrance || null,
      flatNumber: address?.flatNumber || null,
      floor: address?.floor || null,
      intercom: address?.intercom || null,
      latitude: address?.latitude || null,
      longitude: address?.longitude || null,
      number: address?.number || null,
      postcode: address?.postcode || null,
      street: address?.street || null,
    };
  }

  private transformPickup(pickup: any) {
    return {
      pickupTime: pickup.pickupTime ? this.parseDate(pickup.pickupTime) : null,
      pickupCode: pickup.pickupCode || null,
    };
  }

  private transformProduct(product: any) {
    return {
      platformId: product.id || null,
      categoryName: product.categoryName || null,
      name: product.name || null,
      description: product.description || null,
      paidPrice: this.parseDecimal(product.paidPrice) || null,
      unitPrice: this.parseDecimal(product.unitPrice) || null,
      quantity: product.quantity?.toString() || '1',
      remoteCode: product.remoteCode || null,
      comment: product.comment || null,
      discountAmount: product.discountAmount || null,
      halfHalf: product.halfHalf || false,
      vatPercentage: product.vatPercentage || null,
      itemUnavailabilityHandling: this.transformItemUnavailabilityHandling(product.itemUnavailabilityHandling),
      variationName: product.variation?.name || null,
      selectedChoices: product.selectedChoices || null,

      // Nested relations
      toppings: product.selectedToppings?.map((t: any) => this.transformTopping(t)) || [],
      discounts: product.discounts?.map((d: any) => this.transformDiscount(d)) || [],
    };
  }

  private transformTopping(topping: any): any {
    return {
      platformId: topping.id || null,
      name: topping.name,
      price: this.parseDecimal(topping.price) || 0,
      quantity: topping.quantity || 1,
      remoteCode: topping.remoteCode || null,
      type: this.transformToppingType(topping.type),
      itemUnavailabilityHandling: this.transformItemUnavailabilityHandling(topping.itemUnavailabilityHandling),

      // Nested toppings
      children: topping.children?.map((child: any) => this.transformTopping(child)) || [],
      discounts: topping.discounts?.map((d: any) => this.transformDiscount(d)) || [],
    };
  }

  private transformDiscount(discount: any) {
    return {
      name: discount.name || null,
      amount: this.parseDecimal(discount.amount) || 0,
      type: discount.type || null,
      sponsorships: discount.sponsorships?.map((s: any) => ({
        sponsor: this.transformSponsorType(s.sponsor),
        amount: this.parseDecimal(s.amount) || 0,
      })) || [],
    };
  }

  private transformItemUnavailabilityHandling(handling: string): string | null {
    if (!handling) return null;

    const normalized = handling.toUpperCase();
    const validValues = ['REMOVE', 'REDUCE_QUANTITY', 'CALL_CUSTOMER_AND_REPLACE', 'CANCEL_ORDER'];

    return validValues.includes(normalized) ? normalized : null;
  }

  private transformToppingType(type: string): string | null {
    if (!type) return null;

    const normalized = type.toUpperCase();
    const validValues = ['PRODUCT', 'VARIANT', 'EXTRA'];

    return validValues.includes(normalized) ? normalized : null;
  }

  private transformSponsorType(sponsor: string): string {
    const normalized = sponsor.toUpperCase();
    const validValues = ['PLATFORM', 'VENDOR', 'THIRD_PARTY'];

    return validValues.includes(normalized) ? normalized : 'PLATFORM';
  }

  /**
   * Safe date parsing
   */
  private parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}`);
        return null;
      }
      return date;
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  /**
   * Safe decimal parsing
   */
  private parseDecimal(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = parseFloat(value.toString());
    if (isNaN(parsed)) {
      console.warn(`Failed to parse decimal: ${value}`);
      return null;
    }

    return parsed;
  }

  /**
   * Save order with all relations using transaction
   */
  private async saveOrderWithRelations(tx: any, data: any) {
    // 1. Find or create customer
    let customer;
    if (data.customer.email) {
      customer = await tx.customer.findFirst({
        where: { email: data.customer.email }
      });
    }

    if (!customer) {
      customer = await tx.customer.create({
        data: data.customer,
      });
    } else {
      // Update existing customer with new data
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: data.customer,
      });
    }

    // 2. Create payment
    const payment = await tx.payment.create({
      data: data.payment,
    });

    // 3. Create price
    const price = await tx.price.create({
      data: data.price,
    });

    // 4. Find or create local info by ID (since platformKey is not unique)
    let localInfo = await tx.localInfo.findFirst({
      where: { platformKey: data.localInfo.platformKey }
    });

    if (!localInfo) {
      localInfo = await tx.localInfo.create({
        data: data.localInfo,
      });
    }

    // 5. Find or create platform restaurant
    let platformRestaurant = await tx.platformRestaurant.findFirst({
      where: { platformId: data.platformRestaurant.platformId }
    });

    if (!platformRestaurant) {
      platformRestaurant = await tx.platformRestaurant.create({
        data: data.platformRestaurant,
      });
    }

    // 6. Create main order
    const order = await tx.order.create({
      data: {
        ...data.orderData,
        customerId: customer.id,
        paymentId: payment.id,
        priceId: price.id,
        localInfoId: localInfo.id,
        platformRestaurantId: platformRestaurant.id,
      },
    });

    // 7. Create delivery if exists
    if (data.delivery) {
      await tx.delivery.create({
        data: {
          ...data.delivery,
          orderId: order.id,
        },
      });
    }

    // 8. Create pickup if exists
    if (data.pickup) {
      await tx.pickup.create({
        data: {
          ...data.pickup,
          orderId: order.id,
        },
      });
    }

    // 9. Create products with toppings
    for (const productData of data.products) {
      const { toppings, discounts, ...productFields } = productData;

      const product = await tx.product.create({
        data: {
          ...productFields,
          orderId: order.id,
        },
      });

      // Create toppings recursively
      if (toppings?.length > 0) {
        await this.createToppingsRecursively(tx, toppings, product.id);
      }

      // Create product discounts
      if (discounts?.length > 0) {
        await this.createDiscountsWithSponsorships(tx, discounts, order.id, product.id);
      }
    }

    // 10. Create order discounts
    if (data.discounts?.length > 0) {
      await this.createDiscountsWithSponsorships(tx, data.discounts, order.id);
    }

    // 11. Create delivery fees
    if (data.deliveryFees?.length > 0) {
      await tx.deliveryFee.createMany({
        data: data.deliveryFees.map((df: any) => ({
          ...df,
          orderId: order.id,
        })),
      });
    }

    return order;
  }

  private async createToppingsRecursively(tx: any, toppings: any[], productId: string, parentId?: string) {
    for (const toppingData of toppings) {
      const { children, discounts, ...toppingFields } = toppingData;

      const topping = await tx.topping.create({
        data: {
          ...toppingFields,
          productId,
          parentId: parentId || null,
        },
      });

      // Create child toppings if exist
      if (children?.length > 0) {
        await this.createToppingsRecursively(tx, children, productId, topping.id);
      }

      // Create topping discounts
      if (discounts?.length > 0) {
        await this.createDiscountsWithSponsorships(tx, discounts, undefined, productId, topping.id);
      }
    }
  }

  private async createDiscountsWithSponsorships(
      tx: any,
      discounts: any[],
      orderId?: string,
      productId?: string,
      toppingId?: string
  ) {
    for (const discountData of discounts) {
      const { sponsorships, ...discountFields } = discountData;

      const discount = await tx.discount.create({
        data: {
          ...discountFields,
          orderId: orderId || null,
          productId: productId || null,
          toppingId: toppingId || null,
        },
      });

      // Create sponsorships if exist
      if (sponsorships?.length > 0) {
        await tx.sponsorship.createMany({
          data: sponsorships.map((s: any) => ({
            ...s,
            discountId: discount.id,
          })),
        });
      }
    }
  }
}