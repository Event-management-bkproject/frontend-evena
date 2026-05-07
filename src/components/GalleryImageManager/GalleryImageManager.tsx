'use client';

import { useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { CloudUpload, Close, AddPhotoAlternate } from '@mui/icons-material';
import {
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
} from '@/src/stores/services/EventApi';
import { BRAND } from '@/src/utils/constants/constant';
import { LAYOUT } from '@/src/utils/constants/layout';

interface GalleryImageManagerProps {
  eventId: string;
  imageUrls: string[];
}

export default function GalleryImageManager({ eventId, imageUrls }: GalleryImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const [uploadGallery, { isLoading: isUploading }] = useUploadGalleryImageMutation();
  const [deleteGallery] = useDeleteGalleryImageMutation();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      await uploadGallery({ eventId, file: form }).unwrap();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Upload failed';
      setUploadError(msg);
    }
  }

  async function handleDelete(url: string) {
    setDeletingUrl(url);
    setUploadError(null);
    try {
      await deleteGallery({ eventId, url }).unwrap();
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Delete failed';
      setUploadError(msg);
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: BRAND.dark }}>
          Additional Images
        </Typography>
        <Tooltip title="Upload image (JPEG, PNG, WEBP — max 5 MB)">
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={isUploading ? <CircularProgress size={14} /> : <AddPhotoAlternate />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              sx={{ borderRadius: LAYOUT.radius.sm, textTransform: 'none' }}
            >
              {isUploading ? 'Uploading…' : 'Add Image'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      {uploadError && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: LAYOUT.radius.sm }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {imageUrls.length === 0 ? (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${BRAND.borderLight}`,
            borderRadius: LAYOUT.radius.md,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': { borderColor: BRAND.primary, color: BRAND.primary },
            transition: 'all 0.2s',
          }}
        >
          <CloudUpload sx={{ fontSize: 36, mb: 0.5 }} />
          <Typography variant="body2">Click to add gallery images</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: 5 },
            '&::-webkit-scrollbar-track': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.bgSection },
            '&::-webkit-scrollbar-thumb': { borderRadius: LAYOUT.radius.pill, bgcolor: BRAND.primary },
          }}
        >
          {imageUrls.map((url, idx) => (
            <Box
              key={url}
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: 90,
                height: 90,
                borderRadius: LAYOUT.radius.sm,
                overflow: 'hidden',
                border: `1px solid ${BRAND.border}`,
                '&:hover .remove-btn': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Gallery ${idx + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                className="remove-btn"
                size="small"
                onClick={() => handleDelete(url)}
                disabled={deletingUrl === url}
                sx={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  opacity: 0,
                  transition: 'opacity 0.15s',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  p: '3px',
                  '&:hover': { backgroundColor: 'rgba(200,0,0,0.8)' },
                }}
              >
                {deletingUrl === url
                  ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                  : <Close sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
          ))}

          {/* Add more tile */}
          <Box
            onClick={() => !isUploading && fileInputRef.current?.click()}
            sx={{
              flexShrink: 0,
              width: 90,
              height: 90,
              borderRadius: LAYOUT.radius.sm,
              border: `2px dashed ${BRAND.borderLight}`,
              cursor: isUploading ? 'default' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              '&:hover': { borderColor: BRAND.primary },
              transition: 'all 0.2s',
            }}
          >
            {isUploading
              ? <CircularProgress size={20} sx={{ color: BRAND.primary }} />
              : <AddPhotoAlternate sx={{ fontSize: 22 }} />}
          </Box>
        </Box>
      )}
    </Box>
  );
}
