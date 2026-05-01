'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  Download,
  Description,
  PictureAsPdf,
} from '@mui/icons-material';
import {
  useListOrgFilesQuery,
  useUploadOrgFileMutation,
  useDeleteOrgFileMutation,
  OrganizationFileDTO,
} from '@/src/stores/services/FileApi';
import {
  useListEventFilesQuery,
  useUploadEventFileMutation,
  useDeleteEventFileMutation,
} from '@/src/stores/services/EventApi';
import { EventFileDTO } from '@/src/stores/types/event';
import { BRAND } from '@/src/utils/constants/constant';
import { LAYOUT } from '@/src/utils/constants/layout';

type Mode =
  | { type: 'organization'; organizationId: number }
  | { type: 'event'; eventId: string };

interface FileUploadManagerProps {
  mode: Mode;
  title?: string;
}

// Approximate height of one list item (py:1 padding + content + mb:1 margin)
const ITEM_H = 72;
const SCROLL_AFTER = 4;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Truncate filename preserving extension: "Very Long Name...pdf"
function truncateFileName(name: string, max = 36): string {
  if (name.length <= max) return name;
  const dotIdx = name.lastIndexOf('.');
  const ext = dotIdx > 0 && name.length - dotIdx <= 6 ? name.slice(dotIdx) : '';
  const allowedBody = max - ext.length - 3; // 3 = "..."
  return `${name.slice(0, allowedBody > 0 ? allowedBody : max - 3)}...${ext}`;
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType === 'application/pdf')
    return <PictureAsPdf sx={{ color: BRAND.iconPdf }} />;
  if (contentType.includes('word'))
    return <Description sx={{ color: BRAND.iconWord }} />;
  return <InsertDriveFile sx={{ color: BRAND.iconFile }} />;
}

export default function FileUploadManager({ mode, title = 'Documents' }: FileUploadManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const orgId   = mode.type === 'organization' ? mode.organizationId : 0;
  const eventId = mode.type === 'event'        ? mode.eventId        : '';

  const { data: orgFilesRes,   isLoading: orgLoading   } = useListOrgFilesQuery(orgId,   { skip: mode.type !== 'organization' });
  const [uploadOrgFile,   { isLoading: orgUploading   }] = useUploadOrgFileMutation();
  const [deleteOrgFile]                                   = useDeleteOrgFileMutation();

  const { data: eventFilesRes, isLoading: eventLoading } = useListEventFilesQuery(eventId, { skip: mode.type !== 'event' });
  const [uploadEventFile, { isLoading: eventUploading }] = useUploadEventFileMutation();
  const [deleteEventFile]                                 = useDeleteEventFileMutation();

  const files: (OrganizationFileDTO | EventFileDTO)[] =
    mode.type === 'organization' ? (orgFilesRes ?? []) : (eventFilesRes ?? []);

  const isLoading   = mode.type === 'organization' ? orgLoading   : eventLoading;
  const isUploading = mode.type === 'organization' ? orgUploading : eventUploading;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    const file = fileList[0];
    try {
      if (mode.type === 'organization') {
        await uploadOrgFile({ organizationId: mode.organizationId, file }).unwrap();
      } else {
        const form = new FormData();
        form.append('file', file);
        await uploadEventFile({ eventId: mode.eventId, file: form }).unwrap();
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Upload failed';
      setUploadError(msg);
    }
  }

  async function handleDelete(fileId: number) {
    if (mode.type === 'organization') {
      await deleteOrgFile({ organizationId: mode.organizationId, fileId });
    } else {
      await deleteEventFile({ eventId: mode.eventId, fileId });
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: BRAND.dark }}>
        {title}
      </Typography>

      {/* Drop zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? BRAND.primary : BRAND.borderLight}`,
          borderRadius: LAYOUT.radius.md,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? 'rgba(243,107,249,0.04)' : BRAND.bgSurface,
          transition: 'all 0.2s',
          '&:hover': { borderColor: BRAND.primary, backgroundColor: 'rgba(243,107,249,0.04)' },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
        {isUploading ? (
          <CircularProgress size={32} sx={{ color: BRAND.primary }} />
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 40, color: BRAND.textMuted, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Drag & drop or{' '}
              <strong style={{ color: BRAND.primary }}>browse files</strong>{' '}
              to upload
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PDF, Word — max 20 MB
            </Typography>
          </>
        )}
      </Box>

      {uploadError && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: LAYOUT.radius.sm }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* File list */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : files.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No documents yet
        </Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            ...(files.length > SCROLL_AFTER && {
              maxHeight: SCROLL_AFTER * ITEM_H,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.bgSection },
              '&::-webkit-scrollbar-thumb': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.primary },
            }),
          }}
        >
          {files.map((f) => (
            <Box
              key={f.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
                px: 2,
                py: 1,
                borderRadius: LAYOUT.radius.sm,
                border: `1px solid ${BRAND.border}`,
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: BRAND.bgSurface },
                minWidth: 0,
              }}
            >
              {/* File type icon */}
              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <FileIcon contentType={f.contentType} />
              </Box>

              {/* File info */}
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Tooltip title={f.fileName} placement="top" enterDelay={400}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ display: 'block', cursor: 'default' }}
                  >
                    {truncateFileName(f.fileName)}
                  </Typography>
                </Tooltip>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25 }}>
                  <Chip label={formatBytes(f.fileSize)} size="small" sx={{ height: 18, fontSize: 11 }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(f.uploadedAt)}
                  </Typography>
                </Box>
              </Box>

              {/* Actions — flexShrink: 0 so they never get squeezed */}
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Download">
                  <IconButton size="small" href={f.url} target="_blank" rel="noopener noreferrer">
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => handleDelete(f.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
