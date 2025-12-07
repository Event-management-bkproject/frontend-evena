// utils/validationSchema/ticketTypeValidationSchema.ts
import * as yup from 'yup';

export const ticketTypeSchema = yup.object({
  name: yup.string().required('Ticket type name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().optional(),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price must be greater than or equal to 0')
    .typeError('Price must be a number'),
  currency: yup.string().optional().default('VND'),
  total: yup
    .number()
    .required('Total tickets is required')
    .min(1, 'Total must be at least 1')
    .integer('Total must be a whole number')
    .typeError('Total must be a number'),
  perUserLimit: yup
    .number()
    .optional()
    .min(1, 'Per user limit must be at least 1')
    .integer('Per user limit must be a whole number')
    .typeError('Per user limit must be a number'),
  salesStart: yup.string().required('Sales start date is required'),
  salesEnd: yup
    .string()
    .required('Sales end date is required')
    .test('is-after-start', 'Sales end must be after sales start', function (value) {
      const { salesStart } = this.parent;
      if (!salesStart || !value) return true;
      return new Date(value) > new Date(salesStart);
    }),
  earlyBird: yup.boolean().optional().default(false),
  earlyBirdDiscount: yup
    .number()
    .optional()
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
  name: yup.string().optional().min(3, 'Name must be at least 3 characters'),
  description: yup.string().optional(),
  price: yup.number().optional().min(0, 'Price must be greater than or equal to 0').typeError('Price must be a number'),
  currency: yup.string().optional(),
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
