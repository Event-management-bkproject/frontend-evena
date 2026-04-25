import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';

export interface ActivityLogEntry {
  id: number;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  eventId?: string;
  description: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface ActivityLogPage {
  content: ActivityLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ActivityLogFilter {
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const ActivityLogAPI = createApi({
  reducerPath: 'ActivityLogAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['ActivityLog'],
  keepUnusedDataFor: 30,
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogPage, ActivityLogFilter>({
      query: (params = {}) => ({
        url: '/activity-log',
        method: 'GET',
        params: {
          ...(params.action ? { action: params.action } : {}),
          ...(params.entityType ? { entityType: params.entityType } : {}),
          ...(params.from ? { from: params.from } : {}),
          ...(params.to ? { to: params.to } : {}),
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
      providesTags: ['ActivityLog'],
    }),
  }),
});

export const { useGetActivityLogsQuery } = ActivityLogAPI;
