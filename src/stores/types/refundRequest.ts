// Refund Request types — matched to backend RefundRequestResponse DTO and RefundRequestStatus enum

export enum RefundRequestStatus {
  PENDING            = 'PENDING',
  APPROVED           = 'APPROVED',
  REJECTED           = 'REJECTED',
  REFUND_PROCESSING  = 'REFUND_PROCESSING',
  REFUND_FAILED      = 'REFUND_FAILED',
  REFUNDED           = 'REFUNDED',
}

export interface RefundRequestResponse {
  id: number;
  orderId: number;
  eventName: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  status: RefundRequestStatus;
  refundAmount: number;
  reviewedByName?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundRequestDTO {
  orderId: number;
  reason: string;
}

export interface ReviewRefundRequestDTO {
  approved: boolean;
  reviewNote: string;
}
