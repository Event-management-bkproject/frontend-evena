import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { ApiResponse, CreateVenueRequest, PaginatedResponse, VenueResponse } from '../types';

export const VenueAPI = createApi({
  reducerPath: 'VenueAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Venue'],
  endpoints: (builder) => ({
    getVenues: builder.query<ApiResponse<PaginatedResponse<VenueResponse>>, { page?: number; size?: number }>({
      query: (params = {}) => ({
        url: '/venues',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Venue'],
    }),

    searchVenues: builder.query<
      ApiResponse<PaginatedResponse<VenueResponse>>,
      { keyword: string; page?: number; size?: number }
    >({
      query: ({ keyword, page = 0, size = 10 }) => ({
        url: '/venues/search',
        method: 'GET',
        params: { keyword, page, size },
      }),
      providesTags: ['Venue'],
    }),

    getVenueById: builder.query<ApiResponse<VenueResponse>, number>({
      query: (id: number) => ({
        url: `/venues/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Venue', id }],
    }),

    createVenue: builder.mutation<ApiResponse<VenueResponse>, CreateVenueRequest>({
      query: (newVenue: CreateVenueRequest) => ({
        url: '/venues',
        method: 'POST',
        body: newVenue,
      }),
      invalidatesTags: ['Venue'],
    }),

    updateVenue: builder.mutation<ApiResponse<VenueResponse>, { id: number; data: CreateVenueRequest }>({
      query: ({ id, data }) => ({
        url: `/venues/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Venue', id }, 'Venue'],
    }),

    deleteVenue: builder.mutation<ApiResponse<string>, number>({
      query: (id: number) => ({
        url: `/venues/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Venue'],
    }),

    getVenuesByCity: builder.query<ApiResponse<VenueResponse[]>, string>({
      query: (city: string) => ({
        url: `/venues/city/${city}`,
        method: 'GET',
      }),
      providesTags: ['Venue'],
    }),

    getAllCities: builder.query<ApiResponse<string[]>, void>({
      query: () => ({
        url: '/venues/cities',
        method: 'GET',
      }),
      providesTags: ['Venue'],
    }),
  }),
});
export const {
  useGetVenuesQuery,
  useSearchVenuesQuery,
  useGetVenueByIdQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
  useGetVenuesByCityQuery,
  useGetAllCitiesQuery,
} = VenueAPI;
