import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  CreateEventRequest,
  EventListResponse,
  EventResponse,
  EventSearchRequest,
  UpdateEventRequest,
} from '../types/event';
import { ApiResponse, PaginatedResponse } from '../types';

export const EventAPI = createApi({
  reducerPath: 'EventAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Event'],
  endpoints: (builder) => ({
    getEvents: builder.query<ApiResponse<PaginatedResponse<EventListResponse>>, EventSearchRequest>({
      query: (params: EventSearchRequest) => ({
        url: '/events',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 10,
          keyword: params.keyword,
          categoryId: params.categoryId,
          city: params.city,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          sortBy: params.sortBy || 'startAt',
          sortDirection: params.sortDirection || 'desc',
        },
      }),
      providesTags: ['Event'],
    }),
    getEventById: builder.query<ApiResponse<EventResponse>, string>({
      query: (id: string) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    createEvent: builder.mutation<ApiResponse<EventResponse>, CreateEventRequest>({
      query: (newEvent: CreateEventRequest) => ({
        url: '/events',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<ApiResponse<EventResponse>, { id: string; data: UpdateEventRequest }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }, 'Event'],
    }),
    deleteEvent: builder.mutation<ApiResponse<string>, string>({
      query: (id: string) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
    publishEvent: builder.mutation<ApiResponse<EventResponse>, string>({
      query: (id: string) => ({
        url: `/events/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }, 'Event'],
    }),
    cancelEvent: builder.mutation<ApiResponse<EventResponse>, string>({
      query: (id: string) => ({
        url: `/events/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Event', id }, 'Event'],
    }),
    getMyEvents: builder.query<ApiResponse<PaginatedResponse<EventListResponse>>, { page?: number; size?: number }>({
      query: (params = {}) => ({
        url: '/events/my-events',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Event'],
    }),
    getPublicEvents: builder.query<ApiResponse<PaginatedResponse<EventListResponse>>, { page?: number; size?: number }>({
      query: (params = {}) => ({
        url: '/events',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 1000, // Get all events for customer dashboard
          status: 'PUBLISHED', // Only published events
          sortBy: 'startAt',
          sortDirection: 'ASC',
        },
      }),
      providesTags: ['Event'],
    }),
    getEventsByOrganizer: builder.query<
      ApiResponse<PaginatedResponse<EventListResponse>>,
      { organizerId: number; page?: number; size?: number }
    >({
      query: ({ organizerId, page = 0, size = 10 }) => ({
        url: `/events/organizer/${organizerId}`,
        method: 'GET',
        params: {
          page,
          size,
        },
      }),
      providesTags: ['Event'],
    }),
  }),
});
export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useGetMyEventsQuery,
  useGetPublicEventsQuery,
  useGetEventsByOrganizerQuery,
} = EventAPI;
