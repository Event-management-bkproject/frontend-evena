'use client';

import { Box } from '@mui/material';
import { AuthLayoutProps } from './types';

/**
 * Split-screen auth layout.
 * Left = brand hero panel (hidden on mobile).
 * Right = scrollable form panel.
 */
export function AuthLayout({ children, maxWidth = 480 }: AuthLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left hero panel ─────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 42%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: 7,
          py: 6,
          background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(243,107,249,0.12)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(96,147,252,0.1)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '38%', right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(243,107,249,0.07)', pointerEvents: 'none' }} />

        {/* Logo + brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6, zIndex: 1 }}>
          {/* SVG ticket icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F36BF9 0%, #6093FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M3 4C1.897 4 1 4.897 1 6V8c0 .275.231.49.491.581C2.078 8.784 2.5 9.344 2.5 10s-.422 1.216-1.009 1.419C1.231 11.51 1 11.725 1 12v2C1 15.103 1.897 16 3 16h14c1.103 0 2-.897 2-2v-2c0-.275-.231-.49-.491-.581C17.922 11.216 17.5 10.656 17.5 10s.422-1.216 1.009-1.419C18.769 8.49 19 8.275 19 8V6c0-1.103-.897-2-2-2H3ZM14 12.5v-5H6v5h8ZM4.5 7c0-.552.448-1 1-1h9c.552 0 1 .448 1 1v6c0 .552-.448 1-1 1h-9c-.552 0-1-.448-1-1V7Z" fill="white"/>
            </svg>
          </Box>
          <Box>
            <Box sx={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}>Evena</Box>
            <Box sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Event Platform</Box>

          </Box>
        </Box>

        {/* Headline */}
        <Box sx={{ zIndex: 1, mb: 5 }}>
          <Box sx={{ color: '#fff', fontSize: { md: 28, lg: 34 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.5px', mb: 1.5 }}>
            All your events<br />
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #F36BF9, #6093FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in one place
            </Box>
          </Box>
          <Box sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Buy tickets, sell tickets, manage events and trade FlexPasses — all in one modern platform.
          </Box>
        </Box>

        {/* Feature list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1 }}>
          {[
            { icon: '🎟️', text: 'Buy & manage event tickets' },
            { icon: '🏢', text: 'Create and manage organizations' },
            { icon: '🔄', text: 'Trade FlexPasses seamlessly' },
          ].map((f) => (
            <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {f.icon}
              </Box>
              <Box sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>{f.text}</Box>
            </Box>
          ))}
        </Box>

        {/* Bottom tagline */}
        <Box sx={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, zIndex: 1 }}>
          © 2026 Evena · Modern Event Platform
        </Box>
      </Box>

      {/* ── Right form panel ─────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#FAFAFA',
          px: { xs: 3, sm: 6 },
          py: 4,
          overflowY: 'auto',
        }}
      >
        {/* Mobile-only logo */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #F36BF9 0%, #6093FC 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4C1.897 4 1 4.897 1 6V8c0 .275.231.49.491.581C2.078 8.784 2.5 9.344 2.5 10s-.422 1.216-1.009 1.419C1.231 11.51 1 11.725 1 12v2C1 15.103 1.897 16 3 16h14c1.103 0 2-.897 2-2v-2c0-.275-.231-.49-.491-.581C17.922 11.216 17.5 10.656 17.5 10s.422-1.216 1.009-1.419C18.769 8.49 19 8.275 19 8V6c0-1.103-.897-2-2-2H3Z" fill="white"/>
            </svg>
          </Box>
          <Box sx={{ fontWeight: 800, fontSize: 20, color: '#2A3363' }}>Evena</Box>
        </Box>

        {/* Form card */}
        <Box sx={{ width: '100%', maxWidth }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
