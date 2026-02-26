// Payment API types - aligned with backend PaymentController
// POST /api/payment/initiate, /refund, GET /api/payment/*

import { PaymentProvider, PaymentStatus } from './order';

// ============= PAYMENT INITIATION =============

/** Request for POST /api/payment/initiate */
export interface InitiatePaymentRequest {
  orderId: number;
  provider: PaymentProvider;
  /** Client-generated idempotency key to prevent duplicate payments */
  idempotencyId: string;
  returnUrl?: string;
  cancelUrl?: string;
}

/** Response from POST /api/payment/initiate */
export interface PaymentApiResponse {
  paymentId: number;
  orderId: number;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  /** Redirect URL for external payment gateway (MoMo, VNPay) */
  paymentUrl?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= REFUND =============

/** Request for POST /api/payment/refund (ADMIN/ORGANIZER only) */
export interface RefundRequest {
  paymentId: number;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
}

// ============= MOMO GATEWAY TYPES =============
// Used when provider = MOMO - returned inside paymentUrl or via separate initiation

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

export interface MoMoQueryResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  extraData?: string;
  amount: number;
  transId: number;
  payType: number;
  resultCode: number;
  message: string;
  responseTime: number;
}

export interface MoMoRefundResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  transId: number;
  responseTime: number;
  message: string;
  resultCode: number;
}
