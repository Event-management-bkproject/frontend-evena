'use client';

import { useMemo } from 'react';
import {
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BRAND } from '@/src/utils/constants/constant';
import {
  ConfirmationNumber as TicketIcon,
  CheckCircle as SoldIcon,
  AttachMoney as EarningsIcon,
} from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { OrdersOverviewChart } from '@/src/components/charts/OrdersOverviewChart';
import { OrdersCategoryChart } from '@/src/components/charts/OrdersCategoryChart';
import { useGetOrganizerOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderResponse, OrderStatus } from '@/src/stores/types/order';
import { StatCard } from '@/src/components/common/StatCard/StatCard';
import { formatCurrency } from '@/src/utils/format';
import { SAMPLE_ORDERS } from './sample.data';
import { OrganizerOrdersTable } from '@/src/components/organizer/OrganizerOrdersTable';

// ─── Orders Content ───────────────────────────────────────────────────────────

function OrdersContent() {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useGetOrganizerOrdersQuery({
    page: 0,
    size: 200,
  });

  const allOrders: OrderResponse[] = data?.data?.content?.length ? data.data.content : SAMPLE_ORDERS;

  // Stat cards always computed from the full unfiltered list
  const totalOrders = allOrders.length;
  const confirmedOrders = useMemo(
    () => allOrders.filter((o) => o.status === OrderStatus.CONFIRMED).length,
    [allOrders]
  );
  const totalRevenue = useMemo(
    () => allOrders
      .filter((o) => o.status === OrderStatus.CONFIRMED)
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    [allOrders]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, flex: 1, minHeight: 0, height: '100%' }}>
      <DashboardHeader
        title={t('common.navigation.orders')}
        breadcrumbs={[
          { label: t('common.navigation.dashboard'), href: '/dashboard/organizer' },
          { label: t('common.navigation.orders') },
        ]}
      />

      <Box
        sx={{
          bgcolor: BRAND.bgSection,
          borderRadius: '20px',
          p: '25px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          overflow: 'auto',
        }}
      >
        {/* Charts + stat cards row */}
        <Box sx={{ display: 'flex', gap: '15px', alignItems: 'stretch', flexShrink: 0, flexDirection: { xs: 'column', md: 'row' }, height: { xs: 'auto', md: '360px' } }}>

          {/* Left: stat cards + overview chart */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 calc(50% - 7.5px)' }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Box sx={{ display: 'grid', gap: '10px', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' } }}>
              <StatCard icon={<TicketIcon sx={{ fontSize: 28 }} />} label={t('organizer.totalOrders')} value={totalOrders.toLocaleString()} />
              <StatCard icon={<SoldIcon sx={{ fontSize: 28 }} />} label={t('organizer.confirmedOrders')} value={confirmedOrders.toLocaleString()} />
              <StatCard icon={<EarningsIcon sx={{ fontSize: 28 }} />} label={t('organizer.totalRevenue')} value={formatCurrency(totalRevenue)} />
            </Box>
            <OrdersOverviewChart orders={allOrders} />
          </Box>

          {/* Right: category chart */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 calc(50% - 7.5px)' }, minWidth: 0, display: 'flex', height: { xs: 320, md: '100%' } }}>
            <OrdersCategoryChart orders={allOrders} />
          </Box>
        </Box>

        {/* Orders table — SSE integrated */}
        <OrganizerOrdersTable
          orders={allOrders}
          isLoading={isLoading}
          isError={isError}
        />
      </Box>
    </Box>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OrganizerOrdersPage() {
  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="orders">
        <OrdersContent />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
