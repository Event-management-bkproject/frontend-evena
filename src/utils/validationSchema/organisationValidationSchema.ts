import * as Yup from 'yup';

// Yup's built-in .url() rejects localhost URLs (no TLD) which breaks dev MinIO uploads.
// Use browser-native URL constructor instead — it validates structure without TLD restrictions.
const isValidUrl = (val?: string | null) => {
  if (!val) return true;
  try { new URL(val); return true; } catch { return false; }
};

export const organizationSchema = Yup.object({
  name: Yup.string()
    .required('Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Organization name cannot exceed 200 characters'),
  description: Yup.string()
    .optional()
    .nullable()
    .min(10, 'Description must be at least 10 characters'),
  logoUrl: Yup.string().optional().nullable()
    .test('is-url', 'Logo URL must be a valid URL', isValidUrl),
  website: Yup.string().optional().nullable()
    .test('is-url', 'Website must be a valid URL', isValidUrl),
  email: Yup.string().optional().nullable().email('Must be a valid email address'),
  phone: Yup.string()
    .optional()
    .nullable()
    .matches(/^[+]?[0-9]{10,15}$/, 'Phone must be 10–15 digits, optionally starting with +'),
});
