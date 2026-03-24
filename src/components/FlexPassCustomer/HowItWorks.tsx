import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import { HOW_IT_WORKS } from './types';

export function HowItWorks() {
  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        How it works
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {HOW_IT_WORKS.map((step, i) => (
          <Fragment key={i}>
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 22, height: 22, borderRadius: '50%',
                  bgcolor: '#eff6ff', color: '#3b82f6',
                  fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, mt: '1px',
                }}
              >
                {i + 1}
              </Box>
              <Typography sx={{ pt: '2px', fontSize: 13, color: '#030213' }}>
                {i === 0 ? (
                  <>Buyer selects <strong>FlexPass</strong> at checkout — ticket is linked to eKYC identity</>
                ) : step}
              </Typography>
            </Box>
            {i < HOW_IT_WORKS.length - 1 && (
              <Box sx={{ width: 1, height: 22, bgcolor: '#e9ebef', ml: '10px' }} />
            )}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
