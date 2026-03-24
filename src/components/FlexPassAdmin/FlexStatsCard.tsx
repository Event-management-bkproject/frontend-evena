import React from 'react';
import { Box, Typography } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

interface FlexStatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg: string;
}

export function FlexStatsCard({ title, value, change, icon, iconBg }: FlexStatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '15px', border: '1px solid rgba(0,0,0,0.07)', p: '18px', flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '12px' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {isPositive
              ? <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />
              : <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: isPositive ? '#10b981' : '#ef4444' }}>
              {Math.abs(change)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 13, color: '#717182', mb: '4px' }}>{title}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#030213' }}>{value}</Typography>
    </Box>
  );
}
