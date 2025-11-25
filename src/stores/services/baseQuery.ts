// baseQuery.ts
import { BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Lấy token từ Redux store (chỉ hoạt động trên client)
  const state = api.getState() as RootState;
  const token = state.auth?.accessToken;
  // Tạo args đã được modify với header authorization
  const modifiedArgs = typeof args === 'string' ? { url: args } : { ...args };

  // Thêm headers nếu chưa có
  if (!modifiedArgs.headers) {
    modifiedArgs.headers = {};
  }

  // Thêm authorization header nếu có token
  if (token) {
    (modifiedArgs.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const result = await baseQuery(modifiedArgs, api, extraOptions);

  return result;
};
