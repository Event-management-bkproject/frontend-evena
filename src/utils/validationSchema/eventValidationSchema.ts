// utils/validationSchema/eventValidationSchema.ts
import * as yup from 'yup';

export const eventSchema = yup.object({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  startAt: yup
    .string()
    .required('Start date is required')
    .test('is-future', 'Start date must be in the future', (value) => {
      if (!value) return false;
      const startDate = new Date(value);
      const now = new Date();
      return startDate > now;
    }),
  endAt: yup
    .string()
    .required('End date is required')
    .test('is-after-start', 'End date must be after start date', function (value) {
      const { startAt } = this.parent;
      if (!value || !startAt) return false;
      const endDate = new Date(value);
      const startDate = new Date(startAt);
      return endDate > startDate;
    }),
  organizerId: yup.number().moreThan(0, 'Please select an organizer').required('Organizer is required'),
  categoryId: yup.number().moreThan(0, 'Please select a category').required('Category is required'),
  venueId: yup.number().moreThan(0, 'Please select a venue').required('Venue is required'),
  coverUrl: yup.string().url('Please enter a valid URL').required('Cover image URL is required'),
});
