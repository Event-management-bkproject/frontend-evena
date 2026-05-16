import * as Yup from 'yup';

// Validation schema
export const categorySchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters'),
  description: Yup.string()
    .optional()
    .nullable()
    .max(500, 'Description cannot exceed 500 characters'),
  iconUrl: Yup.string().optional().nullable(),
});
