'use client';

import { Box, Container, Typography, Button, Chip } from '@mui/material';
import { Storefront as StorefrontIcon, SellOutlined as SellIcon, VerifiedUser as VerifiedIcon, Lock as LockIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import ProtectedContent from '@/src/components/ProtectedContent';
import { MarketplaceTab } from '@/src/components/FlexPassCustomer/MarketplaceTab';
import { useFlexPassSSE } from '@/src/components/FlexPassCustomer/useFlexPassSSE';

const TRUST_BADGES = [
  { icon: <VerifiedIcon sx={{ fontSize: 14 }} />, label: 'Organizer verified' },
  { icon: <LockIcon sx={{ fontSize: 14 }} />, label: 'Escrow payment' },
];

function MarketplaceContent() {
  const router = useRouter();
  useFlexPassSSE();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F0F9FF' }}>
      <Header />

      {/* Hero — ocean blue */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 55%, #0891B2 100%)',
        pt: { xs: 4, md: 5 }, pb: { xs: 3, md: 4 },
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, right: 120, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              {/* Label row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '9px',
                  background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
                }}>
                  <StorefrontIcon sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Ticket Marketplace
                </Typography>
                <Chip label="Live" size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(56,189,248,0.2)', color: '#7DD3FC', border: '1px solid rgba(56,189,248,0.35)', height: 18 }} />
              </Box>

              <Typography sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.25, mb: 1 }}>
                Buy Resale Tickets Safely
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 440, lineHeight: 1.7, mb: 2 }}>
                Price-capped 50%–120% of face value · QR transferred instantly after payment
              </Typography>

              {/* Trust badges */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {TRUST_BADGES.map((b) => (
                  <Box key={b.label} sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 1.5, py: 0.5, borderRadius: '20px',
                    bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                    fontSize: 12, fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    {b.icon} {b.label}
                  </Box>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={<SellIcon />}
              onClick={() => router.push('/dashboard/customer/flexpass?tab=sell')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                textTransform: 'none', fontWeight: 600,
                fontSize: 13, borderRadius: '10px', px: 2.5, py: 1,
                boxShadow: 'none',
                alignSelf: { xs: 'flex-start', sm: 'center' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', boxShadow: 'none' },
              }}
            >
              Sell a Ticket
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Content — no white wrapper card, full-width feel */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, flex: 1 }}>
        <MarketplaceTab />
      </Container>

      <Footer />
    </Box>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedContent>
      <MarketplaceContent />
    </ProtectedContent>
  );
}
