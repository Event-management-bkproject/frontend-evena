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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  Download,
  Description,
  PictureAsPdf,
  VerifiedUser,
  Lock,
} from '@mui/icons-material';
import {
  useListOrgFilesQuery,
  useUploadOrgFileMutation,
  useDeleteOrgFileMutation,
  OrganizationFileDTO,
  OrganizationFileType,
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
  isOwner?: boolean;
}

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

function truncateFileName(name: string, max = 36): string {
  if (name.length <= max) return name;
  const dotIdx = name.lastIndexOf('.');
  const ext = dotIdx > 0 && name.length - dotIdx <= 6 ? name.slice(dotIdx) : '';
  const allowedBody = max - ext.length - 3;
  return `${name.slice(0, allowedBody > 0 ? allowedBody : max - 3)}...${ext}`;
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType === 'application/pdf')
    return <PictureAsPdf sx={{ color: BRAND.iconPdf }} />;
  if (contentType.includes('word'))
    return <Description sx={{ color: BRAND.iconWord }} />;
  return <InsertDriveFile sx={{ color: BRAND.iconFile }} />;
}

function FileTypeBadge({ fileType }: { fileType?: OrganizationFileType }) {
  if (!fileType) return null;
  if (fileType === 'VERIFICATION') {
    return (
      <Chip
        icon={<VerifiedUser sx={{ fontSize: '12px !important' }} />}
        label="Verification"
        size="small"
        sx={{
          height: 18,
          fontSize: 10,
          fontWeight: 600,
          bgcolor: 'rgba(76,175,80,0.12)',
          color: '#388e3c',
          '& .MuiChip-icon': { color: '#388e3c' },
        }}
      />
    );
  }
  return (
    <Chip
      icon={<Lock sx={{ fontSize: '12px !important' }} />}
      label="Internal"
      size="small"
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 600,
        bgcolor: 'rgba(55,67,125,0.10)',
        color: '#37437D',
        '& .MuiChip-icon': { color: '#37437D' },
      }}
    />
  );
}

export default function FileUploadManager({ mode, title = 'Documents', isOwner }: FileUploadManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const canSeeVerification = mode.type !== 'organization' || isOwner !== false;
  const [activeTab, setActiveTab] = useState<OrganizationFileType>(canSeeVerification ? 'VERIFICATION' : 'INTERNAL');

  const orgId   = mode.type === 'organization' ? mode.organizationId : 0;
  const eventId = mode.type === 'event'        ? mode.eventId        : '';

  const { data: orgFilesRes,   isLoading: orgLoading   } = useListOrgFilesQuery(orgId,   { skip: mode.type !== 'organization' });
  const [uploadOrgFile,   { isLoading: orgUploading   }] = useUploadOrgFileMutation();
  const [deleteOrgFile]                                   = useDeleteOrgFileMutation();

  const { data: eventFilesRes, isLoading: eventLoading } = useListEventFilesQuery(eventId, { skip: mode.type !== 'event' });
  const [uploadEventFile, { isLoading: eventUploading }] = useUploadEventFileMutation();
  const [deleteEventFile]                                 = useDeleteEventFileMutation();

  const isLoading   = mode.type === 'organization' ? orgLoading   : eventLoading;
  const isUploading = mode.type === 'organization' ? orgUploading : eventUploading;

  const allOrgFiles: OrganizationFileDTO[] = orgFilesRes ?? [];
  const eventFiles: EventFileDTO[]         = eventFilesRes ?? [];

  const visibleFiles: (OrganizationFileDTO | EventFileDTO)[] =
    mode.type === 'organization'
      ? allOrgFiles.filter((f) => f.fileType === activeTab)
      : eventFiles;

  const verificationCount = allOrgFiles.filter((f) => f.fileType === 'VERIFICATION').length;
  const internalCount     = allOrgFiles.filter((f) => f.fileType === 'INTERNAL').length;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    const file = fileList[0];
    try {
      if (mode.type === 'organization') {
        await uploadOrgFile({ organizationId: mode.organizationId, file, fileType: activeTab }).unwrap();
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

      {/* Tab selector — only for organization mode, and only if user can see both tabs */}
      {mode.type === 'organization' && canSeeVerification && (
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(_, v) => v && setActiveTab(v)}
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: `${LAYOUT.radius.sm} !important`,
                border: `1px solid ${BRAND.borderLight} !important`,
                py: 0.75,
                gap: 0.8,
              },
              '& .Mui-selected': {
                bgcolor: `${BRAND.primary}15 !important`,
                color: `${BRAND.primary} !important`,
                borderColor: `${BRAND.primary} !important`,
              },
            }}
          >
            <ToggleButton value="VERIFICATION">
              <VerifiedUser sx={{ fontSize: 16 }} />
              Verification
              {verificationCount > 0 && (
                <Chip label={verificationCount} size="small" sx={{ ml: 0.5, height: 16, fontSize: 10, bgcolor: '#e8f5e9', color: '#388e3c' }} />
              )}
            </ToggleButton>
            <ToggleButton value="INTERNAL">
              <Lock sx={{ fontSize: 16 }} />
              Internal
              {internalCount > 0 && (
                <Chip label={internalCount} size="small" sx={{ ml: 0.5, height: 16, fontSize: 10, bgcolor: '#eef0ff', color: '#37437D' }} />
              )}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Context hint per tab */}
          <Box sx={{ mt: 1, px: 0.5 }}>
            {activeTab === 'VERIFICATION' ? (
              <Typography variant="caption" sx={{ color: '#388e3c', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUser sx={{ fontSize: 12 }} />
                Visible to admin for organization review
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: '#37437D', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Lock sx={{ fontSize: 12 }} />
                Private — only visible to your organization
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Drop zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? BRAND.primary : BRAND.borderLight}`,
          borderRadius: LAYOUT.radius.md,
          p: 3,
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
            <CloudUpload sx={{ fontSize: 36, color: BRAND.textMuted, mb: 0.5 }} />
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
      ) : visibleFiles.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No {mode.type === 'organization' ? (activeTab === 'VERIFICATION' ? 'verification' : 'internal') : ''} documents yet
        </Typography>
      ) : (
        <Box
          sx={{
            mt: 2,
            ...(visibleFiles.length > SCROLL_AFTER && {
              maxHeight: SCROLL_AFTER * ITEM_H,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.bgSection },
              '&::-webkit-scrollbar-thumb': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.primary },
            }),
          }}
        >
          {visibleFiles.map((f) => (
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
              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <FileIcon contentType={f.contentType} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Tooltip title={f.fileName} placement="top" enterDelay={400}>
                  <Typography variant="body2" fontWeight={600} sx={{ display: 'block', cursor: 'default' }}>
                    {truncateFileName(f.fileName)}
                  </Typography>
                </Tooltip>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25, flexWrap: 'wrap' }}>
                  <Chip label={formatBytes(f.fileSize)} size="small" sx={{ height: 18, fontSize: 11 }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(f.uploadedAt)}
                  </Typography>
                  {'fileType' in f && <FileTypeBadge fileType={f.fileType} />}
                </Box>
              </Box>

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
