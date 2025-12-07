import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  ApiResponse,
  InviteMemberRequest,
  OrganizationMemberResponse,
  PaginatedResponse,
  UpdateMemberRoleRequest,
} from '../types';

export const OrganizationMemberAPI = createApi({
  reducerPath: 'OrganizationMemberAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['OrganizationMember'],
  endpoints: (builder) => ({
    // Invite member to organization
    inviteMember: builder.mutation<
      ApiResponse<OrganizationMemberResponse>,
      { organizationId: number; data: InviteMemberRequest }
    >({
      query: ({ organizationId, data }) => ({
        url: `/organizations/${organizationId}/members/invite`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId },
        'OrganizationMember',
      ],
    }),

    // Accept invitation
    acceptInvitation: builder.mutation<
      ApiResponse<OrganizationMemberResponse>,
      { organizationId: number; memberId: number }
    >({
      query: ({ organizationId, memberId }) => ({
        url: `/organizations/${organizationId}/members/${memberId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId },
        'OrganizationMember',
      ],
    }),

    // Reject invitation
    rejectInvitation: builder.mutation<ApiResponse<string>, { organizationId: number; memberId: number }>({
      query: ({ organizationId, memberId }) => ({
        url: `/organizations/${organizationId}/members/${memberId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId },
        'OrganizationMember',
      ],
    }),

    // Update member role
    updateMemberRole: builder.mutation<
      ApiResponse<OrganizationMemberResponse>,
      { organizationId: number; memberId: number; data: UpdateMemberRoleRequest }
    >({
      query: ({ organizationId, memberId, data }) => ({
        url: `/organizations/${organizationId}/members/${memberId}/role`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId },
        'OrganizationMember',
      ],
    }),

    // Remove member
    removeMember: builder.mutation<ApiResponse<string>, { organizationId: number; memberId: number }>({
      query: ({ organizationId, memberId }) => ({
        url: `/organizations/${organizationId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationMember', id: organizationId },
        'OrganizationMember',
      ],
    }),

    // Get all members of an organization
    getOrganizationMembers: builder.query<ApiResponse<OrganizationMemberResponse[]>, number>({
      query: (organizationId: number) => ({
        url: `/organizations/${organizationId}/members`,
        method: 'GET',
      }),
      providesTags: (result, error, organizationId) => [{ type: 'OrganizationMember', id: organizationId }],
    }),

    // Get paginated members
    getOrganizationMembersPaged: builder.query<
      ApiResponse<PaginatedResponse<OrganizationMemberResponse>>,
      { organizationId: number; page?: number; size?: number }
    >({
      query: ({ organizationId, page = 0, size = 10 }) => ({
        url: `/organizations/${organizationId}/members/paged`,
        method: 'GET',
        params: { page, size },
      }),
      providesTags: (result, error, { organizationId }) => [{ type: 'OrganizationMember', id: organizationId }],
    }),
  }),
});

export const {
  useInviteMemberMutation,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetOrganizationMembersQuery,
  useGetOrganizationMembersPagedQuery,
} = OrganizationMemberAPI;
