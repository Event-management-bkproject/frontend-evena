/**
 * Gradient constants for consistent background effects
 * Use these instead of inline gradient values
 */

export const gradients = {
  primary: 'linear-gradient(135deg, #ED4690 0%, #5522CC 100%)',
  secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  dark: 'linear-gradient(135deg, #2A3363 0%, #1a1f3f 100%)',
  light: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  blue: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  ocean: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
  sunset: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  night: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
} as const;

export type GradientKey = keyof typeof gradients;

/**
 * Get gradient value by key
 * @param key - Gradient key
 * @returns Gradient CSS value
 */
export const getGradient = (key: GradientKey): string => gradients[key];
