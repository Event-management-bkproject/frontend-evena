import * as Yup from 'yup';

export const organizationSchema = Yup.object({
  name: Yup.string().required('Organization name is required'),
  description: Yup.string().required('Description is required'),
  logoUrl: Yup.string().url('Must be a valid URL').required('Logo URL is required'),
  website: Yup.string().url('Must be a valid URL').required('Website is required'),
  email: Yup.string().email('Must be a valid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone must contain only numbers')
    .min(10, 'Phone must be at least 10 digits')
    .required('Phone is required'),
});
