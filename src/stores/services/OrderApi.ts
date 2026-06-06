import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  CreateOrderRequest,
  OrderResponse,
  CheckoutRequest,
  CheckoutResponse,
  TicketResponse,
  OrderListResponse,
} from '../types/order';
import { ApiResponse, PaginatedResponse } from '../types';

export const OrderAPI = createApi({
  reducerPath: 'OrderAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Order', 'Ticket', 'TicketType', 'Event'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    // Create a new order
    createOrder: builder.mutation<ApiResponse<OrderResponse>, CreateOrderRequest>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        'Order',
        { type: 'TicketType', id: eventId },
        { type: 'Event', id: eventId },
      ],
    }),

    // Process payment for order (checkout) - returns order + generated tickets
    checkoutOrder: builder.mutation<ApiResponse<CheckoutResponse>, CheckoutRequest>({
      query: (checkoutData) => ({
        url: '/orders/checkout',
        method: 'POST',
        body: checkoutData,
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'Order',
        'Ticket',
      ],
    }),

    // Get order by ID
    getOrderById: builder.query<ApiResponse<OrderResponse>, number>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // Get current user's orders (paginated)
    getMyOrders: builder.query<
      ApiResponse<PaginatedResponse<OrderListResponse>>,
      { page?: number; size?: number; status?: string }
    >({
      query: (params = {}) => ({
        url: '/orders/my-orders',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 10,
          ...(params.status ? { status: params.status } : {}),
        },
      }),
      providesTags: ['Order'],
    }),

    // Cancel a pending order
    cancelOrder: builder.mutation<ApiResponse<OrderResponse>, number>({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Order',
      ],
    }),

    // Get orders for all events managed by current organizer (paginated)
    getOrganizerOrders: builder.query<
      ApiResponse<PaginatedResponse<OrderResponse>>,
      { page?: number; size?: number; status?: string; keyword?: string }
    >({
      query: (params = {}) => ({
        url: '/orders/organizer',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
          ...(params.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      providesTags: ['Order'],
    }),

    // Get current user's tickets
    getMyTickets: builder.query<ApiResponse<TicketResponse[]>, void>({
      query: () => ({
        url: '/orders/my-tickets',
        method: 'GET',
      }),
      providesTags: ['Ticket'],
    }),

    // Get all tickets (admin only)
    getAdminTickets: builder.query<
      ApiResponse<PaginatedResponse<TicketResponse>>,
      { page?: number; size?: number; status?: string; keyword?: string }
    >({
      query: (params = {}) => ({
        url: '/orders/admin/tickets',
        method: 'GET',
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          ...(params.status && params.status !== 'ALL' ? { status: params.status } : {}),
          ...(params.keyword ? { keyword: params.keyword } : {}),
        },
      }),
      providesTags: ['Ticket'],
    }),

    // Get ticket details by ID (with QR code)
    getTicketById: builder.query<ApiResponse<TicketResponse>, number>({
      query: (ticketId) => ({
        url: `/orders/tickets/${ticketId}`,
        method: 'GET',
      }),
      providesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCheckoutOrderMutation,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useGetOrganizerOrdersQuery,
  useCancelOrderMutation,
  useGetMyTicketsQuery,
  useGetAdminTicketsQuery,
  useGetTicketByIdQuery,
} = OrderAPI;
