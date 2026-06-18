/**
 * @i-group/order-types — generated-from-BE types.
 *
 * T026 / C-17 — single source of truth for order / cart / checkout
 * shapes consumed by the FE. Generated from the BE OpenAPI spec at
 * build time via `scripts/generate-types.mjs` (uses openapi-typescript
 * when the BE is running locally).
 *
 * Until the generator runs, this file ships a manually-mirrored shape
 * matching the v2 contracts in
 * `e-commerce-backend/.lithefy/.specs/006-order-system-production-hardening/contracts/`.
 * Hand-edits are FORBIDDEN — re-run `npm run -w @i-group/order-types generate`
 * after any BE contract change.
 */

export type OrderStatus =
  | 'pending'
  | 'reviewed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  /** Decimal as string. */
  unitPrice: string;
  /** Decimal as string. */
  totalPrice: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'cash_on_delivery' | 'online' | null;
  /** ISO 4217 code. */
  currency: string;
  /** Decimal as string. */
  subtotal: string;
  shippingCost: string;
  tax: string;
  discount: string;
  total: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string;
  trackingNumber: string | null;
  carrier: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface PaymentError {
  code: string;
  message: string;
}

export interface CreateOrderResponse {
  order: Order;
  isDuplicate?: boolean;
  guestSessionToken?: string | null;
  paymentUrl?: string | null;
  paymentError?: PaymentError | null;
}

export interface TrackOrderResponse {
  status: OrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  lastStatusUpdate: string;
}

export interface OrderSummaryItem {
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderSummary {
  items: OrderSummaryItem[];
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string;
  total: string;
  itemCount: number;
  totalQuantity: number;
  stockValidation: Array<{
    productId: number;
    variantId: number | null;
    requested: number;
    available: number;
    ok: boolean;
  }>;
}

export interface CartItem {
  productId: number;
  variantId: number | null;
  quantity: number;
}
