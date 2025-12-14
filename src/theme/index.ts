/**
 * Theme system exports
 * Centralized theming constants for consistent styling across the app
 */

export * from './shadows';
export * from './gradients';
export * from './typography';
export * from './transitions';

// Re-export commonly used values
export { shadows, getShadow } from './shadows';
export { gradients, getGradient } from './gradients';
export { textTruncate, textTruncateMultiLine, textStyles, getTextStyle } from './typography';
export { transitions, getTransition, createTransition, createTransitions, durations, easings } from './transitions';
