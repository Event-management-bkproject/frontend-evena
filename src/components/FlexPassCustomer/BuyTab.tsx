import { Box, Typography } from '@mui/material';
import { BRAND } from '@/src/utils/constants/constant';
import { TicketCard } from './TicketCard';

interface BuyTabProps {
  selectedTicket: string | null;
  flexPassEnabled: boolean;
  onSelectTicket: (id: string) => void;
  onToggleFlexPass: () => void;
}

export function BuyTab({ selectedTicket, flexPassEnabled, onSelectTicket, onToggleFlexPass }: BuyTabProps) {
  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Select ticket tier
      </Typography>
      <TicketCard
        emoji="🟩"
        title="GA Zone · Green Tier"
        subtitle="Standing · Floor 1"
        price={1200000}
        selected={selectedTicket === 'green'}
        onClick={() => onSelectTicket('green')}
      />
      <TicketCard
        emoji="🟨"
        title="VIP Zone · Gold Tier"
        subtitle="Seated · Floor 2 · Centre"
        price={2800000}
        selected={selectedTicket === 'gold'}
        onClick={() => onSelectTicket('gold')}
      />
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', my: '14px' }} />

      {/* FlexPass toggle */}
      <Box sx={{ bgcolor: '#f7f7f7', borderRadius: '10px', p: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '12px' }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#030213' }}>Enable FlexPass</Typography>
          <Typography sx={{ fontSize: 12, color: '#717182', mt: '2px' }}>Resellable within 14 days · max +20% above face value</Typography>
        </Box>
        <Box
          component="button"
          onClick={onToggleFlexPass}
          sx={{
            position: 'relative', width: 36, height: 20, borderRadius: 10, flexShrink: 0,
            border: 'none', cursor: 'pointer',
            bgcolor: flexPassEnabled ? '#16a34a' : '#cbced4',
            transition: 'background 0.2s',
          }}
        >
          <Box
            sx={{
              position: 'absolute', top: '2px',
              left: flexPassEnabled ? '18px' : '2px',
              width: 16, height: 16, borderRadius: '50%', bgcolor: 'white',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </Box>
      </Box>

      <Box
        component="button"
        sx={{
          width: '100%', py: '11px', fontSize: 14, fontWeight: 600, textAlign: 'center',
          borderRadius: '10px', bgcolor: '#030213', color: 'white', border: 'none', cursor: 'pointer',
          transition: 'background 0.15s',
          '&:hover': { bgcolor: BRAND.darkSecondary },
        }}
      >
        Continue to Checkout
      </Box>
    </>
  );
}
