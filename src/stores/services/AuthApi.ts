// stores/services/AuthApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  PasswordResetRequest,
  PasswordChangeRequest,
  MeApiResponse,
} from '../types';

export const AuthAPI = createApi({
  reducerPath: 'AuthAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Auth', 'User'],
  keepUnusedDataFor: 1800,
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // Customer registration
    register: builder.mutation<ApiResponse<UserResponse>, RegisterRequest>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Organizer registration
    registerOrganizer: builder.mutation<ApiResponse<UserResponse>, RegisterRequest>({
      query: (data) => ({
        url: '/auth/registerOrganizer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify email
    verifyEmail: builder.query<ApiResponse<UserResponse>, string>({
      query: (token) => ({
        url: '/auth/verify-email',
        method: 'GET',
        params: { token },
      }),
      providesTags: ['Auth'],
    }),

    // Forgot password
    forgotPassword: builder.mutation<ApiResponse<string>, PasswordResetRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<ApiResponse<string>, PasswordChangeRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get current user
    getMe: builder.query<MeApiResponse, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterOrganizerMutation,
  useVerifyEmailQuery,
  useLazyVerifyEmailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = AuthAPI;
