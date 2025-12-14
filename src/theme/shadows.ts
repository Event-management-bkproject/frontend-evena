/**
 * Shadow constants for consistent elevation effects
 * Use these instead of inline shadow values for better maintainability
 */

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
  md: '0 4px 16px rgba(0, 0, 0, 0.06)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.15)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.18)',
  hover: '0 8px 24px rgba(0, 0, 0, 0.15)',
  card: '0 4px 16px rgba(0, 0, 0, 0.06)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const;

export type ShadowKey = keyof typeof shadows;

/**
 * Get shadow value by key
 * @param key - Shadow key
 * @returns Shadow CSS value
 */
export const getShadow = (key: ShadowKey): string => shadows[key];
