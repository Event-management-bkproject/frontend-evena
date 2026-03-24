import { Box, Typography, Avatar } from '@mui/material';
import { CheckCircleOutline as ApproveIcon, HighlightOff as RejectIcon, AccessTime as ClockIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { ResaleTicket, STATUS_CONFIG, formatCurrency } from './types';

interface ResaleCardProps {
  ticket: ResaleTicket;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ResaleCard({ ticket, onApprove, onReject }: ResaleCardProps) {
  const priceChange = ((ticket.resalePrice - ticket.originalPrice) / ticket.originalPrice) * 100;
  const isAtCost = priceChange === 0;
  const sc = STATUS_CONFIG[ticket.status];

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.08)',
        p: '16px',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: BRAND.primary },
      }}
    >
      <Box sx={{ display: 'flex', gap: '14px' }}>
        {/* Event icon */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f36bf9 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          🎫
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Title + status badge */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '6px', gap: '8px' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213', mb: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ticket.eventName} · {ticket.category}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#717182' }}>
                {ticket.quantity} ticket{ticket.quantity !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 600,
                px: '10px',
                py: '3px',
                borderRadius: '20px',
                bgcolor: sc.bg,
                color: sc.color,
                border: `1px solid ${sc.border}`,
                whiteSpace: 'nowrap',
              }}
            >
              {sc.label}
            </Box>
          </Box>

          {/* Seller */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '8px' }}>
            <Avatar sx={{ width: 18, height: 18, fontSize: 9, fontWeight: 600, bgcolor: '#eef0ff', color: BRAND.darkSecondary }}>
              {ticket.seller.initials}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: '#717182' }}>{ticket.seller.name} ·</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f7f7f7', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', px: '8px', py: '2px' }}>
              <Typography sx={{ fontSize: 11, color: '#717182' }}>
                ⭐ {ticket.seller.rating} · {ticket.seller.transactions} txns
              </Typography>
            </Box>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', mb: ticket.status === 'pending' ? '12px' : '8px' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#030213' }}>{formatCurrency(ticket.resalePrice)}</Typography>
            <Typography sx={{ fontSize: 12, color: '#717182', textDecoration: 'line-through' }}>{formatCurrency(ticket.originalPrice)}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: isAtCost ? '#717182' : '#10b981' }}>
              {isAtCost ? 'Face value' : `+${priceChange.toFixed(0)}%`}
            </Typography>
          </Box>

          {/* Approve / Reject (pending only) */}
          {ticket.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Box
                component="button"
                onClick={() => onReject(ticket.id)}
                sx={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  px: '12px', py: '7px', borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)', bgcolor: 'white', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: '#717182',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#f7f7f7' },
                }}
              >
                <RejectIcon sx={{ fontSize: 14 }} />
                Reject
              </Box>
              <Box
                component="button"
                onClick={() => onApprove(ticket.id)}
                sx={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  px: '12px', py: '7px', borderRadius: '8px',
                  border: 'none', bgcolor: '#030213', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'white',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: BRAND.darkSecondary },
                }}
              >
                <ApproveIcon sx={{ fontSize: 14 }} />
                Approve
              </Box>
            </Box>
          )}

          {/* Listed date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '8px' }}>
            <ClockIcon sx={{ fontSize: 12, color: '#717182' }} />
            <Typography sx={{ fontSize: 11, color: '#717182' }}>Listed {ticket.listedDate}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
