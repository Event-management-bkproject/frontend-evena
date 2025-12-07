// CreateEventForm.tsx
'use client';

import { useState } from 'react';
import { Box, Button, MenuItem, Chip, Typography } from '@mui/material';
import FormTextField from '../FormTextField';
import { eventSchema } from '@/src/utils/validationSchema/eventValidationSchema';
import Forms from '../Forms';
import DateRangePickerField from '../DateRangePickerField';
import FormTextareaField from '../FormTextAreaField';

// Define types - SỬA LẠI ĐỂ KHỚP VỚI API
export interface EventFormData {
  title: string;
  description: string;
  startAt: string; // Thay vì dateRange object
  endAt: string; // Thay vì dateRange object
  organizerId: number;
  categoryId: number;
  venueId: number;
  coverUrl: string;
  imageUrls: string[];
}

interface CreateEventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialValues?: Partial<EventFormData>;
  organizers: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
  venues: Array<{ id: number; name: string }>;
  isEdit?: boolean;
}

const CreateEventForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialValues,
  organizers,
  categories,
  venues,
  isEdit = false,
}: CreateEventFormProps) => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(initialValues?.imageUrls || []);

  // SỬA LẠI defaultValues để khớp với EventFormData mới
  const defaultValues: EventFormData = {
    title: '',
    description: '',
    startAt: '', // Chuỗi timestamp
    endAt: '', // Chuỗi timestamp
    organizerId: 0,
    categoryId: 0,
    venueId: 0,
    coverUrl: '',
    imageUrls: [],
    ...initialValues,
  };

  const handleSubmit = (values: EventFormData, actions: any) => {
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
        {/* Title Field */}
        <FormTextField
          id="event-title"
          name="title"
          label="Event Title"
          type="text"
          required={true}
          placeholder="Enter event title"
        />

        {/* Date Fields - THAY ĐỔI: Sử dụng datetime-local thay vì DateRangePicker */}
        <Box display="flex" gap={2}>
          <FormTextField
            id="event-startAt"
            name="startAt"
            label="Start Date & Time"
            type="datetime-local"
            required={true}
            InputLabelProps={{ shrink: true }}
            fullWidth={true}
          />
          <FormTextField
            id="event-endAt"
            name="endAt"
            label="End Date & Time"
            type="datetime-local"
            required={true}
            InputLabelProps={{ shrink: true }}
            fullWidth={true}
          />
        </Box>

        {/* Cover URL Field */}
        <FormTextField
          id="event-coverUrl"
          name="coverUrl"
          label="Cover Image URL"
          type="url"
          required={true}
          placeholder="https://example.com/cover.jpg"
        />

        {/* Dropdown Fields */}
        <FormTextField
          id="event-organizerId"
          name="organizerId"
          label="Organizer"
          type="text"
          required={true}
          select={true}
        >
          <MenuItem value={0}>Select Organizer</MenuItem>
          {organizers.map((organizer) => (
            <MenuItem key={organizer.id} value={organizer.id}>
              {organizer.name}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField
          id="event-categoryId"
          name="categoryId"
          label="Category"
          type="text"
          required={true}
          select={true}
        >
          <MenuItem value={0}>Select Category</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </FormTextField>

        <FormTextField id="event-venueId" name="venueId" label="Venue" type="text" required={true} select={true}>
          <MenuItem value={0}>Select Venue</MenuItem>
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
            Additional Image URLs (Optional)
          </Typography>

          <Box display="flex" gap={1.5} mb={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <FormTextField
                id="event-imageUrl-input"
                name="imageUrlInput"
                label=""
                type="url"
                placeholder="https://example.com/image.jpg"
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
                minWidth: 'auto',
                px: 3,
                whiteSpace: 'nowrap',
                backgroundColor: '#f36bf9',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                height: '56px',
                '&:hover': {
                  backgroundColor: '#e55ae0',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                },
              }}
            >
              Add
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
                {imageUrls.length} {imageUrls.length === 1 ? 'image' : 'images'} added
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
        <FormTextareaField id="event-description" name="description" label="Enter event description" required={true} />

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={loading}
              sx={{
                borderRadius: '10px',
                padding: '10px 24px',
                textTransform: 'none',
                fontSize: '16px',
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#f36bf9',
              borderRadius: '10px',
              padding: '10px 24px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e55ae0',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              },
            }}
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Event' : 'Create Event')}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default CreateEventForm;
