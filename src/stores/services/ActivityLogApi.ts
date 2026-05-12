import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';

export interface ActivityLogEntry {
  id: number;
  actorId: string;
  actorName?: string;
  actorRole: string;
  ownerUserId?: string;
  ownerName?: string;
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
  entityId?: string;
  actorId?: string;
  from?: string;
  to?: string;
  sort?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface ActivityLogStats {
  activitiesToday: number;
  criticalToday: number;
  activeActors: number;
  topAction: string;
  topActionCount: number;
  yesterdayCount: number;
  criticalYesterday: number;
}

export interface HourlyCount {
  hourLabel: string;
  count: number;
  isSpike: boolean;
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
          ...(params.action     ? { action: params.action }         : {}),
          ...(params.entityType ? { entityType: params.entityType } : {}),
          ...(params.entityId   ? { entityId: params.entityId }     : {}),
          ...(params.actorId    ? { actorId: params.actorId }       : {}),
          ...(params.from       ? { from: params.from }             : {}),
          ...(params.to         ? { to: params.to }                 : {}),
          sort: params.sort ?? 'DESC',
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      }),
      providesTags: ['ActivityLog'],
    }),

    getEntityTimeline: builder.query<ActivityLogPage, { entityType: string; entityId: string; page?: number; size?: number }>({
      query: ({ entityType, entityId, page = 0, size = 50 }) => ({
        url: '/activity-log/timeline',
        method: 'GET',
        params: { entityType, entityId, page, size },
      }),
      providesTags: (_result, _err, arg) => [{ type: 'ActivityLog', id: `${arg.entityType}-${arg.entityId}` }],
    }),

    getActivityLogStats: builder.query<ActivityLogStats, void>({
      query: () => ({ url: '/activity-log/stats', method: 'GET' }),
      providesTags: ['ActivityLog'],
    }),

    getActivityLogHourly: builder.query<HourlyCount[], void>({
      query: () => ({ url: '/activity-log/hourly', method: 'GET' }),
      providesTags: ['ActivityLog'],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
  useGetEntityTimelineQuery,
  useGetActivityLogStatsQuery,
  useGetActivityLogHourlyQuery,
} = ActivityLogAPI;
