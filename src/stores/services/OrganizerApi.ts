import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  ApiResponse,
  CreateOrganizationRequest,
  OrganizationDetailResponse,
  OrganizationResponse,
  PaginatedResponse,
} from '../types';

export const OrganizerAPI = createApi({
  reducerPath: 'OrganizerAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Organizer'],
  endpoints: (builder) => ({
    // Get all organizers with pagination
    getOrganizations: builder.query<
      ApiResponse<PaginatedResponse<OrganizationResponse>>,
      { page?: number; size?: number }
    >({
      query: (params = {}) => ({
        url: '/organizations',
        method: 'GET',
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      }),
      providesTags: ['Organizer'],
    }),
    searchOrganizations: builder.query<
      ApiResponse<PaginatedResponse<OrganizationResponse>>,
      { keyword: string; page?: number; size?: number }
    >({
      query: ({ keyword, page = 0, size = 10 }) => ({
        url: '/organizations/search',
        method: 'GET',
        params: { keyword, page, size },
      }),
      providesTags: ['Organizer'],
    }),
    createOrganization: builder.mutation<ApiResponse<OrganizationResponse>, CreateOrganizationRequest>({
      query: (newOrganizer: CreateOrganizationRequest) => ({
        url: '/organizations',
        method: 'POST',
        body: newOrganizer,
      }),
      invalidatesTags: ['Organizer'],
    }),
    getMyOrganizations: builder.query<ApiResponse<OrganizationResponse[]>, void>({
      query: () => ({
        url: '/organizations/my-organizations',
        method: 'GET',
      }),
      providesTags: ['Organizer'],
    }),
    getOrganizationById: builder.query<ApiResponse<OrganizationResponse>, number>({
      query: (id: number) => ({
        url: `/organizations/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Organizer', id }],
    }),
    getOrganizationDetails: builder.query<ApiResponse<OrganizationDetailResponse>, number>({
      query: (id: number) => ({
        url: `/organizations/${id}/details`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Organizer', id }],
    }),

    updateOrganization: builder.mutation<
      ApiResponse<OrganizationResponse>,
      { id: number; data: CreateOrganizationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organizer', id }, 'Organizer'],
    }),

    verifyOrganization: builder.mutation<ApiResponse<OrganizationResponse>, number>({
      query: (id: number) => ({
        url: `/organizations/${id}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Organizer', id }, 'Organizer'],
    }),

    deleteOrganization: builder.mutation<ApiResponse<string>, number>({
      query: (id: number) => ({
        url: `/organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organizer'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetOrganizationsQuery,
  useSearchOrganizationsQuery,
  useCreateOrganizationMutation,
  useGetMyOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationDetailsQuery,
  useUpdateOrganizationMutation,
  useVerifyOrganizationMutation,
  useDeleteOrganizationMutation,
} = OrganizerAPI;
