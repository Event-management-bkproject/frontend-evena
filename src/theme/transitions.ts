/**
 * Transition and animation constants
 * Use these for consistent animation timing
 */

/**
 * Transition durations in milliseconds
 */
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
} as const;

/**
 * Easing functions
 */
export const easings = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasized: 'cubic-bezier(0.0, 0, 0.2, 1)',
  decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',
} as const;

/**
 * Common transition configurations
 */
export const transitions = {
  all: 'all 0.3s ease',
  allFast: 'all 0.15s ease',
  allSlow: 'all 0.5s ease',
  transform: 'transform 0.3s ease',
  opacity: 'opacity 0.3s ease',
  color: 'color 0.3s ease',
  background: 'background 0.3s ease',
  boxShadow: 'box-shadow 0.3s ease',
} as const;

export type TransitionKey = keyof typeof transitions;

/**
 * Create custom transition
 * @param property - CSS property to transition
 * @param duration - Duration in ms (default: 300)
 * @param easing - Easing function (default: 'ease')
 * @returns Transition CSS value
 */
export const createTransition = (
  property: string,
  duration: number = durations.normal,
  easing: string = easings.ease
): string => {
  return `${property} ${duration}ms ${easing}`;
};

/**
 * Create multiple transitions
 * @param properties - Array of CSS properties
 * @param duration - Duration in ms
 * @param easing - Easing function
 * @returns Combined transition CSS value
 */
export const createTransitions = (
  properties: string[],
  duration: number = durations.normal,
  easing: string = easings.ease
): string => {
  return properties.map((prop) => createTransition(prop, duration, easing)).join(', ');
};

/**
 * Get transition value by key
 * @param key - Transition key
 * @returns Transition CSS value
 */
export const getTransition = (key: TransitionKey): string => transitions[key];
