/**
 * CreateEventForm - Updated with MinIO/S3 file upload support
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Image URL management
 * - Submit handling
 * - Optimistic locking conflict detection
 *
 * ADDED:
 * - When eventId is provided (edit mode): file upload buttons for cover + gallery
 * - When no eventId (create mode): URL text inputs (unchanged)
 */
'use client';

import { useRef, useState } from 'react';
import { Box, Button, MenuItem, Chip, Typography, Alert, CircularProgress, IconButton } from '@mui/material';
import { FormikHelpers, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import FormTextField from '../FormTextField';
import FormDateTimePicker from '../FormDateTimePicker';
import { eventSchema, updateEventSchema } from '@/src/utils/validationSchema/eventValidationSchema';
import Forms from '../Forms';
import FormTextareaField from '../FormTextAreaField';
import { EventFormData } from '@/src/stores/types';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';
import {
  useUploadEventCoverMutation,
  useUploadGalleryImageMutation,
  useDeleteGalleryImageMutation,
} from '@/src/stores/services/EventApi';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface CreateEventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  hasConflict?: boolean;
  conflictMessage?: string;
  initialValues?: Partial<EventFormData>;
  organizers: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  venues: Array<{ id: number; name: string }>;
  isEdit?: boolean;
  isPublished?: boolean;
  /** When provided (edit mode), enables file upload instead of URL text inputs */
  eventId?: string;
}

// Inner component: cover image upload (uses useFormikContext — must be rendered inside <Forms>)
const CoverImageUpload = ({
  eventId,
  onError,
}: {
  eventId: string;
  onError: (msg: string) => void;
}) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<EventFormData>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCover, { isLoading }] = useUploadEventCoverMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await uploadCover({ eventId, file: formData }).unwrap();
      if (result.url) {
        setFieldValue('coverUrl', result.url);
      }
    } catch (err: any) {
      onError(err?.data?.message || t('messages.error.uploadFailed', { defaultValue: 'Upload failed' }));
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ display: 'block', mb: 2, fontWeight: 600, color: '#37437D', fontSize: '1rem' }}
      >
        {t('event.form.coverImage')}
      </Typography>

      {values.coverUrl && (
        <Box
          sx={{
            mb: 2,
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #E0E0E0',
            position: 'relative',
            height: 200,
          }}
        >
          <img
            src={values.coverUrl}
            alt="Cover preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={isLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        sx={{ borderRadius: '10px', textTransform: 'none' }}
      >
        {isLoading
          ? t('common.uploading', { defaultValue: 'Uploading…' })
          : values.coverUrl
            ? t('event.form.changeCover', { defaultValue: 'Change Cover Image' })
            : t('event.form.uploadCover', { defaultValue: 'Upload Cover Image' })}
      </Button>
    </Box>
  );
};

