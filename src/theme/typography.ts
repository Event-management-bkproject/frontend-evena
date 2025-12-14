/**
 * Typography utilities for consistent text styling
 * Use these for text truncation and other text effects
 */

import { SxProps, Theme } from '@mui/material';

/**
 * Single line text truncation with ellipsis
 */
export const textTruncate: SxProps<Theme> = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
} as const;

/**
 * Multi-line text truncation with ellipsis
 * @param lines - Number of lines to show (default: 2)
 * @returns SxProps for multi-line truncation
 */
export const textTruncateMultiLine = (lines: number = 2): SxProps<Theme> => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/**
 * Text selection styles
 */
export const textSelection = {
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
  MozUserSelect: 'none' as const,
  msUserSelect: 'none' as const,
};

/**
 * Text styles by variant
 */
export const textStyles = {
  heading1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  heading2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  heading3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },
} as const;

export type TextStyleKey = keyof typeof textStyles;

/**
 * Get text style by key
 * @param key - Text style key
 * @returns Text style object
 */
export const getTextStyle = (key: TextStyleKey) => textStyles[key];
