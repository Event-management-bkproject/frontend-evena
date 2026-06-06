import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  RefundRequestResponse,
  CreateRefundRequestDTO,
  ReviewRefundRequestDTO,
} from '../types/refundRequest';
import { ApiResponse } from '../types/auth';
import { PaginatedResponse } from '../types/api';

export const RefundRequestAPI = createApi({
  reducerPath: 'RefundRequestAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['RefundRequest'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    // Customer: create a refund request for a CONFIRMED order
    createRefundRequest: builder.mutation<ApiResponse<RefundRequestResponse>, CreateRefundRequestDTO>({
      query: (body) => ({
        url: '/refund-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RefundRequest'],
    }),

    // Customer: list own refund requests
    getMyRefundRequests: builder.query<
      ApiResponse<PaginatedResponse<RefundRequestResponse>>,
      { page?: number; size?: number }
    >({
      query: (params = {}) => ({
        url: '/refund-requests/my',
        method: 'GET',
        params: { page: params.page ?? 0, size: params.size ?? 10 },
      }),
      providesTags: ['RefundRequest'],
    }),

    // Shared: get single refund request by ID
    getRefundRequestById: builder.query<ApiResponse<RefundRequestResponse>, number>({
      query: (id) => ({
        url: `/refund-requests/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'RefundRequest', id }],
    }),

    // Organizer: list refund requests for their events
    getOrganizerRefundRequests: builder.query<
      ApiResponse<PaginatedResponse<RefundRequestResponse>>,
      { page?: number; size?: number; status?: string; keyword?: string }
    >({
      query: (params = {}) => ({
        url: '/refund-requests/organizer',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
          ...(params.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      providesTags: ['RefundRequest'],
    }),

    // Organizer: approve or reject a refund request
    reviewRefundRequest: builder.mutation<
      ApiResponse<RefundRequestResponse>,
      { id: number } & ReviewRefundRequestDTO
    >({
      query: ({ id, ...body }) => ({
        url: `/refund-requests/${id}/review`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'RefundRequest', id }, 'RefundRequest'],
    }),
  }),
});

export const {
  useCreateRefundRequestMutation,
  useGetMyRefundRequestsQuery,
  useGetRefundRequestByIdQuery,
  useGetOrganizerRefundRequestsQuery,
  useReviewRefundRequestMutation,
} = RefundRequestAPI;
