import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReAuth } from './baseQuery';
import { UploadResponse } from '../types/event';

export type OrganizationFileType = 'VERIFICATION' | 'INTERNAL';

export interface OrganizationFileDTO {
  id: number;
  fileName: string;
  url: string;
  contentType: string;
  fileSize: number;
  fileType: OrganizationFileType;
  uploadedAt: string;
  storageBucket: string | null;
  objectKey: string | null;
  objectETag: string | null;
  objectVersionId: string | null;
  analysisJobId: string | null;
  analysisCorrelationId: string | null;
  /** PENDING_ANALYSIS | NEEDS_REVIEW | COMPLETED | FAILED */
  analysisStatus: string | null;
  /** PASS | REVIEW_REQUIRED */
  analysisRecommendation: string | null;
  analysisConfidence: number | null;
  analysisReasons: string | null;   // JSON array string
  analysisSummary: string | null;   // JSON object string with OCR details
  analyzerProvider: string | null;
  analyzerName: string | null;
  analyzerVersion: string | null;
  analyzedAt: string | null;
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
    listOrgVerificationFiles: builder.query<OrganizationFileDTO[], number>({
      query: (organizationId) => `/organizations/${organizationId}/files/verification`,
      providesTags: (_r, _e, organizationId) => [{ type: 'OrgFile', id: `${organizationId}-verification` }],
    }),
    uploadOrgFile: builder.mutation<UploadResponse, { organizationId: number; file: File; fileType?: OrganizationFileType }>({
      query: ({ organizationId, file, fileType = 'INTERNAL' }) => {
        const form = new FormData();
        form.append('file', file);
        form.append('fileType', fileType);
        return { url: `/organizations/${organizationId}/files`, method: 'POST', body: form };
      },
      invalidatesTags: (_r, _e, { organizationId }) => [
        { type: 'OrgFile', id: organizationId },
        { type: 'OrgFile', id: `${organizationId}-verification` },
      ],
    }),
    deleteOrgFile: builder.mutation<void, { organizationId: number; fileId: number }>({
      query: ({ organizationId, fileId }) => ({
        url: `/organizations/${organizationId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { organizationId }) => [
        { type: 'OrgFile', id: organizationId },
        { type: 'OrgFile', id: `${organizationId}-verification` },
      ],
    }),
  }),
});

export const {
  useListOrgFilesQuery,
  useListOrgVerificationFilesQuery,
  useUploadOrgFileMutation,
  useDeleteOrgFileMutation,
} = FileAPI;
