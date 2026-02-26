import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { ApiResponse } from '../types/auth';
import {
  InitiatePaymentRequest,
  PaymentApiResponse,
  RefundRequest,
  RefundResponse,
} from '../types/payment';

export const PaymentAPI = createApi({
  reducerPath: 'PaymentAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Payment', 'Order'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    /** POST /api/payment/initiate - Initiate a payment for an order */
    initiatePayment: builder.mutation<ApiResponse<PaymentApiResponse>, InitiatePaymentRequest>({
      query: (data) => ({
        url: '/payment/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Payment',
      ],
    }),

    /** GET /api/payment/{paymentId} - Get payment details by ID */
    getPaymentById: builder.query<ApiResponse<PaymentApiResponse>, number>({
      query: (paymentId) => ({
        url: `/payment/${paymentId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, paymentId) => [{ type: 'Payment', id: paymentId }],
    }),

    /** GET /api/payment/order/{orderId} - Get payment for a specific order */
    getPaymentByOrderId: builder.query<ApiResponse<PaymentApiResponse>, number>({
      query: (orderId) => ({
        url: `/payment/order/${orderId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, orderId) => [
        { type: 'Payment', id: `order-${orderId}` },
        { type: 'Order', id: orderId },
      ],
    }),

    /** GET /api/payment/user/{userId} - Get all payments for a user (ADMIN/ORGANIZER) */
    getUserPayments: builder.query<ApiResponse<PaymentApiResponse[]>, string>({
      query: (userId) => ({
        url: `/payment/user/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Payment'],
    }),

    /** POST /api/payment/refund - Refund a payment (ADMIN/ORGANIZER only) */
    refundPayment: builder.mutation<ApiResponse<RefundResponse>, RefundRequest>({
      query: (data) => ({
        url: '/payment/refund',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { paymentId }) => [
        { type: 'Payment', id: paymentId },
        'Order',
      ],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useGetPaymentByIdQuery,
  useGetPaymentByOrderIdQuery,
  useGetUserPaymentsQuery,
  useRefundPaymentMutation,
} = PaymentAPI;
