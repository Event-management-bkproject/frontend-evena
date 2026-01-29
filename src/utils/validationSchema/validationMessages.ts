import i18n from '@/src/i18n/config';

// Factory function to get validation messages with i18n support
export const getValidationMessages = () => {
  const t = i18n.t.bind(i18n);

  return {
    required: t('validation.required'),
    email: t('validation.email.invalid'),
    min: (_field: string, _min: number) => t('validation.name.minLength'), // Generic for now
    max: (_field: string, _max: number) => t('validation.name.maxLength'), // Generic for now
    password: {
      min: t('validation.password.minLength'),
      max: t('validation.password.maxLength'),
      strength: t('validation.password.strength'),
      match: t('validation.password.noMatch'),
    },
    phone: {
      invalid: t('validation.phone.invalid'),
      format: t('validation.phone.format'),
    },
  };
};

// For backward compatibility - use default language
export const validationMessages = getValidationMessages();
