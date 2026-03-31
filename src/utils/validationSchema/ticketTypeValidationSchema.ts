// utils/validationSchema/ticketTypeValidationSchema.ts
import * as yup from 'yup';
import { CURRENCY_MINIMUMS } from '../constants/constant';

export const ticketTypeSchema = yup.object({
  name: yup
    .string()
    .required('Ticket type name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  description: yup.string().optional().nullable().max(500, 'Description cannot exceed 500 characters'),
  price: yup
    .number()
    .optional()
    .nullable()
    .min(0, 'Price cannot be negative')
    .test(
      'currency-minimum',
      'Price must be 0 (free) or at least the currency minimum',
      function (value) {
        if (value === undefined || value === null) return true; // optional at DRAFT
        if (value === 0) return true; // free ticket — always valid
        const { currency } = this.parent;
        const min = CURRENCY_MINIMUMS[currency ?? 'VND'] ?? 1;
        if (value < min) {
          return this.createError({
            message: `Price must be 0 (free) or at least ${min.toLocaleString()} ${currency ?? 'VND'}`,
          });
        }
        return true;
      }
    )
    .typeError('Price must be a number'),
  currency: yup
    .string()
    .optional()
    .nullable()
    .default('VND')
    .matches(/^[A-Z]{3}$/, 'Currency must be a valid 3-letter uppercase code (e.g., VND, USD)'),
  total: yup
    .number()
    .optional()
    .nullable()
    .min(1, 'Total must be at least 1')
    .integer('Total must be a whole number')
    .typeError('Total must be a number'),
  perUserLimit: yup
    .number()
    .optional()
    .nullable()
    .min(1, 'Per user limit must be at least 1')
    .integer('Per user limit must be a whole number')
    .typeError('Per user limit must be a number'),
  salesStart: yup.string().optional().nullable(),
  salesEnd: yup
    .string()
    .optional()
    .nullable()
    .test('is-after-start', 'Sales end must be after sales start', function (value) {
      const { salesStart } = this.parent;
      if (!salesStart || !value) return true;
      return new Date(value) > new Date(salesStart);
    }),
  earlyBird: yup.boolean().optional().default(false),
  earlyBirdDiscount: yup
    .number()
    .optional()
    .nullable()
    .min(0, 'Discount must be greater than or equal to 0')
    .max(100, 'Discount cannot exceed 100%')
    .when('earlyBird', {
      is: true,
      then: (schema) => schema.required('Early bird discount is required when early bird is enabled'),
      otherwise: (schema) => schema.optional(),
    })
    .typeError('Discount must be a number'),
  visible: yup.boolean().optional().default(true),
});

export const updateTicketTypeSchema = yup.object({
  name: yup
    .string()
    .optional()
    .nullable()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  description: yup.string().optional().nullable().max(500, 'Description cannot exceed 500 characters'),
  price: yup
    .number()
    .optional()
    .nullable()
    .min(0, 'Price cannot be negative')
    .test(
      'currency-minimum',
      'Price must be 0 (free) or at least the currency minimum',
      function (value) {
        if (value === undefined || value === null) return true;
        if (value === 0) return true;
        const { currency } = this.parent;
        const min = CURRENCY_MINIMUMS[currency ?? 'VND'] ?? 1;
        if (value < min) {
          return this.createError({
            message: `Price must be 0 (free) or at least ${min.toLocaleString()} ${currency ?? 'VND'}`,
          });
        }
        return true;
      }
    )
    .typeError('Price must be a number'),
  currency: yup
    .string()
    .optional()
    .nullable()
    .matches(/^[A-Z]{3}$/, 'Currency must be a valid 3-letter uppercase code (e.g., VND, USD)'),
  total: yup
    .number()
    .optional()
    .min(1, 'Total must be at least 1')
    .integer('Total must be a whole number')
    .typeError('Total must be a number'),
  perUserLimit: yup
    .number()
    .optional()
    .min(1, 'Per user limit must be at least 1')
    .integer('Per user limit must be a whole number')
    .typeError('Per user limit must be a number'),
  salesStart: yup.string().optional(),
  salesEnd: yup
    .string()
    .optional()
    .test('is-after-start', 'Sales end must be after sales start', function (value) {
      const { salesStart } = this.parent;
      if (!salesStart || !value) return true;
      return new Date(value) > new Date(salesStart);
    }),
  earlyBird: yup.boolean().optional(),
  earlyBirdDiscount: yup
    .number()
    .optional()
    .min(0, 'Discount must be greater than or equal to 0')
    .max(100, 'Discount cannot exceed 100%')
    .typeError('Discount must be a number'),
  visible: yup.boolean().optional(),
});
