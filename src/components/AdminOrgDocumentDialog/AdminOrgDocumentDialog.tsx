'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Close,
  InsertDriveFile,
  Description,
  PictureAsPdf,
  Download,
  VerifiedUser,
  FolderOpen,
  CheckCircle,
  OpenInNew,
  ArrowBack,
} from '@mui/icons-material';
import { useListOrgVerificationFilesQuery, OrganizationFileDTO } from '@/src/stores/services/FileApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';

interface Props {
  open: boolean;
  organizationId: number;
  organizationName: string;
  isVerified: boolean;
  onClose: () => void;
  onVerify: () => void;
  isVerifying: boolean;
}

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateFileName(name: string, max = 42): string {
  if (name.length <= max) return name;
  const dotIdx = name.lastIndexOf('.');
  const ext = dotIdx > 0 && name.length - dotIdx <= 6 ? name.slice(dotIdx) : '';
  const allowedBody = max - ext.length - 3;
  return `${name.slice(0, allowedBody > 0 ? allowedBody : max - 3)}...${ext}`;
}

function FileTypeIcon({ contentType, size = 28 }: { contentType: string; size?: number }) {
  if (contentType === 'application/pdf')
    return <PictureAsPdf sx={{ color: '#E53935', fontSize: size }} />;
  if (contentType.includes('word'))
    return <Description sx={{ color: '#1976D2', fontSize: size }} />;
  return <InsertDriveFile sx={{ color: ADMIN.textMuted, fontSize: size }} />;
}

function isPdf(contentType: string) {
  return contentType === 'application/pdf';
}

function isImage(contentType: string) {
  return contentType.startsWith('image/');
}

// ── Inline preview panel ──────────────────────────────────────────────────────
function PreviewPanel({ file }: { file: OrganizationFileDTO }) {
  if (isPdf(file.contentType)) {
    return (
      <Box
        sx={{
          mt: 1.5,
          borderRadius: '10px',
          overflow: 'hidden',
          border: `1px solid ${ADMIN.border}`,
          bgcolor: '#525659',
        }}
      >
        <iframe
          src={file.url}
          title={file.fileName}
          width="100%"
          height="520"
          style={{ display: 'block', border: 'none' }}
        />
      </Box>
    );
  }

  if (isImage(file.contentType)) {
    return (
      <Box
        sx={{
          mt: 1.5,
          borderRadius: '10px',
          overflow: 'hidden',
          border: `1px solid ${ADMIN.border}`,
          bgcolor: ADMIN.pageBg,
          display: 'flex',
          justifyContent: 'center',
          p: 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.fileName}
          style={{ maxWidth: '100%', maxHeight: 520, objectFit: 'contain', borderRadius: 6 }}
        />
      </Box>
    );
  }

  // Word / other — no browser-native preview
  return (
    <Box
      sx={{
        mt: 1.5,
        borderRadius: '10px',
        border: `1px solid ${ADMIN.border}`,
        bgcolor: ADMIN.pageBg,
        p: 4,
        textAlign: 'center',
      }}
    >
      <FileTypeIcon contentType={file.contentType} size={48} />
      <Typography variant="body2" sx={{ color: ADMIN.textSecondary, mt: 1 }}>
        Preview not available for this file type.
      </Typography>
      <Button
        size="small"
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<Download fontSize="small" />}
        sx={{ mt: 1.5, textTransform: 'none', color: ADMIN.primary }}
      >
        Download to view
      </Button>
    </Box>
  );
}

export default function AdminOrgDocumentDialog({
  open,
  organizationId,
  organizationName,
  isVerified,
  onClose,
  onVerify,
  isVerifying,
}: Props) {
  const [previewFile, setPreviewFile] = useState<OrganizationFileDTO | null>(null);

  const { data: files = [], isLoading } = useListOrgVerificationFilesQuery(organizationId, {
    skip: !open,
  });

  const handleClose = () => {
    setPreviewFile(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={previewFile ? 'md' : 'sm'}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          transition: 'max-width 0.2s ease',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {previewFile ? (
              <Tooltip title="Back to file list">
                <IconButton
                  size="small"
                  onClick={() => setPreviewFile(null)}
                  sx={{ color: ADMIN.textSecondary, mr: 0.5 }}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: ADMIN.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <VerifiedUser sx={{ color: ADMIN.primary, fontSize: 22 }} />
              </Box>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ADMIN.heading, lineHeight: 1.2 }}>
                {previewFile ? truncateFileName(previewFile.fileName, 48) : 'Verification Documents'}
              </Typography>
              <Typography variant="caption" sx={{ color: ADMIN.textSecondary }}>
                {organizationName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {previewFile && (
              <Tooltip title="Open in new tab">
                <IconButton
                  size="small"
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: ADMIN.primary }}
                >
                  <OpenInNew fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={handleClose} sx={{ color: ADMIN.textMuted }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {/* ── Preview mode ─────────────────────────────────────────────── */}
        {previewFile ? (
          <PreviewPanel file={previewFile} />
        ) : (
          /* ── File list mode ─────────────────────────────────────────── */
          <>
            {isVerified && (
              <Alert
                icon={<CheckCircle fontSize="small" />}
                severity="success"
                sx={{ mb: 2, borderRadius: '8px', fontSize: 13 }}
              >
                This organization is already verified.
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={32} sx={{ color: ADMIN.primary }} />
              </Box>
            ) : files.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 5,
                  gap: 1,
                }}
              >
                <FolderOpen sx={{ fontSize: 52, color: ADMIN.textMuted }} />
                <Typography variant="body2" sx={{ color: ADMIN.textSecondary, textAlign: 'center' }}>
                  No verification documents uploaded yet.
                  <br />
                  The organizer has not submitted proof documents.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: ADMIN.textSecondary, mb: 0.5 }}>
                  {files.length} document{files.length !== 1 ? 's' : ''} submitted for review — click to preview
                </Typography>

                {files.map((f) => (
                  <Box
                    key={f.id}
                    onClick={() => setPreviewFile(f)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: '10px',
                      border: `1px solid ${ADMIN.border}`,
                      bgcolor: ADMIN.surfaceBg,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: ADMIN.primaryLight,
                        borderColor: ADMIN.primary,
                      },
                      transition: 'all 0.15s',
                    }}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      <FileTypeIcon contentType={f.contentType} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={f.fileName} placement="top" enterDelay={400}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: ADMIN.heading, display: 'block' }}
                        >
                          {truncateFileName(f.fileName)}
                        </Typography>
                      </Tooltip>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25 }}>
                        <Chip
                          label={formatBytes(f.fileSize)}
                          size="small"
                          sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }}
                        />
                        <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                          {formatDate(f.uploadedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ color: ADMIN.textMuted, '&:hover': { color: ADMIN.primary, bgcolor: ADMIN.primaryLight } }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <Divider sx={{ mt: 1 }} />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: ADMIN.border,
            color: ADMIN.body,
            '&:hover': { borderColor: ADMIN.textMuted, bgcolor: ADMIN.pageBg },
          }}
        >
          Close
        </Button>
        {!isVerified && (
          <Button
            onClick={onVerify}
            disabled={isVerifying || files.length === 0}
            variant="contained"
            startIcon={
              isVerifying ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CheckCircle />
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: ADMIN.success,
              '&:hover': { bgcolor: '#059669' },
              '&.Mui-disabled': { bgcolor: ADMIN.border, color: ADMIN.textMuted },
            }}
          >
            {isVerifying ? 'Verifying…' : 'Verify Organization'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
