// utils/validationSchemas.ts
import * as Yup from 'yup';
import { validationMessages } from './validationMessages';

// Login Validation Schema
export const loginValidationSchema = Yup.object({
  email: Yup.string().email(validationMessages.email).required(validationMessages.required),

  password: Yup.string().required(validationMessages.required).min(6, validationMessages.password.min),
});
