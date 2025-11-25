export const setLSItem = (key: string, value: string) => localStorage.setItem(key, value);

export const getLSItem = (key: string): string | null => {
  return localStorage.getItem(key);
};
