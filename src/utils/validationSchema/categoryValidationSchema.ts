import * as Yup from 'yup';

// Validation schema
export const categorySchema = Yup.object({
  name: Yup.string().required('Category name is required'),
  description: Yup.string().required('Description is required'),
  iconUrl: Yup.string().url('Must be a valid URL').required('Icon URL is required'),
});
