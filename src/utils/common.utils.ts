/**
 * Common pure utility functions shared across the application.
 * Rules: pure (input → output), no side effects, no UI imports.
 */

/**
 * Generate 1-2 letter initials from a full name.
 * e.g. "Nguyen Van A" → "NV"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Case-insensitive substring check.
 * Replaces the repeated `str.toLowerCase().includes(term.toLowerCase())` pattern.
 */
export function includesIgnoreCase(source: string, term: string): boolean {
  return source.toLowerCase().includes(term.toLowerCase());
}
