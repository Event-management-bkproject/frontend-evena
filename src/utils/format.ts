/**
 * Common formatters for currency, numbers, and dates.
 * Use these instead of inline formatting logic in page/component files.
 */

/**
 * Format a Vietnamese Dong amount.
 * 1_500_000 → "1.5M ₫" | 450_000 → "450K ₫" | 500 → "500 ₫"
 */
export const formatCurrency = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K ₫`;
  return `${n} ₫`;
};

/**
 * Format a plain number for display using locale-aware thousands separator.
 * e.g. 1500 → "1,500"
 */
export const formatNumber = (n: number): string => n.toLocaleString();

/**
 * Split an ISO datetime string into a separate date and time string
 * formatted for Vietnamese locale (DD/MM/YYYY and HH:MM).
 * Used by table cells that display date and time on two lines.
 */
export const formatTableDate = (iso: string): { date: string; time: string } => {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
};
