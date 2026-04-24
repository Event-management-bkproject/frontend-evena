// ─── Brand Colors ─────────────────────────────────────────────────────────────
// Single source of truth for Evena brand palette.
// Use these instead of hardcoding hex strings in component sx props.
export const BRAND = {
  // ── Primary ────────────────────────────────────────────────────────────────
  primary:      '#F36BF9',
  primaryHover: '#e55ae0',
  primaryLight: '#FDE3FE',

  // ── Dark / navy ────────────────────────────────────────────────────────────
  dark:          '#2A3363',   // main heading / strong text
  darkSecondary: '#36437C',   // secondary dark
  darkTertiary:  '#37437D',   // tab/button dark variant

  // ── Text ───────────────────────────────────────────────────────────────────
  textSecondary: '#717182',   // body secondary text
  textMuted:     '#94A3B8',   // placeholder / muted
  textDisabled:  '#ADACAE',   // disabled / inactive label
  link:          '#B0B8D4',   // footer links

  // ── Backgrounds ────────────────────────────────────────────────────────────
  bgPage:    '#FAFAFA',   // full-page background
  bgSection: '#F7F7F7',   // card / section background
  bgSurface: '#F8FAFC',   // hover / raised surface

  // ── Borders ────────────────────────────────────────────────────────────────
  border:      '#E2E8F0',   // default border
  borderLight: '#CBD5E1',   // subtle / dashed border

  // ── Status — success ───────────────────────────────────────────────────────
  success:     '#10b981',
  successBg:   '#ecfdf5',
  successText: '#065f46',

  // ── Status — warning ───────────────────────────────────────────────────────
  warning:     '#f59e0b',
  warningBg:   '#fffbeb',
  warningText: '#92400e',

  // ── Status — error ─────────────────────────────────────────────────────────
  error:     '#ef4444',
  errorBg:   '#fef2f2',
  errorText: '#991b1b',

  // ── Status — info ──────────────────────────────────────────────────────────
  info:     '#3b82f6',
  infoBg:   '#eff6ff',
  infoText: '#1e40af',

  // ── File-type icon colors ──────────────────────────────────────────────────
  iconPdf:  '#E53935',
  iconWord: '#1565C0',
  iconFile: '#546E7A',

  // ── Chart / accent ─────────────────────────────────────────────────────────
  accentPurple: '#8979FF',
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
