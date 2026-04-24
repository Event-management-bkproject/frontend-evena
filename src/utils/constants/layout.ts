// ─── Layout & Responsive Tokens ───────────────────────────────────────────────
// Central source of truth for spacing, radius, and breakpoint-aware patterns.
// Import and compose these instead of repeating breakpoint objects inline.
//
// Usage:
//   import { LAYOUT } from '@/src/utils/constants/layout';
//
//   <Box sx={{ px: LAYOUT.pagePx, borderRadius: LAYOUT.radius.md }}>
//   <Box sx={{ flexDirection: LAYOUT.row.lg }}>
//   <Box sx={{ display: 'grid', gridTemplateColumns: LAYOUT.grid.cols2 }}>

// ── Page-level spacing ────────────────────────────────────────────────────────

export const LAYOUT = {
  // Horizontal padding applied to full-width page content areas
  pagePx: { xs: 2, sm: 3, lg: 4 } as const,

  // Vertical padding applied to page content areas
  pagePy: { xs: 2, sm: 3 } as const,

  // Gap between top-level sections / sibling cards
  sectionGap: { xs: 2, sm: 3 } as const,

  // Inner padding of a card / panel
  cardPadding: { xs: 2, sm: 3 } as const,

  // Gap between items inside a card
  cardGap: { xs: 1.5, sm: 2 } as const,

  // ── Border-radius scale ─────────────────────────────────────────────────────
  // Use these to keep rounding consistent across the UI.
  radius: {
    pill: '999px',  // fully rounded (badges, chips)
    xl:   '24px',   // very large panels
    lg:   '20px',   // main page sections
    md:   '16px',   // standard cards
    sm:   '12px',   // inner cards, dialogs
    xs:   '8px',    // buttons, inputs, small chips
  } as const,

  // ── Font-size scale (px) ───────────────────────────────────────────────────
  fontSize: {
    '2xs': 10,
    xs:    11,
    sm:    12,
    md:    13,
    lg:    14,
    xl:    16,
    '2xl': 18,
    '3xl': 22,
    '4xl': 28,
  } as const,

  // ── Flex-direction helpers ─────────────────────────────────────────────────
  // Use to flip a horizontal layout to vertical on small screens.
  row: {
    sm: { xs: 'column', sm: 'row' } as const,
    md: { xs: 'column', md: 'row' } as const,
    lg: { xs: 'column', lg: 'row' } as const,
  },

  // ── CSS grid column helpers ────────────────────────────────────────────────
  // Use with `gridTemplateColumns` for responsive grid layouts.
  grid: {
    // Two equal columns — stacks on mobile
    cols2: { xs: '1fr', sm: '1fr 1fr' } as const,
    // Three equal columns — stacks on mobile, 2-col on tablet
    cols3: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' } as const,
    // Four equal columns — 2-col on mobile
    cols4: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' } as const,
    // Classic sidebar layout (2/3 + 1/3)
    sidebar: { xs: '1fr', lg: '2fr 1fr' } as const,
    // Wide sidebar layout (3/4 + 1/4)
    sidebarWide: { xs: '1fr', lg: '3fr 1fr' } as const,
  },

  // ── Common max-widths ──────────────────────────────────────────────────────
  maxWidth: {
    sm:   '480px',
    md:   '720px',
    lg:   '1024px',
    xl:   '1280px',
    full: '100%',
  } as const,

  // ── Z-index scale ──────────────────────────────────────────────────────────
  zIndex: {
    base:    1,
    card:    10,
    overlay: 100,
    modal:   200,
    toast:   300,
  } as const,
} as const;
