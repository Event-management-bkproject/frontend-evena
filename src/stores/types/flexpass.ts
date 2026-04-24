// FlexPass types — matched to backend FlexPassListingResponse, FlexPassSaleWindowResponse,
// FlexPassMarketplaceListingResponse, FlexPassPriceAnalysisResponse DTOs

export enum FlexPassListingStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED         = 'APPROVED',
  PRICE_LOCKED     = 'PRICE_LOCKED',
  PAYMENT_PENDING  = 'PAYMENT_PENDING',
  COMPLETED        = 'COMPLETED',
  FAILED           = 'FAILED',
  REJECTED         = 'REJECTED',
  CANCELLED        = 'CANCELLED',
  EXPIRED          = 'EXPIRED',
}

export enum FlexPassSaleWindowStatus {
  SCHEDULED = 'SCHEDULED',
  OPENED    = 'OPENED',
  CLOSED    = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum FlexPassPricingMethod {
  MEAN         = 'MEAN',
  MEDIAN       = 'MEDIAN',
  TRIMMED_MEAN = 'TRIMMED_MEAN',
}

export interface FlexPassListingResponse {
  id: number;
  ticketId: number;
  sellerId: string;
  sellerName: string;
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  ticketTypeId: number;
  ticketTypeName: string;
  status: FlexPassListingStatus;
  originalPrice: number;
  submittedPrice: number;
  finalPrice: number | null;
  saleWindowId: number | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlexPassMarketplaceListing {
  id: number;
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  ticketTypeId: number;
  ticketTypeName: string;
  status: FlexPassListingStatus;
  originalPrice: number;
  submittedPrice: number;
  finalPrice: number | null;
  createdAt: string;
}

export interface FlexPassSaleWindowPriceResponse {
  ticketTypeId: number;
  ticketTypeName: string;
  sampleCount: number;
  meanPrice: number;
  medianPrice: number;
  trimmedMeanPrice: number;
  recommendedPrice: number;
  selectedPrice: number;
}

export interface FlexPassSaleWindowResponse {
  id: number;
  eventId: string;
  eventTitle: string;
  pricingMethod: FlexPassPricingMethod;
  status: FlexPassSaleWindowStatus;
  startAt: string;
  endAt: string;
  openedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  prices: FlexPassSaleWindowPriceResponse[];
}

export interface FlexPassPriceAnalysisItem {
  ticketTypeId: number;
  ticketTypeName: string;
  sampleCount: number;
  mean: number;
  median: number;
  trimmedMean: number;
  recommended: number;
}

export interface FlexPassPriceAnalysisResponse {
  eventId: string;
  generatedAt: string;
  items: FlexPassPriceAnalysisItem[];
}

export interface CreateFlexPassListingRequest {
  ticketId: number;
  submittedPrice: number;
}

export interface CreateFlexPassSaleWindowRequest {
  eventId: string;
  pricingMethod: FlexPassPricingMethod;
  startAt: string;
  endAt: string;
}

export interface FlexPassListingDecisionRequest {
  reason?: string;
}

export enum FlexPassPurchaseStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED       = 'COMPLETED',
  FAILED          = 'FAILED',
  REFUND_PENDING  = 'REFUND_PENDING',
  REFUNDED        = 'REFUNDED',
  REFUND_FAILED   = 'REFUND_FAILED',
}

export interface FlexPassPurchaseResponse {
  id: number;
  listingId: number;
  ticketId: number;
  buyerId: string;
  sellerId: string;
  eventId: string;
  provider: string;
  amount: number;
  status: FlexPassPurchaseStatus;
  paymentStatus: string;
  listingStatus: FlexPassListingStatus;
  paymentUrl: string | null;
  transactionId: string | null;
  failureReason: string | null;
  checkoutStartedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FlexPassCheckoutRequest {
  listingId: number;
  provider: 'VNPAY' | 'MOMO' | 'STRIPE' | 'PAYPAL' | 'CASH';
}
