import React from 'react';
import { Box, Typography } from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '25px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: '10px', sm: '15px' }, pt: { xs: '10px', sm: '15px' }, pb: '10px' }}>
        <Box
          sx={{
            width: { xs: 36, sm: 48 },
            height: { xs: 36, sm: 48 },
            borderRadius: '50%',
            bgcolor: '#F36BF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <MoreIcon sx={{ color: '#DDD8D8', fontSize: 18 }} />
      </Box>
      <Box sx={{ px: { xs: '10px', sm: '15px' }, pb: { xs: '10px', sm: '15px' }, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <Typography sx={{ fontSize: { xs: 10, sm: 11 }, color: '#ADACAE', fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: { xs: 14, sm: 18 }, fontWeight: 700, color: '#36437C', wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Box>
  );
}
