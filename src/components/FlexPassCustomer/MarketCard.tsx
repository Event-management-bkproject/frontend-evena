import { Box, Typography, Avatar } from '@mui/material';
import { formatCurrency } from './types';

interface MarketCardProps {
  emoji: string;
  title: string;
  seller: { name: string; initials: string; rating: number; transactions: number };
  originalPrice: number;
  resalePrice: number;
}

export function MarketCard({ emoji, title, seller, originalPrice, resalePrice }: MarketCardProps) {
  const pct = ((resalePrice - originalPrice) / originalPrice) * 100;
  const atCost = pct === 0;

  return (
    <Box
      sx={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
        p: '12px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        mb: '10px',
        bgcolor: 'white',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: '#f7f7f7' },
      }}
    >
      <Box sx={{ width: 52, height: 52, borderRadius: '8px', bgcolor: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {emoji}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213', mb: '4px' }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '6px' }}>
          <Avatar sx={{ width: 18, height: 18, fontSize: 9, fontWeight: 600, bgcolor: '#eff6ff', color: '#3b82f6' }}>
            {seller.initials}
          </Avatar>
          <Typography sx={{ fontSize: 12, color: '#717182' }}>{seller.name} ·</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#f7f7f7', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', px: '8px', py: '2px' }}>
            <Typography sx={{ fontSize: 11, color: '#717182' }}>⭐ {seller.rating} · {seller.transactions} txns</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#030213' }}>{formatCurrency(resalePrice)}</Typography>
          <Typography sx={{ fontSize: 12, color: '#717182', textDecoration: 'line-through' }}>{formatCurrency(originalPrice)}</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: atCost ? '#717182' : '#10b981' }}>
            {atCost ? 'Face value' : `+${pct.toFixed(0)}%`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
