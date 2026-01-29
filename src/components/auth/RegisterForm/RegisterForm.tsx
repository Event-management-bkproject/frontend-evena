'use client';

import { Box, Typography } from '@mui/material';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import Forms from '@components/Forms';
import FormTextField from '@components/FormTextField';
import FormButton from '@components/FormButton';
import { AuthLink } from '@components/common/AuthLink';
import { registerValidationSchema } from '@utils/validationSchema/registerValidationSchema';
import { useRegister } from '@/src/hooks/auth/useRegister';
import { RegisterFormProps } from './types';

/**
 * Register form component with validation and submission logic
 * Can be used for both customer and organizer registration
 * @param type - 'customer' or 'organizer'
 */
export function RegisterForm({ type, onSubmitSuccess }: RegisterFormProps) {
  const { t } = useTranslation();
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

  const title = type === 'customer' ? t('auth.register.customerTitle') : t('auth.register.organizerTitle');

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
            label={t('common.labels.fullName')}
            type="text"
            required={true}
            placeholder={t('auth.placeholders.enterFullName')}
            autoComplete="name"
          />

          <FormTextField
            id={`${type}-register-email`}
            name="email"
            label={t('common.labels.email')}
            type="email"
            required={true}
            placeholder={t('auth.placeholders.enterEmail')}
            autoComplete="email"
          />

          <FormTextField
            id={`${type}-register-phone`}
            name="phone"
            label={t('common.labels.phoneNumber')}
            type="tel"
            required={true}
            placeholder={t('auth.placeholders.enterPhoneNumber')}
            autoComplete="tel"
          />

          <FormTextField
            id={`${type}-register-password`}
            name="password"
            label={t('common.labels.password')}
            type="password"
            required={true}
            placeholder={t('auth.placeholders.enterPassword')}
            autoComplete="new-password"
          />

          <FormTextField
            id={`${type}-register-confirmPassword`}
            name="confirmPassword"
            label={t('common.labels.confirmPassword')}
            type="password"
            required={true}
            placeholder={t('auth.placeholders.reEnterPassword')}
            autoComplete="new-password"
          />

          <FormButton
            isRegister={true}
            disabled={!formikProps.isValid || formikProps.isSubmitting || isLoading}
            registerBtnLabelText={
              formikProps.isSubmitting || isLoading ? t('auth.register.registering') : t('common.buttons.register')
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
              {t('auth.register.alreadyHaveAccount')}
            </Typography>
            <AuthLink href="/login">{t('auth.register.loginHere')}</AuthLink>
          </Box>
        </>
      )}
    </Forms>
  );
}

export default RegisterForm;
