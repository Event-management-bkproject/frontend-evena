'use client';

import { Box, Typography } from '@mui/material';
import { FormikProps } from 'formik';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import FormButton from '@components/FormButton';
import { AuthLink } from '@components/common/AuthLink';
import { registerValidationSchema } from '@utils/validationSchema/registerValidationSchema';
import { useRegister } from '@hooks/useRegister';
import { RegisterFormProps } from './types';

/**
 * Register form component with validation and submission logic
 * Can be used for both customer and organizer registration
 * @param type - 'customer' or 'organizer'
 */
export function RegisterForm({ type, onSubmitSuccess }: RegisterFormProps) {
  const { register, isLoading } = useRegister({ type });

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => {
    const success = await register(values);
    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const title = type === 'customer' ? 'Customer Registration' : 'Organizer Registration';

  return (
    <Forms
      values={{
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={registerValidationSchema}
      onSubmit={handleSubmit}
      keyValue={`${type}-register-form`}
      isRegister={true}
    >
      {(formikProps: FormikProps<any>) => (
        <>
          <Typography
            variant="h5"
            component="h1"
            sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: 'primary.main' }}
          >
            {title}
          </Typography>

          <FormTextField
            id={`${type}-register-name`}
            name="name"
            label="Full Name"
            type="text"
            required={true}
            placeholder="Enter your full name"
            autoComplete="name"
          />

          <FormTextField
            id={`${type}-register-email`}
            name="email"
            label="Email"
            type="email"
            required={true}
            placeholder="Enter your email"
            autoComplete="email"
          />

          <FormTextField
            id={`${type}-register-phone`}
            name="phone"
            label="Phone Number"
            type="tel"
            required={true}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />

          <FormTextField
            id={`${type}-register-password`}
            name="password"
            label="Password"
            type="password"
            required={true}
            placeholder="Enter your password"
            autoComplete="new-password"
          />

          <FormTextField
            id={`${type}-register-confirmPassword`}
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            required={true}
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <FormButton
            isRegister={true}
            disabled={!formikProps.isValid || formikProps.isSubmitting || isLoading}
            registerBtnLabelText={
              formikProps.isSubmitting || isLoading ? 'Registering...' : 'Register'
            }
          />

          <Box
            sx={{
              mt: 2,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
              Already have an account?
            </Typography>
            <AuthLink href="/login">Login here</AuthLink>
          </Box>
        </>
      )}
    </Forms>
  );
}

export default RegisterForm;
