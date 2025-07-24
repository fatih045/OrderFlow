// Yemeksepeti POS Plugin Interface (Clean - No Deprecated Fields)

export interface Order {
  // Core Order Information
  token: string; // <= 512 characters - Unique identifier in POS middleware
  code: string; // <= 255 characters - Unique identifier on delivery platform
  createdAt: string; // date-time format
  expiryDate: string; // date-time format
  expeditionType: "pickup" | "delivery";
  test: boolean; // Default: false
  preOrder: boolean; // Default: false
  shortCode?: string; // <= 255 characters - Daily unique code per vendor

  // Customer & Comments
  comments: Comments;
  customer: Customer;
  corporateTaxId: string; // <= 512 characters

  // Location & Platform
  localInfo: LocalInfo;
  platformRestaurant: PlatformRestaurant;

  // Payment & Pricing
  payment: Payment;
  price: Price;
  discounts: Discount[];

  // Products
  products: Product[];

  // Delivery/Pickup Specific
  delivery?: Delivery; // Only present for delivery orders
  pickup?: Pickup; // Only present for pickup orders

  // Optional Information
  extraParameters?: ExtraParameters;
  invoicingInformation?: InvoicingInformation;

  // Time Adjustments & Callbacks
  PreparationTimeAdjustments: PreparationTimeAdjustments;
  callbackUrls?: CallbackUrls;
}

export interface Comments {
  customerComment?: string;
}

export interface Customer {
  email?: string; // Hash of customer email
  firstName?: string;
  lastName?: string;
  mobilePhone?: string;
  flags?: string[] | string; // e.g., "PRO_SUBSCRIPTION"
}

export interface LocalInfo {
  countryCode: string; // 2 characters, ISO 3166-1 alpha-2
  currencySymbol: string;
  platform: string; // Platform name
  platformKey: string; // Platform identifier
}

export interface PlatformRestaurant {
  id: string; // Unique identifier on delivery platform
}

export interface Payment {
  status: "pending" | "paid";
  type: string; // Payment method (card, cash, etc.)
}

export interface Price {
  deliveryFees: DeliveryFee[];
  grandTotal: string;
  totalNet: string; // Replacement for deprecated subTotal
  vatTotal: string;
  payRestaurant?: string; // Amount courier gives to restaurant (Own Delivery)
  riderTip?: string; // Customer tip amount
  collectFromCustomer?: string; // Amount to collect from customer
}

export interface DeliveryFee {
  name?: string;
  value?: number;
}

export interface Discount {
  name?: string;
  amount: string; // Default: "0"
  sponsorships?: Sponsorship[]; // Max 3 items
}

export interface Sponsorship {
  sponsor: "PLATFORM" | "VENDOR" | "THIRD_PARTY";
  amount: string;
}

// Delivery Information (only for delivery orders)
export interface Delivery {
  address?: DeliveryAddress; // null for Own Delivery Orders
  expectedDeliveryTime?: string; // date-string format
  expressDelivery?: boolean; // Default: false
  riderPickupTime?: string | null; // null for Vendor Delivery Orders
}

export interface DeliveryAddress {
  building?: string; // <= 255 chars
  city?: string; // <= 255 chars
  company?: string; // <= 255 chars
  deliveryArea?: string; // <= 255 chars
  deliveryInstructions?: string; // <= 2048 chars
  deliveryMainArea?: string; // <= 255 chars
  entrance?: string; // <= 255 chars
  flatNumber?: string; // <= 255 chars
  floor?: string; // <= 255 chars
  intercom?: string; // <= 255 chars
  latitude?: number; // [-90..90]
  longitude?: number; // [-180..180]
  number?: string; // <= 255 chars (house number)
  postcode?: string; // <= 255 chars
  street?: string; // <= 255 chars
}

// Pickup Information (only for pickup orders)
export interface Pickup {
  pickupTime?: string; // date-time format - when order should be ready
  pickupCode?: string; // Optional pickup code for customer
}

export interface Product {
  id?: string; // Platform product identifier
  categoryName?: string;
  name?: string;
  paidPrice?: string; // Total price including toppings
  quantity?: string;
  unitPrice?: string; // Base price without toppings
  remoteCode?: string; // POS-side product identifier
  comment?: string; // Customer comment for this product

  // Toppings & Modifications
  selectedToppings?: Topping[];
  itemUnavailabilityHandling?: ItemUnavailabilityHandling;
  discounts?: Discount[];
  variation?: Variation;
}

