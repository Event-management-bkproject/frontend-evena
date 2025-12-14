import { ACCESS_TOKEN } from './keys';

export const setLSItem = (key: string, value: string) => localStorage.setItem(key, value);

export const getLSItem = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN);
};
