// Order, Payment, and Ticket types for the Event Ticket System

import { EventListResponse } from './event';

// ============= ENUMS =============

export enum OrderStatus {
  PENDING = 'PENDING',
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
}

// ============= ORDER ITEM =============

export interface OrderItemRequest {
  ticketTypeId: number;
  quantity: number;
}

export interface OrderItemResponse {
  id: number;
  ticketType: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// ============= PAYMENT =============

export interface PaymentRequest {
  provider: PaymentProvider;
  payload?: Record<string, any>;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  transactionId: string;
  payload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============= TICKET =============

export interface TicketResponse {
  id: number;
  orderItem: {
    id: number;
    ticketType: {
      id: number;
      name: string;
      eventId: string;
    };
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  qrPayload: string;
  status: TicketStatus;
  issuedAt: string;
  usedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional data for display
  event?: EventListResponse;
}

// ============= ORDER =============

export interface CreateOrderRequest {
  eventId: string;
  items: OrderItemRequest[];
}

export interface CheckoutRequest {
  orderId: number;
  paymentProvider: PaymentProvider;
  paymentPayload?: Record<string, any>;
}

export interface OrderResponse {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItemResponse[];
  payments: PaymentResponse[];
  createdAt: string;
  updatedAt: string;
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
