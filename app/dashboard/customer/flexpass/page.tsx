'use client';

import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { FlexPassStackedTabs } from '@/src/components/FlexPassCustomer/FlexPassStackedTabs';
import { useFlexPassSSE } from '@/src/components/FlexPassCustomer/useFlexPassSSE';
import { BRAND } from '@/src/utils/constants/constant';
import { TAB_W } from '@/src/components/FlexPassCustomer/stackedTabsConstants';
import type { TabType } from '@/src/components/FlexPassCustomer/stackedTabsConstants';

export default function FlexPassCustomerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const [cardW, setCardW] = useState(0);
  const sizerRef = useRef<HTMLDivElement>(null);

  useFlexPassSSE();

  useEffect(() => {
    if (!sizerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setCardW(Math.max(320, w - TAB_W));
    });
    ro.observe(sizerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: BRAND.bgPage }}>
      <Header />
      <Box sx={{ flex: 1, px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}>
        {/* zero-height sizer — measures true available width without being affected by child overflow */}
        <div ref={sizerRef} style={{ width: '100%', height: 0 }} />
        {cardW > 0 && (
          <FlexPassStackedTabs activeTab={activeTab} setActiveTab={setActiveTab} cardW={cardW} />
        )}
      </Box>
      <Footer />
    </Box>
  );
}
