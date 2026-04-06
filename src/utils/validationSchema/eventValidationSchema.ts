// utils/validationSchema/eventValidationSchema.ts
import * as yup from 'yup';

export const eventSchema = yup.object({
  title: yup
    .string()
    .required('Event title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  startAt: yup
    .string()
    .required('Start date is required')
    .test('is-future', 'Start date must be in the future', (value) => {
      if (!value) return false;
      return new Date(value) > new Date();
    }),
  endAt: yup
    .string()
    .required('End date is required')
    .test('is-after-start', 'End date must be after start date', function (value) {
      const { startAt } = this.parent;
      if (!value || !startAt) return false;
      return new Date(value) > new Date(startAt);
    }),
  organizerId: yup.number().moreThan(0, 'Please select an organizer').required('Organizer is required'),
  categoryId: yup.number().moreThan(0, 'Please select a category').required('Category is required'),
  venueId: yup.number().moreThan(0, 'Please select a venue').required('Venue is required'),
  coverUrl: yup.string().optional().nullable()
    .test('is-url', 'Please enter a valid URL', (value) => {
      if (!value) return true;
      try { new URL(value); return true; } catch { return false; }
    }),
});

// For update: contractual fields are disabled in the form when PUBLISHED (spec §3.3)
// startAt/endAt do not need the future-date check since they are pre-existing dates
export const updateEventSchema = yup.object({
  title: yup
    .string()
    .optional()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: yup
    .string()
    .optional()
    .min(10, 'Description must be at least 10 characters'),
  startAt: yup
    .string()
    .optional()
    .test('is-after-now', 'Start date must be in the future', (value) => {
      if (!value) return true;
      return new Date(value) > new Date();
    }),
  endAt: yup
    .string()
    .optional()
    .test('is-after-start', 'End date must be after start date', function (value) {
      const { startAt } = this.parent;
      if (!value || !startAt) return true;
      return new Date(value) > new Date(startAt);
    }),
  categoryId: yup.number().optional().moreThan(0, 'Please select a category'),
  venueId: yup.number().optional().moreThan(0, 'Please select a venue'),
  coverUrl: yup.string().optional().nullable()
    .test('is-url', 'Please enter a valid URL', (value) => {
      if (!value) return true;
      try { new URL(value); return true; } catch { return false; }
    }),
});
