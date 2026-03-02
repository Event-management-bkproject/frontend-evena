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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '15px', pt: '15px', pb: '10px' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
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
      <Box sx={{ px: '15px', pb: '15px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <Typography sx={{ fontSize: 11, color: '#ADACAE', fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#36437C' }}>{value}</Typography>
      </Box>
    </Box>
  );
}
