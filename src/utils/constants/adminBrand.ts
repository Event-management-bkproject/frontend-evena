// ─── Admin Panel Color System ─────────────────────────────────────────────────
// Intentionally different from BRAND (organizer/customer).
// Primary = blue. Sidebar = dark navy.

export const ADMIN = {
  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebarBg:        '#0F172A',   // dark navy
  sidebarBgHover:   '#1E293B',   // slightly lighter on hover
  sidebarBgActive:  '#1E3A5F',   // blue-tinted active row
  sidebarText:      '#94A3B8',   // muted slate for inactive items
  sidebarTextActive:'#F8FAFC',   // near-white for active item
  sidebarBorder:    '#1E293B',   // subtle divider

  // ── Blue primary ───────────────────────────────────────────────────────────
  primary:      '#3B82F6',
  primaryHover: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryText:  '#1D4ED8',

  // ── Dark / headings ────────────────────────────────────────────────────────
  dark:    '#0F172A',
  heading: '#1E293B',
  body:    '#334155',

  // ── Page / card backgrounds ────────────────────────────────────────────────
  pageBg:    '#F1F5F9',   // page area
  cardBg:    '#FFFFFF',
  surfaceBg: '#F8FAFC',   // table row hover, alt rows

  // ── Borders ────────────────────────────────────────────────────────────────
  border:      '#E2E8F0',
  borderLight: '#CBD5E1',

  // ── Status colours ─────────────────────────────────────────────────────────
  success:     '#10B981',
  successBg:   '#ECFDF5',
  successText: '#065F46',

  warning:     '#F59E0B',
  warningBg:   '#FFFBEB',
  warningText: '#92400E',

  error:     '#EF4444',
  errorBg:   '#FEF2F2',
  errorText: '#991B1B',

  info:     '#3B82F6',
  infoBg:   '#EFF6FF',
  infoText: '#1E40AF',

  // ── Muted text ─────────────────────────────────────────────────────────────
  textMuted:     '#94A3B8',
  textSecondary: '#64748B',
} as const;
