import { Typography } from '@mui/material';
import { MarketCard } from './MarketCard';

export function ResellTab() {
  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Available resales · verified by system
      </Typography>
      <MarketCard
        emoji="🟩"
        title="GA Zone · Green Tier · 2 tickets"
        seller={{ name: 'T. Tran', initials: 'TT', rating: 4.9, transactions: 12 }}
        originalPrice={1200000}
        resalePrice={1320000}
      />
      <MarketCard
        emoji="🟨"
        title="VIP Zone · Gold Tier · 1 ticket"
        seller={{ name: 'L. Mai', initials: 'LM', rating: 5.0, transactions: 3 }}
        originalPrice={2800000}
        resalePrice={2800000}
      />
      <Typography sx={{ fontSize: 12, color: '#717182', textAlign: 'center', mt: '8px' }}>
        Tickets held in escrow · payment released upon identity verification
      </Typography>
    </>
  );
}
