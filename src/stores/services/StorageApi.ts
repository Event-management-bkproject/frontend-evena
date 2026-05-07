import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { UploadResponse } from '../types/event';

export const StorageAPI = createApi({
  reducerPath: 'StorageAPI',
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const form = new FormData();
        form.append('file', file);
        return { url: '/storage/images', method: 'POST', body: form };
      },
    }),
  }),
});

export const { useUploadImageMutation } = StorageAPI;
