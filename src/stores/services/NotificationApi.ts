import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { ApiResponse } from '../types/auth';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export const NotificationAPI = createApi({
  reducerPath: 'NotificationAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Notification'],
  keepUnusedDataFor: 30,
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<NotificationItem[]>, void>({
      query: () => ({ url: '/notifications', method: 'GET' }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    getUnreadCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => ({ url: '/notifications/unread-count', method: 'GET' }),
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),

    markRead: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),

    markAllRead: builder.mutation<ApiResponse<void>, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = NotificationAPI;
