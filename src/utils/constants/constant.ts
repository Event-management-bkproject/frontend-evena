// ─── Brand Colors ─────────────────────────────────────────────────────────────
// Single source of truth for Evena brand palette.
// Use these instead of hardcoding hex strings in component sx props.
export const BRAND = {
  primary: '#F36BF9',
  primaryHover: '#e55ae0',
  primaryLight: '#FDE3FE',
  dark: '#2A3363',
  darkSecondary: '#36437C',
  bgPage: '#FAFAFA',
  bgSection: '#F7F7F7',
} as const;

// ─── Currency Minimums ────────────────────────────────────────────────────────
// Minimum paid ticket price per currency.
// price == 0 → free ticket (always allowed, bypasses gateway).
// price > 0  → must be >= this minimum.
export const CURRENCY_MINIMUMS: Record<string, number> = {
  VND: 1000,
  USD: 1,
  EUR: 1,
  GBP: 1,
  SGD: 1,
} as const;

export const SUPPORTED_CURRENCIES = [
  { code: 'VND', label: 'VND – Vietnamese Dong' },
  { code: 'USD', label: 'USD – US Dollar' },
  { code: 'EUR', label: 'EUR – Euro' },
  { code: 'GBP', label: 'GBP – British Pound' },
  { code: 'SGD', label: 'SGD – Singapore Dollar' },
] as const;

export const KEY_CODE_IS_NOT_NUMERIC_VALUE = [69, 83, 107, 109, 110, 187, 188, 189, 190];
export const CharacterKeyCode = {
  DECIMALPOINT_KEYCODE: [110, 190],
  NATURALBASE_KEYCODE: [69],
  NEGATIVE_KEYCODE: [109, 189],
  POSITIVE_KEYCODE: [107, 187],
  NON_NUMBER_KEYCODE: [83, 188],
};

// ─── Table / Pagination ───────────────────────────────────────────────────────

export const TABLE_PER_PAGE = 10;

// ─── Order Status ─────────────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', bg: '#FDE3FE', color: '#F36BF9' },
  CANCELLED: { label: 'Cancelled', bg: '#FABABB', color: '#FF5B5E' },
  PENDING:   { label: 'Pending',   bg: '#EDEDED', color: '#36437C' },
  EXPIRED:   { label: 'Expired',   bg: '#FFE5CC', color: '#FF8C00' },
  REFUNDED:  { label: 'Refunded',  bg: '#CCF0F0', color: '#009999' },
};

export const ORDER_STATUSES = ['ALL', 'CONFIRMED', 'CANCELLED', 'PENDING', 'EXPIRED'] as const;
export type OrderStatusFilter = typeof ORDER_STATUSES[number];
