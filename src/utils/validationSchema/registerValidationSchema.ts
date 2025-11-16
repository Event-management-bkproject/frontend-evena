import * as Yup from 'yup';
import { validationMessages } from './validationMessages';

// Register Validation Schema
export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .required(validationMessages.required)
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),

  email: Yup.string().email(validationMessages.email).required(validationMessages.required),

  password: Yup.string()
    .min(6, validationMessages.password.min)
    .max(100, validationMessages.password.max)
    .required(validationMessages.required)
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/, validationMessages.password.strength),

  confirmPassword: Yup.string()
    .required(validationMessages.required)
    .oneOf([Yup.ref('password')], validationMessages.password.match),

  phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, validationMessages.phone.format)
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});
