import { Box, Typography, LinearProgress } from '@mui/material';

export function EventCard() {
  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '15px', p: '16px', mb: '16px' }}>
      <Box sx={{ display: 'flex', gap: '14px', alignItems: 'flex-start', mb: '14px' }}>
        <Box sx={{ width: 60, height: 60, borderRadius: '10px', background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
          🎸
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: '3px', color: '#030213' }}>Coldplay World Tour — Hanoi</Typography>
          <Typography sx={{ fontSize: 13, color: '#717182' }}>My Dinh Stadium · 14/09/2025</Typography>
          <Box sx={{ mt: '8px', display: 'flex', gap: '6px' }}>
            <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px', bgcolor: '#ecfdf5', color: '#065f46' }}>Verified</Box>
            <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px', bgcolor: '#fffbeb', color: '#92400e' }}>Resale opens in 2 days</Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', my: '14px' }} />
      <LinearProgress
        variant="determinate"
        value={78}
        sx={{ height: 4, borderRadius: 2, bgcolor: '#f7f7f7', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a', borderRadius: 2 } }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '6px' }}>
        <Typography sx={{ fontSize: 12, color: '#717182' }}>78% sold</Typography>
        <Typography sx={{ fontSize: 12, color: '#717182' }}>462 FlexPass tickets remaining</Typography>
      </Box>
    </Box>
  );
}