export interface Topping {
  id?: string;
  name: string;
  price: string; // Default: ""
  quantity: number;
  remoteCode?: string; // POS-side topping identifier
  type?: "PRODUCT" | "VARIANT" | "EXTRA";
  itemUnavailabilityHandling?: ItemUnavailabilityHandling;
  discounts?: Discount[];
  children?: Topping[]; // Can be nested up to 5 levels
}

export interface Variation {
  name?: string; // Same as product name
}

export type ItemUnavailabilityHandling =
    | "REMOVE"
    | "REDUCE_QUANTITY"
    | "CALL_CUSTOMER_AND_REPLACE"
    | "CANCEL_ORDER";

export interface ExtraParameters {
  [key: string]: string; // Platform-specific parameters
}

export interface InvoicingInformation {
  carrierType?: string; // "mobile_barcode", "member_carrier", etc.
  carrierValue?: string;
}

export interface PreparationTimeAdjustments {
  maxPickUpTimestamp: string; // date-time - max adjustment timestamp
  minPickUpTimestamp?: string; // date-time - min adjustment timestamp
  preparationTimeChangeIntervalsInMinutes: number[][]; // Suggested intervals
}

export interface CallbackUrls {
  orderAcceptedUrl?: string; // POST to accept order
  orderRejectedUrl?: string; // POST to reject order
  orderProductModificationUrl?: string; // POST to modify products
  orderPickedUpUrl?: string; // POST when picked up
  orderPreparedUrl?: string; // POST when food ready
  orderPreparationTimeAdjustmentUrl?: string; // POST to adjust prep time
}

// Order Status Update Request (for status update endpoint)
export interface OrderStatusUpdateRequest {
  status: OrderStatusType;
  message: string;
  updatedOrder?: Order; // Required for PRODUCT_ORDER_MODIFICATION_SUCCESSFUL
}

export type OrderStatusType =
    | "ORDER_CANCELLED"
    | "ORDER_PICKED_UP"
    | "PRODUCT_ORDER_MODIFICATION_SUCCESSFUL"
    | "PRODUCT_ORDER_MODIFICATION_FAILED";

// Error codes for PRODUCT_ORDER_MODIFICATION_FAILED
export type ProductModificationErrorCode =
    | "VALIDATION_ERROR"
    | "INVALID_TOTAL_PRICE_CHANGE"
    | "MODIFICATION_HAS_NO_EFFECT"
    | "UNKNOWN_PRODUCT_ID"
    | "EXTRA_REMOVAL_NOT_SUPPORTED"
    | "PRODUCT_ADDITION_NOT_ALLOWED"
    | "PARTIAL_REMOVAL_NOT_ALLOWED"
    | "ERROR"
    | "QUANTITY_CANNOT_BE_ZERO"
    | "QUANTITY_REQUIRED"
    | "PRODUCT_ADDITION_WITH_TOPPINGS_NOT_ALLOWED"
    | "PRODUCT_REMOTE_CODE_REQUIRED"
    | "PRODUCT_ID_REQUIRED_FOR_MODIFICATION"
    | "SELECTED_TOPPINGS_MUST_BE_SET_FOR_TOPPING_MODIFICATION"
    | "PROPERTIES_MUST_BE_SET_FOR_MODIFICATION"
    | "PRODUCTS_MUST_BE_SET_FOR_MODIFICATION"
    | "SUB_PRODUCT_MODIFICATION_NOT_SUPPORTED";

// Helper functions
export enum OrderType {
  Pickup = "pickup",
  VendorDelivery = "vendor_delivery",
  OwnDelivery = "own_delivery"
}

export function getOrderType(order: Order): OrderType {
  if (order.expeditionType === "pickup") {
    return OrderType.Pickup;
  }

  if (order.expeditionType === "delivery") {
    // Own Delivery: riderPickupTime has a value
    // Vendor Delivery: riderPickupTime is null
    return order.delivery?.riderPickupTime === null
        ? OrderType.VendorDelivery
        : OrderType.OwnDelivery;
  }

  throw new Error("Invalid expedition type");
}

export function isTestOrder(order: Order): boolean {
  return order.test === true;
}

export function isPaidOrder(order: Order): boolean {
  return order.payment.status === "paid";
}

export function isPreOrder(order: Order): boolean {
  return order.preOrder === true;
}