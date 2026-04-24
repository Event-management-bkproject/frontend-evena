'use client';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { HowItWorks } from '@/src/components/FlexPassCustomer/HowItWorks';
import { MarketplaceTab } from '@/src/components/FlexPassCustomer/MarketplaceTab';
import { SellTab } from '@/src/components/FlexPassCustomer/SellTab';
import { MyListingsTab } from '@/src/components/FlexPassCustomer/MyListingsTab';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';
import { FlexPassAPI } from '@/src/stores/services/FlexPassApi';
import { useAppDispatch } from '@/src/stores/hooks';

type TabType = 'marketplace' | 'sell' | 'mine';

const TABS: { value: TabType; label: string }[] = [
  { value: 'marketplace', label: 'Resale Market' },
  { value: 'sell',        label: 'Sell a Ticket' },
  { value: 'mine',        label: 'My Listings' },
];

export default function FlexPassCustomerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const { lastEvent } = useSSE();
  const dispatch = useAppDispatch();

  // SSE-014: explicit subscription — refetch FlexPass listing cache on relevant events
  useEffect(() => {
    if (!lastEvent) return;
    const refetchEvents = [
      SSENormalizedType.FLEXPASS_LISTING_APPROVED,
      SSENormalizedType.FLEXPASS_LISTING_REJECTED,
      SSENormalizedType.FLEXPASS_LISTING_EXPIRED,
      SSENormalizedType.FLEXPASS_PRICE_LOCKED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_OPENED,
      SSENormalizedType.FLEXPASS_SALE_WINDOW_CLOSED,
      SSENormalizedType.FLEXPASS_TRANSFER_COMPLETED,
      SSENormalizedType.FLEXPASS_TRANSFER_FAILED,
      SSENormalizedType.FLEXPASS_REFUND_COMPLETED,
      SSENormalizedType.FLEXPASS_REFUND_FAILED,
    ] as SSENormalizedType[];
    if (refetchEvents.includes(lastEvent.type)) {
      dispatch(FlexPassAPI.util.invalidateTags(['FlexPassListing']));
    }
  }, [lastEvent, dispatch]);

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Box sx={{ flex: 1, py: '24px', px: { xs: '16px', sm: '24px' } }}>
        <Box sx={{ maxWidth: 680, mx: 'auto' }}>

          {/* Page header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '18px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, color: '#030213' }}>FlexPass</Typography>
              <Box sx={{ fontSize: 11, fontWeight: 600, px: '10px', py: '3px', borderRadius: '20px',
                bgcolor: '#eff6ff', color: '#3b82f6' }}>
                marketplace
              </Box>
            </Box>
            <Typography sx={{ fontSize: 12, color: '#717182' }}>Flexible tickets · responsibly</Typography>
          </Box>

          {/* Tabs card */}
          <Box sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '15px',
            overflow: 'hidden', mb: '16px' }}>
            {/* Tab nav */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              {TABS.map((tab) => (
                <Box key={tab.value} component="button" onClick={() => setActiveTab(tab.value)}
                  sx={{ flex: 1, textAlign: 'center', py: '10px', fontSize: 13,
                    border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                    borderBottom: `2px solid ${activeTab === tab.value ? '#030213' : 'transparent'}`,
                    color: activeTab === tab.value ? '#030213' : '#717182',
                    fontWeight: activeTab === tab.value ? 600 : 400,
                    transition: 'all 0.15s' }}>
                  {tab.label}
                </Box>
              ))}
            </Box>

            {/* Tab content */}
            <Box sx={{ p: '16px' }}>
              {activeTab === 'marketplace' && <MarketplaceTab />}
              {activeTab === 'sell'        && <SellTab />}
              {activeTab === 'mine'        && <MyListingsTab />}
            </Box>
          </Box>

          <HowItWorks />
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
