// utils/validationSchema/eventValidationSchema.ts
import * as yup from 'yup';

export const eventSchema = yup.object({
  title: yup.string().required('Event title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  startAt: yup.string().required('Start date is required'),
  endAt: yup.string().required('End date is required'),
  organizerId: yup.number().moreThan(0, 'Please select an organizer').required('Organizer is required'),
  categoryId: yup.number().moreThan(0, 'Please select a category').required('Category is required'),
  venueId: yup.number().moreThan(0, 'Please select a venue').required('Venue is required'),
  coverUrl: yup.string().url('Please enter a valid URL').required('Cover image URL is required'),
});
