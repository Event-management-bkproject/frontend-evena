import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  ApiResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationDetailResponse,
  OrganizationResponse,
  PaginatedResponse,
} from '../types';
import { UploadResponse } from '../types/event';

export const OrganizerAPI = createApi({
  reducerPath: 'OrganizerAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Organizer'],
  keepUnusedDataFor: 600,
  // refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  // refetchOnReconnect: true, // Refetch when connection is restored
  // refetchOnFocus: true, // Refetch when window regains focus
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
      { id: number; data: UpdateOrganizationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Organizer', id }, 'Organizer'],
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

    uploadOrgLogo: builder.mutation<UploadResponse, { organizationId: number; file: File }>({
      query: ({ organizationId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return { url: `/organizations/${organizationId}/images/logo`, method: 'POST', body: form };
      },
      invalidatesTags: (_r, _e, { organizationId }) => [{ type: 'Organizer', id: organizationId }, 'Organizer'],
    }),
    deleteOrgLogo: builder.mutation<void, { organizationId: number }>({
      query: ({ organizationId }) => ({
        url: `/organizations/${organizationId}/images/logo`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { organizationId }) => [{ type: 'Organizer', id: organizationId }, 'Organizer'],
    }),

    /** GET /api/organizations/user/{userId}/organizations - All orgs a user belongs to */
    getUserOrganizations: builder.query<ApiResponse<OrganizationDetailResponse[]>, string>({
      query: (userId: string) => ({
        url: `/organizations/user/${userId}/organizations`,
        method: 'GET',
      }),
      providesTags: ['Organizer'],
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
  useGetUserOrganizationsQuery,
  useUploadOrgLogoMutation,
  useDeleteOrgLogoMutation,
} = OrganizerAPI;
