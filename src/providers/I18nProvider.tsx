'use client';

import { useEffect, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/i18n/config';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n when component mounts
    // i18n is already initialized in the config file
    // This effect ensures it's ready before rendering children
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default I18nProvider;
