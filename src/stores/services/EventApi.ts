import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  CreateEventRequest,
  EventFileDTO,
  EventListResponse,
  EventResponse,
  EventSearchRequest,
  UpdateEventRequest,
  UploadResponse,
} from '../types/event';
import { ApiResponse, PaginatedResponse } from '../types';

export const EventAPI = createApi({
  reducerPath: 'EventAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Event'],
  keepUnusedDataFor: 300,
  // refetchOnMountOrArgChange: 1, // Refetch if data is older than 30 seconds
  // refetchOnReconnect: true, // Refetch when connection is restored
  // refetchOnFocus: true, // Refetch when window regains focus
  endpoints: (builder) => ({
    getEvents: builder.query<
      ApiResponse<PaginatedResponse<EventListResponse>>,
      {
        page?: number;
        size?: number;
      }
    >({
      query: (params = {}) => ({
        url: '/events',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Event'],
    }),
    getEventsSearch: builder.query<ApiResponse<PaginatedResponse<EventListResponse>>, EventSearchRequest>({
      query: (params: EventSearchRequest) => ({
        url: '/events/search',
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
    getPublicEvents: builder.query<ApiResponse<PaginatedResponse<EventListResponse>>, { page?: number; size?: number }>(
      {
        query: (params = {}) => ({
          url: '/events',
          method: 'GET',
          params: {
            page: params.page || 0,
            size: params.size || 1000, // Get all events for customer dashboard
            // No status filter - show all events to customers
            sortBy: 'startAt',
            sortDirection: 'ASC',
          },
        }),
        providesTags: ['Event'],
      },
    ),
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

    // Image upload endpoints
    uploadEventCover: builder.mutation<UploadResponse, { eventId: string; file: FormData }>({
      query: ({ eventId, file }) => ({
        url: `/events/${eventId}/images/cover`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    uploadGalleryImage: builder.mutation<UploadResponse, { eventId: string; file: FormData }>({
      query: ({ eventId, file }) => ({
        url: `/events/${eventId}/images/gallery`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    deleteGalleryImage: builder.mutation<ApiResponse<string>, { eventId: string; url: string }>({
      query: ({ eventId, url }) => ({
        url: `/events/${eventId}/images/gallery`,
        method: 'DELETE',
        params: { url },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    deleteEventCover: builder.mutation<void, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/images/cover`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),

    // File attachment endpoints
    uploadEventFile: builder.mutation<EventFileDTO, { eventId: string; file: FormData }>({
      query: ({ eventId, file }) => ({
        url: `/events/${eventId}/files`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    listEventFiles: builder.query<EventFileDTO[], string>({
      query: (eventId) => ({
        url: `/events/${eventId}/files`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'Event', id: eventId }],
    }),
    deleteEventFile: builder.mutation<ApiResponse<string>, { eventId: string; fileId: number }>({
      query: ({ eventId, fileId }) => ({
        url: `/events/${eventId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
  }),
});
export const {
  useGetEventsQuery,
  useGetEventsSearchQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useCancelEventMutation,
  useGetMyEventsQuery,
  useGetPublicEventsQuery,
  useGetEventsByOrganizerQuery,
  useUploadEventCoverMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
  useDeleteEventCoverMutation,
  useUploadEventFileMutation,
  useListEventFilesQuery,
  useDeleteEventFileMutation,
} = EventAPI;