// Inner component: gallery image upload (uses useFormikContext — must be rendered inside <Forms>)
const GalleryUpload = ({
  eventId,
  imageUrls,
  setImageUrls,
  onError,
}: {
  eventId: string;
  imageUrls: string[];
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  onError: (msg: string) => void;
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadGallery, { isLoading: isUploadingGallery }] = useUploadGalleryImageMutation();
  const [deleteGallery, { isLoading: isDeletingGallery }] = useDeleteGalleryImageMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await uploadGallery({ eventId, file: formData }).unwrap();
      if (result.url) {
        setImageUrls((prev) => [...prev, result.url]);
      }
    } catch (err: any) {
      onError(err?.data?.message || t('messages.error.uploadFailed', { defaultValue: 'Upload failed' }));
    }
  };

  const handleDelete = async (url: string) => {
    try {
      await deleteGallery({ eventId, url }).unwrap();
      setImageUrls((prev) => prev.filter((u) => u !== url));
    } catch (err: any) {
      onError(err?.data?.message || t('messages.error.deleteFailed', { defaultValue: 'Delete failed' }));
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #E0E0E0',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ display: 'block', mb: 2, fontWeight: 600, color: '#37437D', fontSize: '1rem' }}
      >
        {t('event.form.additionalImages')}
      </Typography>

      {imageUrls.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          {imageUrls.map((url, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E0E0E0',
              }}
            >
              <img src={url} alt={`Gallery ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                size="small"
                onClick={() => handleDelete(url)}
                disabled={isDeletingGallery}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  p: 0.5,
                  '&:hover': { backgroundColor: 'rgba(200,0,0,0.8)' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={isUploadingGallery ? <CircularProgress size={16} /> : <CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploadingGallery}
        sx={{ borderRadius: '10px', textTransform: 'none' }}
      >
        {isUploadingGallery
          ? t('common.uploading', { defaultValue: 'Uploading…' })
          : t('event.form.addGalleryImage', { defaultValue: 'Add Gallery Image' })}
      </Button>
    </Box>
  );
};

const CreateEventForm = ({
  onSubmit,
  onCancel,
  loading = false,
  hasConflict = false,
  conflictMessage = '',
  initialValues,
  organizers,
  categories,
  venues,
  isEdit = false,
  isPublished = false,
  eventId,
}: CreateEventFormProps) => {
  const { t } = useTranslation();
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(initialValues?.imageUrls || []);
  const [uploadError, setUploadError] = useState('');

  const defaultValues: EventFormData = {
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    organizerId: 0,
    categoryId: 0,
    venueId: 0,
    coverUrl: '',
    imageUrls: [],
    ...initialValues,
  };

  const handleSubmit = (values: EventFormData, actions: FormikHelpers<EventFormData>) => {
    const submitData: EventFormData = {
      ...values,
      imageUrls: imageUrls,
    };
    onSubmit(submitData);
    actions.setSubmitting(false);
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput && !imageUrls.includes(imageUrlInput)) {
      setImageUrls((prev) => [...prev, imageUrlInput]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImageUrl = (urlToRemove: string) => {
    setImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImageUrl();
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrlInput(e.target.value);
  };

  const useFileUpload = isEdit && !!eventId;

  return (
    <Forms
      values={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={isEdit ? updateEventSchema : eventSchema}
      enableReinitialize
      isRegister={false}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Conflict Warning */}
        {hasConflict && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {conflictMessage}
          </Alert>
        )}
        {/* Upload error */}
        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}
        {/* Published event: contractual fields locked notice (spec §3.3) */}
        {isPublished && (
          <Alert severity="info" sx={{ mb: 1 }}>
            This event is published. Contractual fields (title, dates, venue, category) are locked to protect existing bookings.
            Only description and cover image can be updated.
          </Alert>
        )}

        {/* Title Field — locked when published (spec §3.3) */}
        <FormTextField
          id="event-title"
          name="title"
          label={t('event.form.title')}
          type="text"
          required={true}
          placeholder={t('event.form.titlePlaceholder')}
          disabled={isPublished}
        />

        {/* Date Fields — locked when published (spec §3.3) */}
        <Box display="flex" gap={2}>
          <FormDateTimePicker
            name="startAt"
            label={t('event.form.startDate')}
            required
            disabled={isPublished}
          />
          <FormDateTimePicker
            name="endAt"
            label={t('event.form.endDate')}
            required
            disabled={isPublished}
          />
        </Box>

        {/* Cover Image — file upload in edit mode, URL input in create mode */}
        {useFileUpload ? (
          <CoverImageUpload eventId={eventId} onError={setUploadError} />
        ) : (
          <FormTextField
            id="event-coverUrl"
            name="coverUrl"
            label={t('event.form.coverImage')}
            type="url"
            required={true}
            placeholder={t('event.form.coverImagePlaceholder')}
          />
        )}

        {/* Dropdown Fields */}
        <FormTextField
          id="event-organizerId"
          name="organizerId"
          label={t('event.form.organizer')}
          type="text"
          required={true}
          select={true}
          disabled={isPublished}
        >
          <MenuItem value={0}>{t('event.form.selectOrganizer')}</MenuItem>
          {organizers.map((organizer) => (
            <MenuItem key={organizer.id} value={organizer.id}>
              {organizer.name}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField
          id="event-categoryId"
          name="categoryId"
          label={t('event.form.category')}
          type="text"
          required={true}
          select={true}
          disabled={isPublished}
        >
          <MenuItem value={0}>{t('event.form.selectCategory')}</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField id="event-venueId" name="venueId" label={t('event.form.venue')} type="text" required={true} select={true} disabled={isPublished}>
          <MenuItem value={0}>{t('event.form.selectVenue')}</MenuItem>
          {venues.map((venue) => (
            <MenuItem key={venue.id} value={venue.id}>
              {venue.name}
            </MenuItem>
          ))}
        </FormTextField>

        {/* Gallery Images — file upload in edit mode, URL input in create mode */}
        {useFileUpload ? (
          <GalleryUpload
            eventId={eventId}
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            onError={setUploadError}
          />
        ) : (
          <Box
            sx={{
              p: 3,
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #E0E0E0',
            }}
          >
            <Typography
              variant="subtitle1"
              component="label"
              sx={{
                display: 'block',
                mb: 2,
                fontWeight: 600,
                color: '#37437D',
                fontSize: '1rem',
              }}
            >
              {t('event.form.additionalImages')}
            </Typography>

            <Box display="flex" gap={1.5} mb={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <FormTextField
                  id="event-imageUrl-input"
                  name="imageUrlInput"
                  label=""
                  type="url"
                  placeholder={t('event.form.imageUrlPlaceholder')}
                  value={imageUrlInput}
                  onChange={handleImageUrlChange}
                  onKeyPress={handleKeyPress}
                  fullWidth={true}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      height: '56px',
                    },
                  }}
                />
              </Box>
              <Button
                onClick={handleAddImageUrl}
                variant="contained"
                disabled={!imageUrlInput.trim()}
                sx={{
                  ...PRIMARY_BUTTON_SX,
                  minWidth: 'auto',
                  px: 3,
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  height: '56px',
                }}
              >
                {t('common.buttons.add')}
              </Button>
            </Box>

            {imageUrls.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px dashed #D0D0D0',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 1.5,
                    color: '#666',
                    fontWeight: 500,
                  }}
                >
                  {t('event.form.imagesAdded', { count: imageUrls.length })}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {imageUrls.map((url, index) => (
                    <Chip
                      key={index}
                      label={url.length > 35 ? `${url.substring(0, 35)}...` : url}
                      onDelete={() => handleRemoveImageUrl(url)}
                      sx={{
                        backgroundColor: '#E8F5E9',
                        color: '#2E7D32',
                        fontWeight: 500,
                        fontSize: '13px',
                        borderRadius: '8px',
                        '& .MuiChip-deleteIcon': {
                          color: '#2E7D32',
                          '&:hover': { color: '#1B5E20' },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Description Field */}
        <FormTextareaField id="event-description" name="description" label={t('event.form.descriptionPlaceholder')} required={true} />

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={loading}
              sx={SECONDARY_BUTTON_SX}
            >
              {t('common.buttons.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || hasConflict}
            sx={PRIMARY_BUTTON_SX}
          >
            {loading
              ? (isEdit ? t('event.updating') : t('event.creating'))
              : hasConflict
                ? t('messages.error.dataChangedCloseReopen', { defaultValue: 'Data Changed - Close & Reopen' })
                : (isEdit ? t('event.update') : t('event.create'))}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default CreateEventForm;
