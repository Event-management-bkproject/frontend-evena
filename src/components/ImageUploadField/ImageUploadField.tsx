'use client';

import { useRef, useState } from 'react';
import { Box, Typography, Button, CircularProgress, IconButton, TextField, Divider } from '@mui/material';
import { CloudUpload, Clear } from '@mui/icons-material';
import { useField, useFormikContext } from 'formik';

interface ImageUploadFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  /** Called with the selected File; must return a Promise that resolves to the public URL. */
  uploadFn: (file: File) => Promise<string>;
  previewHeight?: number;
}

const ImageUploadField = ({
  name,
  label,
  required = false,
  disabled = false,
  uploadFn,
  previewHeight = 180,
}: ImageUploadFieldProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [urlDraft, setUrlDraft] = useState('');

  const hasError = meta.touched && Boolean(meta.error);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadFn(file);
      await setFieldValue(name, url, false);
      setFieldTouched(name, true, true);
      setUrlDraft('');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Upload failed';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlConfirm = () => {
    const trimmed = urlDraft.trim();
    if (trimmed) {
      setFieldValue(name, trimmed, false);
      setFieldTouched(name, true, true);
      setUrlDraft('');
    }
  };

  const handleClear = () => {
    setFieldValue(name, '');
    setFieldTouched(name, true);
    setUrlDraft('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Typography
          variant="body1"
          component="label"
          sx={{ display: 'block', fontWeight: 540, color: '#37437D', fontSize: '16px', mb: 1 }}
        >
          {label}
          {required && ' *'}
        </Typography>
      )}

      {/* Image preview */}
      {field.value && (
        <Box
          sx={{
            mb: 1.5,
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #E0E0E0',
            height: previewHeight,
            position: 'relative',
          }}
        >
          <img
            src={field.value}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!disabled && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                backgroundColor: 'rgba(0,0,0,0.45)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
              }}
            >
              <Clear fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}

      {!disabled && (
        <>
          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {uploading ? 'Uploading…' : field.value ? 'Change Image' : 'Upload Image'}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
            JPEG, PNG, WEBP — max 5 MB
          </Typography>

          {/* URL input row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
            <Divider sx={{ flex: 0, width: 24 }} />
            <Typography variant="caption" color="text.secondary">or paste URL</Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="https://example.com/image.jpg"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlConfirm(); } }}
              disabled={uploading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&.Mui-focused fieldset': { borderColor: '#f36bf9' },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleUrlConfirm}
              disabled={!urlDraft.trim() || uploading}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                backgroundColor: '#f36bf9',
                flexShrink: 0,
                '&:hover': { backgroundColor: '#e55ae0' },
              }}
            >
              Apply
            </Button>
          </Box>
        </>
      )}

      {uploadError && (
        <Typography variant="caption" sx={{ display: 'block', color: '#d32f2f', mt: 0.5 }}>
          {uploadError}
        </Typography>
      )}
      {hasError && (
        <Typography variant="caption" sx={{ display: 'block', color: '#d32f2f', mt: 0.5, ml: 1.5 }}>
          {meta.error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUploadField;
