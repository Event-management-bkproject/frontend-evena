import { Box, Typography } from '@mui/material';
import { FileDownload as DownloadIcon, OpenInNew as ResellIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';

export function MyTicketsTab() {
  return (
    <>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Tickets held
      </Typography>
      <Box sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', p: '14px', mb: '14px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '14px' }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#030213' }}>Coldplay · GA Zone · 2 tickets</Typography>
            <Typography sx={{ fontSize: 12, color: '#717182', mt: '2px' }}>14/09/2025 · FlexPass expires in 11 days</Typography>
          </Box>
          <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px', bgcolor: '#ecfdf5', color: '#065f46' }}>
            Valid
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.07)', my: '14px' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '4px' }}>
          <Typography sx={{ fontSize: 13, color: '#717182' }}>Purchase price</Typography>
          <Typography sx={{ fontSize: 13, color: '#030213' }}>1,200,000 ₫ / ticket</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: '4px' }}>
          <Typography sx={{ fontSize: 13, color: '#717182' }}>Max resale price</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>1,440,000 ₫ / ticket</Typography>
        </Box>
        <Box sx={{ mt: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Box
            component="button"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              py: '9px', fontSize: 13, fontWeight: 600,
              border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px',
              bgcolor: 'transparent', cursor: 'pointer', color: '#030213',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: '#f7f7f7' },
            }}
          >
            <DownloadIcon sx={{ fontSize: 14 }} />
            Download QR
          </Box>
          <Box
            component="button"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              py: '9px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: '8px',
              bgcolor: '#030213', cursor: 'pointer', color: 'white',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: BRAND.darkSecondary },
            }}
          >
            <ResellIcon sx={{ fontSize: 14 }} />
            List for Resale
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', mb: '10px' }}>
        Transaction history
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#717182' }}>
        Sold successfully · Radiohead 2024 · +15% · ⭐ 5.0
      </Typography>
    </>
  );
}
