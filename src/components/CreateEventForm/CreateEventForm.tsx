/**
 * CreateEventForm - Updated to use shared button styles
 *
 * BUSINESS LOGIC PRESERVED:
 * - All form fields and validation
 * - Image URL management
 * - Submit handling
 *
 * UI CHANGES:
 * - Uses shared button styles
 */
'use client';

import { useState } from 'react';
import { Box, Button, MenuItem, Chip, Typography, Alert } from '@mui/material';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import FormTextField from '../FormTextField';
import FormDateTimePicker from '../FormDateTimePicker';
import { eventSchema } from '@/src/utils/validationSchema/eventValidationSchema';
import Forms from '../Forms';
import FormTextareaField from '../FormTextAreaField';
import { EventFormData } from '@/src/stores/types';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/src/theme/buttonStyles';

interface CreateEventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  hasConflict?: boolean; // For optimistic locking conflict detection
  conflictMessage?: string; // Conflict message from useOptimisticLocking
  initialValues?: Partial<EventFormData>;
  organizers: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  venues: Array<{ id: number; name: string }>;
  isEdit?: boolean;
  /** When true, contractual fields (title, dates, venue, category) are locked per spec §3.3 */
  isPublished?: boolean;
}

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
}: CreateEventFormProps) => {
  const { t } = useTranslation();
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(initialValues?.imageUrls || []);

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

  return (
    <Forms
      values={defaultValues}
      onSubmit={handleSubmit}
      validationSchema={eventSchema}
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

        {/* Cover URL Field */}
        <FormTextField
          id="event-coverUrl"
          name="coverUrl"
          label={t('event.form.coverImage')}
          type="url"
          required={true}
          placeholder={t('event.form.coverImagePlaceholder')}
        />

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

        {/* Additional Image URLs */}
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

          {/* Display added image URLs */}
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
                        '&:hover': {
                          color: '#1B5E20',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

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
