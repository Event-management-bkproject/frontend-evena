import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { UploadResponse } from '../types/event';


export interface OrganizationFileDTO {
  id: number;
  fileName: string;
  url: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export const FileAPI = createApi({
  reducerPath: 'FileAPI',
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['OrgFile'],
  endpoints: (builder) => ({
    listOrgFiles: builder.query<OrganizationFileDTO[], number>({
      query: (organizationId) => `/organizations/${organizationId}/files`,
      providesTags: (_r, _e, organizationId) => [{ type: 'OrgFile', id: organizationId }],
    }),
    uploadOrgFile: builder.mutation<UploadResponse, { organizationId: number; file: File }>({
      query: ({ organizationId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return { url: `/organizations/${organizationId}/files`, method: 'POST', body: form };
      },
      invalidatesTags: (_r, _e, { organizationId }) => [{ type: 'OrgFile', id: organizationId }],
    }),
    deleteOrgFile: builder.mutation<void, { organizationId: number; fileId: number }>({
      query: ({ organizationId, fileId }) => ({
        url: `/organizations/${organizationId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { organizationId }) => [{ type: 'OrgFile', id: organizationId }],
    }),
  }),
});

export const {
  useListOrgFilesQuery,
  useUploadOrgFileMutation,
  useDeleteOrgFileMutation,
} = FileAPI;
