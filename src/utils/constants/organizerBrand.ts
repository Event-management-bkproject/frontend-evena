// ─── Organizer Panel Color System ────────────────────────────────────────────
// Pink-primary dark sidebar — same structural pattern as adminBrand.

export const ORGANIZER = {
  // ── Sidebar ────────────────────────────────────────────────────────────────
  sidebarBg:        '#140D1F',   // deep dark purple-navy
  sidebarBgHover:   '#1E1530',   // slightly lighter on hover
  sidebarBgActive:  '#2D1B40',   // purple-tinted active row
  sidebarText:      '#9E8FB2',   // muted lavender for inactive items
  sidebarTextActive:'#F8FAFC',   // near-white for active item
  sidebarBorder:    '#231840',   // subtle divider

  // ── Pink primary ───────────────────────────────────────────────────────────
  primary:      '#F36BF9',
  primaryHover: '#E055E8',
  primaryLight: '#FDF0FE',

  // ── Page / card backgrounds ────────────────────────────────────────────────
  pageBg:    '#F7F7F7',

  // ── Borders & surfaces ─────────────────────────────────────────────────────
  border:      '#E4E6F5',
  cardBg:      '#FFFFFF',
} as const;
