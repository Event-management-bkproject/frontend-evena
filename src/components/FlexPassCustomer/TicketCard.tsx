import { Box, Typography } from '@mui/material';
import { formatCurrency } from './types';

interface TicketCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  price: number;
  selected: boolean;
  onClick: () => void;
}

export function TicketCard({ emoji, title, subtitle, price, selected, onClick }: TicketCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: `1px solid ${selected ? '#3b82f6' : 'rgba(0,0,0,0.08)'}`,
        bgcolor: selected ? '#eff6ff' : 'white',
        borderRadius: '10px',
        p: '12px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        mb: '10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { bgcolor: selected ? '#eff6ff' : '#f7f7f7' },
      }}
    >
      <Box sx={{ width: 52, height: 52, borderRadius: '8px', bgcolor: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {emoji}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213' }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: '#717182' }}>{subtitle}</Typography>
        <Box sx={{ mt: '6px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#030213' }}>{formatCurrency(price)}</Typography>
          <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px', bgcolor: '#eff6ff', color: '#3b82f6' }}>
            FlexPass
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
