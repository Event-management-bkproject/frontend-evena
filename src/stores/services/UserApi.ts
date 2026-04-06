import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { UploadResponse } from '../types/event';
import { MeApiResponse } from '../types/auth';

export const UserAPI = createApi({
  reducerPath: 'UserAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['User'],
  keepUnusedDataFor: 300,
  endpoints: (builder) => ({
    getMe: builder.query<MeApiResponse, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['User'],
    }),
    uploadAvatar: builder.mutation<UploadResponse, FormData>({
      query: (file) => ({
        url: '/users/avatar',
        method: 'PUT',
        body: file,
      }),
      invalidatesTags: ['User'],
    }),
    deleteAvatar: builder.mutation<void, void>({
      query: () => ({
        url: '/users/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery, useUploadAvatarMutation, useDeleteAvatarMutation } = UserAPI;
