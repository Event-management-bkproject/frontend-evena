'use client';

import React, { useState } from 'react';
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
  LinearProgress,
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
  HourglassEmpty,
  Science,
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

// ── Analysis helpers ──────────────────────────────────────────────────────────
function parseJsonSafe<T>(str: string | null | undefined): T | null {
  if (!str) return null;
  try { return JSON.parse(str) as T; } catch { return null; }
}

function formatReason(reason: string): string {
  return reason
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface OcrSummary {
  ocrAverageConfidence?: number;
  ocrEngine?: string;
  ocrLineCount?: number;
  ocrTextPreview?: string;
}

function AnalysisChips({ file }: { file: OrganizationFileDTO }) {
  const { analysisStatus, analysisRecommendation, analysisConfidence } = file;
  if (!analysisStatus) return null;

  if (analysisStatus === 'PENDING_ANALYSIS') {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        <Chip
          icon={<HourglassEmpty sx={{ fontSize: '11px !important' }} />}
          label="AI Analyzing…"
          size="small"
          sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }}
        />
      </Box>
    );
  }

  const isPassed = analysisRecommendation === 'PASS';
  const confidence = analysisConfidence != null ? `${Math.round(Number(analysisConfidence) * 100)}%` : null;

  return (
    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
      <Chip
        label={isPassed ? 'AI Passed' : 'Review Required'}
        size="small"
        sx={{
          height: 18, fontSize: 10, fontWeight: 600,
          bgcolor: isPassed ? ADMIN.successBg : ADMIN.warningBg,
          color: isPassed ? ADMIN.successText : ADMIN.warningText,
        }}
      />
      {confidence && (
        <Chip
          label={`${confidence} confidence`}
          size="small"
          sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }}
        />
      )}
    </Box>
  );
}

function AnalysisDetailsPanel({ file }: { file: OrganizationFileDTO }) {
  const {
    analysisStatus, analysisRecommendation, analysisConfidence,
    analysisReasons, analysisSummary, analyzerProvider, analyzerName, analyzedAt,
  } = file;

  if (!analysisStatus) return null;

  const reasons = parseJsonSafe<string[]>(analysisReasons) ?? [];
  const summary = parseJsonSafe<OcrSummary>(analysisSummary);
  const confidence = analysisConfidence != null ? Number(analysisConfidence) : null;
  const isPassed = analysisRecommendation === 'PASS';
  const isPending = analysisStatus === 'PENDING_ANALYSIS';

  return (
    <Box sx={{ mt: 1.5, borderRadius: '10px', border: `1px solid ${ADMIN.border}`, overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1.25,
          bgcolor: isPending ? ADMIN.pageBg : isPassed ? ADMIN.successBg : ADMIN.warningBg,
          display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: `1px solid ${ADMIN.border}`,
        }}
      >
        <Science sx={{ fontSize: 16, color: isPending ? ADMIN.textMuted : isPassed ? ADMIN.successText : ADMIN.warningText }} />
        <Typography variant="caption" fontWeight={700} sx={{ color: isPending ? ADMIN.textSecondary : isPassed ? ADMIN.successText : ADMIN.warningText }}>
          AI Document Analysis
        </Typography>
        {isPending ? (
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircularProgress size={10} sx={{ color: ADMIN.textMuted }} />
            <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>Processing…</Typography>
          </Box>
        ) : (
          <Chip
            label={isPassed ? 'PASSED' : 'REVIEW REQUIRED'}
            size="small"
            sx={{
              ml: 'auto', height: 18, fontSize: 10, fontWeight: 700,
              bgcolor: isPassed ? ADMIN.success : ADMIN.warning,
              color: '#fff',
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Confidence bar */}
        {confidence !== null && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: ADMIN.textSecondary }}>Confidence</Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: isPassed ? ADMIN.success : ADMIN.warning }}>
                {Math.round(confidence * 100)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={confidence * 100}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: ADMIN.border,
                '& .MuiLinearProgress-bar': { bgcolor: isPassed ? ADMIN.success : ADMIN.warning, borderRadius: 3 },
              }}
            />
          </Box>
        )}

        {/* Flags / reasons */}
        {reasons.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ color: ADMIN.textSecondary, display: 'block', mb: 0.5 }}>Flags</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {reasons.map((r) => (
                <Chip
                  key={r}
                  label={formatReason(r)}
                  size="small"
                  sx={{ height: 20, fontSize: 10, bgcolor: ADMIN.errorBg, color: ADMIN.errorText }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* OCR details */}
        {summary && (
          <Box>
            <Typography variant="caption" sx={{ color: ADMIN.textSecondary, display: 'block', mb: 0.5 }}>OCR Extraction</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
              {summary.ocrLineCount != null && (
                <Chip label={`${summary.ocrLineCount} lines`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }} />
              )}
              {summary.ocrAverageConfidence != null && (
                <Chip label={`OCR: ${Math.round(summary.ocrAverageConfidence * 100)}%`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }} />
              )}
              {summary.ocrEngine && (
                <Chip label={summary.ocrEngine} size="small" sx={{ height: 18, fontSize: 10, bgcolor: ADMIN.border, color: ADMIN.textSecondary }} />
              )}
            </Box>
            {summary.ocrTextPreview && (
              <Box
                sx={{
                  borderRadius: '6px',
                  border: `1px solid ${ADMIN.border}`,
                  bgcolor: ADMIN.pageBg,
                  p: 1,
                  maxHeight: 96,
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: ADMIN.textSecondary,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    display: 'block',
                    lineHeight: 1.4,
                  }}
                >
                  {summary.ocrTextPreview.length > 400
                    ? `${summary.ocrTextPreview.slice(0, 400)}…`
                    : summary.ocrTextPreview}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Analyzer metadata */}
        {analyzedAt && (
          <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
            Analyzed {new Date(analyzedAt).toLocaleString('en-GB')}
            {analyzerProvider && ` · ${analyzerProvider}`}
            {analyzerName && ` / ${analyzerName}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── Inline preview panel ──────────────────────────────────────────────────────
function PreviewPanel({ file }: { file: OrganizationFileDTO }) {
  let preview: React.ReactNode;

  if (isPdf(file.contentType)) {
    preview = (
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
  } else if (isImage(file.contentType)) {
    preview = (
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
  } else {
    preview = (
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

  return (
    <>
      {preview}
      <AnalysisDetailsPanel file={file} />
    </>
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
                      <AnalysisChips file={f} />
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
