import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  FlexPassListingResponse,
  FlexPassMarketplaceListing,
  FlexPassSaleWindowResponse,
  FlexPassPriceAnalysisResponse,
  FlexPassPurchaseResponse,
  CreateFlexPassListingRequest,
  CreateFlexPassSaleWindowRequest,
  FlexPassListingDecisionRequest,
  FlexPassCheckoutRequest,
} from '../types/flexpass';
import { ApiResponse, PaginatedResponse } from '../types';

export const FlexPassAPI = createApi({
  reducerPath: 'FlexPassAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['FlexPassListing', 'FlexPassSaleWindow', 'FlexPassPriceAnalysis'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({

    // ─── Seller endpoints ─────────────────────────────────────────────────────

    createListing: builder.mutation<ApiResponse<FlexPassListingResponse>, CreateFlexPassListingRequest>({
      query: (body) => ({
        url: '/flexpass/listings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FlexPassListing'],
    }),

    getMyListings: builder.query<ApiResponse<FlexPassListingResponse[]>, void>({
      query: () => ({ url: '/flexpass/listings/my', method: 'GET' }),
      providesTags: ['FlexPassListing'],
    }),

    cancelListing: builder.mutation<ApiResponse<FlexPassListingResponse>, number>({
      query: (listingId) => ({
        url: `/flexpass/listings/${listingId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['FlexPassListing'],
    }),

    // ─── Marketplace (public) ─────────────────────────────────────────────────

    getMarketplaceListings: builder.query<ApiResponse<FlexPassMarketplaceListing[]>, { eventId?: string } | void>({
      query: (params) => ({
        url: '/flexpass/marketplace/listings',
        method: 'GET',
        params: params && (params as { eventId?: string }).eventId
          ? { eventId: (params as { eventId?: string }).eventId }
          : undefined,
      }),
      providesTags: ['FlexPassListing'],
    }),

    checkoutListing: builder.mutation<ApiResponse<FlexPassPurchaseResponse>, FlexPassCheckoutRequest>({
      query: (body) => ({
        url: '/flexpass/purchases/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FlexPassListing'],
    }),

    getPurchase: builder.query<ApiResponse<FlexPassPurchaseResponse>, number>({
      query: (purchaseId) => ({ url: `/flexpass/purchases/${purchaseId}`, method: 'GET' }),
    }),

    // ─── Organizer endpoints ──────────────────────────────────────────────────

    getOrganizerListings: builder.query<
      ApiResponse<PaginatedResponse<FlexPassListingResponse>>,
      { page?: number; size?: number; status?: string; keyword?: string }
    >({
      query: (params = {}) => ({
        url: '/flexpass/organizer/listings',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
          ...(params.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      providesTags: ['FlexPassListing'],
    }),

    approveListing: builder.mutation<ApiResponse<FlexPassListingResponse>, number>({
      query: (listingId) => ({
        url: `/flexpass/organizer/listings/${listingId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['FlexPassListing'],
    }),

    rejectListing: builder.mutation<ApiResponse<FlexPassListingResponse>, { listingId: number } & FlexPassListingDecisionRequest>({
      query: ({ listingId, ...body }) => ({
        url: `/flexpass/organizer/listings/${listingId}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['FlexPassListing'],
    }),

    getPriceAnalysis: builder.query<ApiResponse<FlexPassPriceAnalysisResponse>, string>({
      query: (eventId) => ({
        url: `/flexpass/organizer/events/${eventId}/price-analysis`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'FlexPassPriceAnalysis', id: eventId }],
    }),

    getEventSaleWindow: builder.query<ApiResponse<FlexPassSaleWindowResponse[]>, string>({
      query: (eventId) => ({
        url: `/flexpass/organizer/events/${eventId}/sale-window`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'FlexPassSaleWindow', id: eventId }],
    }),

    createSaleWindow: builder.mutation<ApiResponse<FlexPassSaleWindowResponse>, CreateFlexPassSaleWindowRequest>({
      query: (body) => ({
        url: '/flexpass/organizer/sale-windows',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        'FlexPassListing',
        { type: 'FlexPassSaleWindow', id: eventId },
        { type: 'FlexPassPriceAnalysis', id: eventId },
      ],
    }),

    cancelSaleWindow: builder.mutation<ApiResponse<FlexPassSaleWindowResponse>, { saleWindowId: number; eventId: string }>({
      query: ({ saleWindowId }) => ({
        url: `/flexpass/organizer/sale-windows/${saleWindowId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'FlexPassSaleWindow', id: eventId },
      ],
    }),

    // ─── Admin endpoints ──────────────────────────────────────────────────────

    getAdminSaleWindows: builder.query<
      ApiResponse<PaginatedResponse<FlexPassSaleWindowResponse>>,
      { page?: number; size?: number; status?: string }
    >({
      query: (params = {}) => ({
        url: '/flexpass/admin/sale-windows',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
        },
      }),
      providesTags: ['FlexPassSaleWindow'],
    }),
  }),
});

export const {
  useCreateListingMutation,
  useGetMyListingsQuery,
  useCancelListingMutation,
  useGetMarketplaceListingsQuery,
  useCheckoutListingMutation,
  useGetPurchaseQuery,
  useGetOrganizerListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useGetPriceAnalysisQuery,
  useGetEventSaleWindowQuery,
  useCreateSaleWindowMutation,
  useCancelSaleWindowMutation,
  useGetAdminSaleWindowsQuery,
} = FlexPassAPI;
