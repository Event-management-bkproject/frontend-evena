'use client';

import { Box, Typography } from '@mui/material';
import { HOW_IT_WORKS } from './types';
import { BRAND } from '@/src/utils/constants/constant';

const STEP_ICONS = ['🛒', '📝', '✅', '💸'];

export function HowItWorks() {
  return (
    <Box>
      <Box sx={{ mb: '18px' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>
          How FlexPass Works
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: '3px' }}>
          Safe, verified, responsible ticket resale
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '10px',
      }}>
        {HOW_IT_WORKS.map((step, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              bgcolor: '#f8fafc',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '12px',
              p: '14px',
            }}
          >
            <Box sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: BRAND.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}>
              {STEP_ICONS[i] ?? '🔹'}
            </Box>
            <Box>
              <Typography sx={{
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: '3px',
              }}>
                Step {i + 1}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#475569', lineHeight: 1.55 }}>
                {i === 0 ? (
                  <>Select <strong>FlexPass</strong> at checkout — ticket is linked to eKYC identity</>
                ) : step}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
