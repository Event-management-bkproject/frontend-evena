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
}

const CreateEventForm = ({
  onSubmit,
  onCancel,
  loading = false,
  initialValues,
  organizers,
  categories,
  venues,
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
        <Box>
          <Typography
            variant="body1"
            component="label"
            sx={{ display: 'block', mb: 1, fontWeight: 540, color: '#37437D' }}
          >
            Additional Image URLs
          </Typography>
          <Box display="flex" gap={1} mb={2}>
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
            />
            <Button onClick={handleAddImageUrl} variant="outlined" sx={{ minWidth: '100px', whiteSpace: 'nowrap' }}>
              Add URL
            </Button>
          </Box>

          {/* Display added image URLs */}
          {imageUrls.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {imageUrls.map((url, index) => (
                <Chip
                  key={index}
                  label={url.length > 30 ? `${url.substring(0, 30)}...` : url}
                  onDelete={() => handleRemoveImageUrl(url)}
                  color="primary"
                  variant="outlined"
                />
              ))}
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
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </Box>
      </Box>
    </Forms>
  );
};

export default CreateEventForm;
