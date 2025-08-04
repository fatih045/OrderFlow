
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class OrderValidator {
  private errors: ValidationError[] = [];

  validate(order: any): ValidationResult {
    this.errors = [];

    // Temel alanları kontrol et
    this.validateRequired(order, 'token', 'string', 512);
    this.validateRequired(order, 'code', 'string', 255);
    this.validateRequired(order, 'createdAt', 'string');
    this.validateRequired(order, 'expiryDate', 'string');
    this.validateRequired(order, 'expeditionType');

    // ExpeditionType kontrolü
    if (order.expeditionType && !['pickup', 'delivery'].includes(order.expeditionType)) {
      this.addError('expeditionType', 'Must be either "pickup" or "delivery"', order.expeditionType);
    }

    // Boolean alanları
    this.validateBoolean(order, 'test');
    this.validateBoolean(order, 'preOrder');

    // Nested object validations
    this.validateCustomer(order.customer);
    this.validateLocalInfo(order.localInfo);
    this.validatePlatformRestaurant(order.platformRestaurant);
    this.validatePayment(order.payment);
    this.validatePrice(order.price);

    // Products array kontrolü
    if (!Array.isArray(order.products)) {
      this.addError('products', 'Products must be an array');
    } else {
      order.products.forEach((product: any, index: number) => {
        this.validateProduct(product, `products[${index}]`);
      });
    }

    // Expedition type'a göre delivery/pickup kontrolü
    if (order.expeditionType === 'delivery') {
      this.validateDelivery(order.delivery);
    } else if (order.expeditionType === 'pickup') {
      this.validatePickup(order.pickup);
    }

    // Tarih formatı kontrolü
    this.validateDateString(order.createdAt, 'createdAt');
    this.validateDateString(order.expiryDate, 'expiryDate');

    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    };
  }

  private validateRequired(obj: any, field: string, type?: string, maxLength?: number): void {
    if (!obj || obj[field] === undefined || obj[field] === null || obj[field] === '') {
      this.addError(field, `${field} is required`);
      return;
    }

    if (type && typeof obj[field] !== type) {
      this.addError(field, `${field} must be of type ${type}`, typeof obj[field]);
      return;
    }

    if (maxLength && type === 'string' && obj[field].length > maxLength) {
      this.addError(field, `${field} must not exceed ${maxLength} characters`, obj[field].length);
    }
  }

  private validateBoolean(obj: any, field: string): void {
    if (obj && obj[field] !== undefined && typeof obj[field] !== 'boolean') {
      this.addError(field, `${field} must be a boolean`, typeof obj[field]);
    }
  }

  private validateCustomer(customer: any): void {
    if (!customer) {
      this.addError('customer', 'Customer information is required');
      return;
    }

    // Email hash kontrolü (opsiyonel ama varsa string olmalı)
    if (customer.email !== undefined && typeof customer.email !== 'string') {
      this.addError('customer.email', 'Customer email must be a string');
    }
  }

  private validateLocalInfo(localInfo: any): void {
    if (!localInfo) {
      this.addError('localInfo', 'Local info is required');
      return;
    }

    this.validateRequired(localInfo, 'countryCode', 'string');
    if (localInfo.countryCode && localInfo.countryCode.length !== 2) {
      this.addError('localInfo.countryCode', 'Country code must be 2 characters');
    }

    this.validateRequired(localInfo, 'currencySymbol', 'string');
    this.validateRequired(localInfo, 'platform', 'string');
    this.validateRequired(localInfo, 'platformKey', 'string');
  }

  private validatePlatformRestaurant(platformRestaurant: any): void {
    if (!platformRestaurant) {
      this.addError('platformRestaurant', 'Platform restaurant info is required');
      return;
    }

    this.validateRequired(platformRestaurant, 'id', 'string');
  }

  private validatePayment(payment: any): void {
    if (!payment) {
      this.addError('payment', 'Payment info is required');
      return;
    }

    if (!['pending', 'paid'].includes(payment.status)) {
      this.addError('payment.status', 'Payment status must be "pending" or "paid"', payment.status);
    }

    this.validateRequired(payment, 'type', 'string');
  }

  private validatePrice(price: any): void {
    if (!price) {
      this.addError('price', 'Price info is required');
      return;
    }

    this.validateRequired(price, 'grandTotal', 'string');
    this.validateRequired(price, 'totalNet', 'string');
    this.validateRequired(price, 'vatTotal', 'string');

    // Numeric string kontrolü
    this.validateNumericString(price.grandTotal, 'price.grandTotal');
    this.validateNumericString(price.totalNet, 'price.totalNet');
    this.validateNumericString(price.vatTotal, 'price.vatTotal');
  }

  private validateProduct(product: any, fieldPath: string): void {
    if (!product) {
      this.addError(fieldPath, 'Product cannot be null');
      return;
    }

    // Quantity kontrolü
    if (product.quantity !== undefined) {
      this.validateNumericString(product.quantity, `${fieldPath}.quantity`);
    }

    // Price kontrolları
    if (product.paidPrice !== undefined) {
      this.validateNumericString(product.paidPrice, `${fieldPath}.paidPrice`);
    }
    if (product.unitPrice !== undefined) {
      this.validateNumericString(product.unitPrice, `${fieldPath}.unitPrice`);
    }
  }

  private validateDelivery(delivery: any): void {
    if (!delivery) {
      this.addError('delivery', 'Delivery info is required for delivery orders');
      return;
    }

    // Address kontrolü (Own Delivery için null olabilir)
    if (delivery.address && delivery.address.latitude !== undefined) {
      if (delivery.address.latitude < -90 || delivery.address.latitude > 90) {
        this.addError('delivery.address.latitude', 'Latitude must be between -90 and 90');
      }
    }

    if (delivery.address && delivery.address.longitude !== undefined) {
      if (delivery.address.longitude < -180 || delivery.address.longitude > 180) {
        this.addError('delivery.address.longitude', 'Longitude must be between -180 and 180');
      }
    }
  }

  private validatePickup(pickup: any): void {
    // Pickup opsiyonel olabilir
    if (pickup && pickup.pickupTime) {
      this.validateDateString(pickup.pickupTime, 'pickup.pickupTime');
    }
  }

  private validateNumericString(value: any, fieldName: string): void {
    if (value !== undefined && value !== null && value !== '') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        this.addError(fieldName, `${fieldName} must be a valid numeric string`, value);
      }
    }
  }

  private validateDateString(value: any, fieldName: string): void {
    if (value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        this.addError(fieldName, `${fieldName} must be a valid date string`, value);
      }
    }
  }

  private addError(field: string, message: string, value?: any): void {
    this.errors.push({ field, message, value });
  }
}

// Helper functions
export function validateOrder(order: any): ValidationResult {
  const validator = new OrderValidator();
  return validator.validate(order);
}

export function isValidOrder(order: any): boolean {
  return validateOrder(order).isValid;
}

// Usage example:
/*
const order = {
  token: "abc123",
  code: "ORDER001",
  // ... other fields
};

const result = validateOrder(order);
if (!result.isValid) {
  console.log("Validation errors:", result.errors);
}
*/