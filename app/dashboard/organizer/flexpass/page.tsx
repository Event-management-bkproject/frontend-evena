'use client';

import { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as TrendingUpIcon,
  ErrorOutline as AlertIcon,
} from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { BRAND } from '@/src/utils/constants/constant';
import { FlexStatsCard } from '@/src/components/FlexPassAdmin/FlexStatsCard';
import { ResaleListings } from '@/src/components/FlexPassAdmin/ResaleListings';
import { MOCK_TICKETS, StatusFilter, ResaleTicket } from '@/src/components/FlexPassAdmin/types';

// ─── Main Content ─────────────────────────────────────────────────────────────

function FlexPassAdminContent() {
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<ResaleTicket[]>(MOCK_TICKETS);

  const handleApprove = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'approved' as const } : t));
  };

  const handleReject = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'rejected' as const } : t));
  };

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || t.eventName.toLowerCase().includes(q) || t.seller.name.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [tickets, filterStatus, searchQuery]);

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, flex: 1, height: '100%', overflow: 'hidden' }}>
      <DashboardHeader
        title="FlexPass Admin"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/organizer' },
          { label: 'FlexPass' },
        ]}
      />

      {/* Body panel — no scroll here */}
      <Box
        sx={{
          bgcolor: BRAND.bgSection,
          borderRadius: '20px',
          p: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Stats row — fixed */}
        <Box sx={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <FlexStatsCard
            title="Total FlexPass Tickets"
            value="1,245"
            change={12}
            icon={<TicketIcon sx={{ fontSize: 20, color: BRAND.primary }} />}
            iconBg="#fef1ff"
          />
          <FlexStatsCard
            title="Active Resales"
            value="462"
            change={-5}
            icon={<ShoppingBagIcon sx={{ fontSize: 20, color: '#3b82f6' }} />}
            iconBg="#eff6ff"
          />
          <FlexStatsCard
            title="Success Rate"
            value="78%"
            change={8}
            icon={<TrendingUpIcon sx={{ fontSize: 20, color: '#10b981' }} />}
            iconBg="#ecfdf5"
          />
          <FlexStatsCard
            title="Awaiting Approval"
            value={String(pendingCount)}
            icon={<AlertIcon sx={{ fontSize: 20, color: '#f59e0b' }} />}
            iconBg="#fffbeb"
          />
        </Box>

        {/* Listings — only this section scrolls */}
        <ResaleListings
          tickets={filtered}
          filterStatus={filterStatus}
          searchQuery={searchQuery}
          onFilterChange={setFilterStatus}
          onSearchChange={setSearchQuery}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlexPassAdminPage() {
  return (
    <ProtectedContent>
      <LayoutWithSidebar currentPage="flexpass">
        <FlexPassAdminContent />
      </LayoutWithSidebar>
    </ProtectedContent>
  );
}
