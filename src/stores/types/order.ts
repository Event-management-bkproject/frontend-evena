// Order, Payment, and Ticket types for the Event Ticket System

// ============= SNAPSHOTS =============
// Immutable data captured at order/booking time for booking integrity

export interface EventSnapshot {
  eventId: string;
  eventVersion: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  coverUrl?: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  organizationId: number;
  organizationName: string;
  categoryId: number;
  categoryName: string;
}

export interface TicketTypeSnapshot {
  ticketTypeId: number;
  name: string;
  description?: string;
  originalPrice: number;
  currency: string;
  pricePaid: number;
  wasEarlyBird: boolean;
  earlyBirdDiscount?: number;
  perUserLimit?: number;
}

// ============= ENUMS =============

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  CASH = 'CASH',
  CARD = 'CARD',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum TicketStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// ============= ORDER ITEM =============

export interface OrderItemRequest {
  ticketTypeId: number;
  quantity: number;
}

export interface OrderItemResponse {
  id: number;
  ticketTypeId: number;
  ticketTypeName: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  ticketTypeSnapshot?: TicketTypeSnapshot;
}

// ============= PAYMENT PAYLOADS =============

export interface CashPaymentPayload {
  receivedAmount?: number;
}

export interface MomoPaymentPayload {
  phoneNumber?: string;
  redirectUrl?: string;
}

export interface VNPayPaymentPayload {
  bankCode?: string;
  redirectUrl?: string;
}

export interface CardPaymentPayload {
  last4?: string;
  brand?: string;
}

export type PaymentPayload =
  | CashPaymentPayload
  | MomoPaymentPayload
  | VNPayPaymentPayload
  | CardPaymentPayload;

// ============= PAYMENT =============

export interface PaymentRequest {
  provider: PaymentProvider;
  payload?: PaymentPayload;
}

/** Payment record embedded in OrderResponse.payments - matches backend PaymentResponse DTO */
export interface PaymentResponse {
  paymentId: number;
  orderId: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  /** Redirect URL for external providers (MoMo, VNPay) */
  paymentUrl?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= TICKET =============

/** Matches backend TicketResponse DTO - includes denormalized display fields */
export interface TicketResponse {
  id: number;
  /** Base64-encoded QR code image for display */
  qrCode: string;
  qrPayload: string;
  status: TicketStatus;
  eventTitle: string;
  ticketTypeName: string;
  eventStartAt: string;
  venueName: string;
  venueAddress: string;
  issuedAt: string;
  usedAt?: string;
}

// ============= ORDER =============

export interface CreateOrderRequest {
  eventId: string;
  items: OrderItemRequest[];
}

export interface CheckoutRequest {
  orderId: number;
  /** Maps to backend ProcessPaymentRequest.provider */
  provider: PaymentProvider;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
  returnUrl?: string;
  callbackUrl?: string;
}

export interface OrderResponse {
  id: number;
  userId: string;
  userEmail: string;
  eventId: string;
  eventVersion: number;
  eventSnapshot?: EventSnapshot;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItemResponse[];
  payments: PaymentResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Response from POST /api/orders/checkout
 *  - paymentUrl: present for paid orders (redirect to MoMo gateway)
 *  - paymentUrl absent/null: free order, tickets already issued, order is CONFIRMED
 */
export interface CheckoutResponse {
  order: OrderResponse;
  paymentUrl?: string | null;
  message: string;
}

export interface OrderListResponse {
  id: number;
  eventTitle: string;
  eventId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
  payments?: PaymentResponse[];
  items?: Array<{
    id: number;
    ticketTypeId: number;
    ticketTypeName: string;
    eventTitle: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  userEmail?: string;
  userName?: string;
}

// ============= UI STATE =============

export interface CartItem {
  ticketTypeId: number;
  ticketTypeName: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  eventId: string;
  eventTitle: string;
}

export interface CheckoutState {
  orderId?: number;
  selectedPaymentMethod?: PaymentProvider;
  isProcessing: boolean;
}
