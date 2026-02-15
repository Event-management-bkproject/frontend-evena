import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  ApiResponse,
  CreateTicketTypeRequest,
  PaginatedResponse,
  TicketTypeListResponse,
  TicketTypeResponse,
  UpdateTicketTypeRequest,
} from '../types';

export const TicketTypeAPI = createApi({
  reducerPath: 'TicketTypeAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['TicketType', 'Event'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    // Create ticket type for an event
    createTicketType: builder.mutation<
      ApiResponse<TicketTypeResponse>,
      { eventId: string; data: CreateTicketTypeRequest }
    >({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}/ticket-types`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'TicketType', id: eventId },
        { type: 'Event', id: eventId },
      ],
    }),

    // Get ticket type by ID
    getTicketTypeById: builder.query<
      ApiResponse<TicketTypeResponse>,
      { eventId: string; ticketTypeId: number }
    >({
      query: ({ eventId, ticketTypeId }) => ({
        url: `/events/${eventId}/ticket-types/${ticketTypeId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { ticketTypeId }) => [{ type: 'TicketType', id: ticketTypeId }],
    }),

    // Get all ticket types for an event
    getTicketTypes: builder.query<ApiResponse<TicketTypeResponse[]>, string>({
      query: (eventId: string) => ({
        url: `/events/${eventId}/ticket-types`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'TicketType', id: eventId }],
    }),

    // Get public/visible ticket types
    getPublicTicketTypes: builder.query<ApiResponse<TicketTypeListResponse[]>, string>({
      query: (eventId: string) => ({
        url: `/events/${eventId}/ticket-types/public`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'TicketType', id: eventId }],
    }),

    // Get paginated ticket types (for organizers)
    getTicketTypesPaged: builder.query<
      ApiResponse<PaginatedResponse<TicketTypeResponse>>,
      { eventId: string; page?: number; size?: number }
    >({
      query: ({ eventId, page = 0, size = 10 }) => ({
        url: `/events/${eventId}/ticket-types/paged`,
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (result, error, { eventId }) => [{ type: 'TicketType', id: eventId }],
    }),

    // Get available ticket types (for customers)
    getAvailableTicketTypes: builder.query<ApiResponse<TicketTypeResponse[]>, string>({
      query: (eventId: string) => ({
        url: `/events/${eventId}/ticket-types/available`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'TicketType', id: eventId }],
    }),

    // Get early bird ticket types
    getEarlyBirdTicketTypes: builder.query<ApiResponse<TicketTypeResponse[]>, string>({
      query: (eventId: string) => ({
        url: `/events/${eventId}/ticket-types/early-bird`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'TicketType', id: eventId }],
    }),

    // Update ticket type
    updateTicketType: builder.mutation<
      ApiResponse<TicketTypeResponse>,
      { eventId: string; ticketTypeId: number; data: UpdateTicketTypeRequest }
    >({
      query: ({ eventId, ticketTypeId, data }) => ({
        url: `/events/${eventId}/ticket-types/${ticketTypeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId, ticketTypeId }) => [
        { type: 'TicketType', id: eventId },
        { type: 'TicketType', id: ticketTypeId },
        { type: 'Event', id: eventId },
      ],
    }),

    // Deactivate ticket type
    deactivateTicketType: builder.mutation<
      ApiResponse<TicketTypeResponse>,
      { eventId: string; ticketTypeId: number }
    >({
      query: ({ eventId, ticketTypeId }) => ({
        url: `/events/${eventId}/ticket-types/${ticketTypeId}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { eventId, ticketTypeId }) => [
        { type: 'TicketType', id: eventId },
        { type: 'TicketType', id: ticketTypeId },
        { type: 'Event', id: eventId },
      ],
    }),

    // Delete ticket type
    deleteTicketType: builder.mutation<ApiResponse<string>, { eventId: string; ticketTypeId: number }>({
      query: ({ eventId, ticketTypeId }) => ({
        url: `/events/${eventId}/ticket-types/${ticketTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'TicketType', id: eventId },
        { type: 'Event', id: eventId },
      ],
    }),
  }),
});

export const {
  useCreateTicketTypeMutation,
  useGetTicketTypeByIdQuery,
  useGetTicketTypesQuery,
  useGetPublicTicketTypesQuery,
  useGetTicketTypesPagedQuery,
  useGetAvailableTicketTypesQuery,
  useGetEarlyBirdTicketTypesQuery,
  useUpdateTicketTypeMutation,
  useDeactivateTicketTypeMutation,
  useDeleteTicketTypeMutation,
} = TicketTypeAPI;
