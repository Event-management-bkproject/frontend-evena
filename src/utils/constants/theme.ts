/**
 * Theme constants for consistent styling across the application
 */

export const COLORS = {
  primary: {
    main: '#5E35B1',
    light: '#9575CD',
    dark: '#4527A0',
  },
  secondary: {
    main: '#FF4081',
    light: '#FF80AB',
    dark: '#F50057',
  },
  background: {
    gradient: 'linear-gradient(135deg, #EEF0FF 0%, #FCD3FF 100%)',
    paper: '#EEF0FF',
    default: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
} as const;

export const SPACING = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
} as const;

export const BORDER_RADIUS = {
  sm: 1,
  md: 2,
  lg: 3,
} as const;

export const SHADOWS = {
  light: 3,
  medium: 6,
  heavy: 8,
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;
