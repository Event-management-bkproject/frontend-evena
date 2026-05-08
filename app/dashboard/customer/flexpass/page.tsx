'use client';

import { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab, Chip } from '@mui/material';
import {
  Storefront as MarketIcon,
  SellOutlined as SellIcon,
  ReceiptLong as ListingsIcon,
  SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { MarketplaceTab } from '@/src/components/FlexPassCustomer/MarketplaceTab';
import { SellTab } from '@/src/components/FlexPassCustomer/SellTab';
import { MyListingsTab } from '@/src/components/FlexPassCustomer/MyListingsTab';
import { useFlexPassSSE } from '@/src/components/FlexPassCustomer/useFlexPassSSE';

const TABS = [
  { value: 'marketplace', label: 'Marketplace',   icon: <MarketIcon   sx={{ fontSize: 18 }} /> },
  { value: 'sell',        label: 'Sell a Ticket',  icon: <SellIcon     sx={{ fontSize: 18 }} /> },
  { value: 'listings',    label: 'My Listings',    icon: <ListingsIcon sx={{ fontSize: 18 }} /> },
] as const;
type TabValue = typeof TABS[number]['value'];

export default function FlexPassCustomerPage() {
  const [tab, setTab] = useState<TabValue>('marketplace');
  useFlexPassSSE();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Header />

      {/* ── Hero ── */}
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)', pt: { xs: 4, md: 5 }, pb: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: 'linear-gradient(135deg,#A78BFA,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SwapIcon sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>FlexPass</Typography>
                <Chip label="Beta" size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(167,139,250,0.2)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)', height: 18 }} />
              </Box>
              <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.25, mb: 1, maxWidth: 480 }}>
                Official Secondary Ticket Marketplace
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 420, lineHeight: 1.7 }}>
                Organizer-verified resales · price-capped 50%–120% · fraud-free QR transfer
              </Typography>
            </Box>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, flexWrap: 'wrap' }}>
              {[
                { value: '50–120%', label: 'Price range' },
                { value: '0',       label: 'Max transfers' },
                { value: '14 days', label: 'Listing window' },
              ].map(s => (
                <Box key={s.label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, color: '#A78BFA', lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          {/* Tab bar */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', mb: 2.5, overflow: 'hidden' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: '2px 2px 0 0', bgcolor: '#7C3AED' },
                '& .MuiTab-root': { textTransform: 'none', fontSize: 14, fontWeight: 600, color: '#64748B', py: 1.75, gap: 0.75, minHeight: 52 },
                '& .Mui-selected': { color: '#7C3AED' },
              }}
            >
              {TABS.map(t => (
                <Tab key={t.value} value={t.value} label={t.label} icon={t.icon} iconPosition="start" />
              ))}
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ bgcolor: '#fff', borderRadius: '14px', p: { xs: 2.5, md: 3 }, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
            {tab === 'marketplace' && <MarketplaceTab />}
            {tab === 'sell'        && <SellTab />}
            {tab === 'listings'    && <MyListingsTab />}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
