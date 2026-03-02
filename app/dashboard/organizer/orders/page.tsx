'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputBase,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  ConfirmationNumber as TicketIcon,
  CheckCircle as SoldIcon,
  AttachMoney as EarningsIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import ProtectedContent from '@/src/components/ProtectedContent';
import LayoutWithSidebar from '@/src/components/layout/LayoutWithSidebar';
import DashboardHeader from '@/src/components/DashboardHeader/DashboardHeader';
import { OrdersOverviewChart } from '@/src/components/charts/OrdersOverviewChart';
import { OrdersCategoryChart } from '@/src/components/charts/OrdersCategoryChart';
import { useGetOrganizerOrdersQuery } from '@/src/stores/services/OrderApi';
import { OrderStatus, OrderResponse } from '@/src/stores/types/order';
import ordersMock from '@/src/data/orders.sample.json';

// ─── Types ──────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'createdAt' | 'totalAmount' | 'status' | null;
type SortDir = 'asc' | 'desc';

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', bg: '#FDE3FE', color: '#F36BF9' },
  CANCELLED: { label: 'Cancelled', bg: '#FABABB', color: '#FF5B5E' },
  PENDING:   { label: 'Pending',   bg: '#EDEDED', color: '#36437C' },
  EXPIRED:   { label: 'Expired',   bg: '#FFE5CC', color: '#FF8C00' },
  REFUNDED:  { label: 'Refunded',  bg: '#CCF0F0', color: '#009999' },
};

const STATUSES = ['ALL', 'CONFIRMED', 'CANCELLED', 'PENDING', 'EXPIRED'] as const;
type StatusFilter = typeof STATUSES[number];

const PER_PAGE = 10;

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: '25px',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top: icon + more icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '15px', pt: '15px', pb: '10px' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#F36BF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <MoreIcon sx={{ color: '#DDD8D8', fontSize: 18 }} />
      </Box>
      {/* Bottom: label + value */}
      <Box sx={{ px: '15px', pb: '15px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <Typography sx={{ fontSize: 11, color: '#ADACAE', fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#36437C' }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ─── Orders Content ───────────────────────────────────────────────────────────

function OrdersContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  // const { data, isLoading, isError } = useGetOrganizerOrdersQuery({
  //   page: 0,
  //   size: 200,
  //   status: statusFilter === 'ALL' ? undefined : statusFilter,
  // });

  // const allOrders: OrderResponse[] = data?.data?.content ?? [];

  const allOrders: OrderResponse[] =
  (ordersMock as any)?.data?.content ?? [];

  const processed = useMemo(() => {
    let rows = [...allOrders];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.userEmail ?? '').toLowerCase().includes(q) ||
          (o.eventSnapshot?.title ?? '').toLowerCase().includes(q)
      );
    }

    if (sortKey) {
      rows.sort((a, b) => {
        let av: string | number = '';
        let bv: string | number = '';
        if (sortKey === 'id') { av = a.id; bv = b.id; }
        else if (sortKey === 'createdAt') { av = a.createdAt; bv = b.createdAt; }
        else if (sortKey === 'totalAmount') { av = a.totalAmount; bv = b.totalAmount; }
        else if (sortKey === 'status') { av = a.status; bv = b.status; }
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [allOrders, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PER_PAGE));
  const paged = processed.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  function handleSearch(v: string) { setSearch(v); setPage(0); }
  function handleStatus(s: StatusFilter) { setStatusFilter(s); setPage(0); }

  const totalOrders = processed.length;
  const confirmedOrders = processed.filter((o) => o.status === OrderStatus.CONFIRMED).length;
  const totalRevenue = processed
    .filter((o) => o.status === OrderStatus.CONFIRMED)
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const fmtCurrency = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M ₫`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K ₫`
      : `${n} ₫`;

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, flex: 1, minHeight: 0, height: '100%' }}>
      <DashboardHeader
        title="Orders"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard/organizer' },
          { label: 'Orders' },
        ]}
      />

      <Box
        sx={{
            bgcolor: '#F7F7F7',
            borderRadius: '20px',
            p: '25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden', // quan trọng để tránh double scroll
          }}
      >
        {/* Main two-column row */}
        <Box sx={{ display: 'flex', gap: '15px', alignItems: 'stretch' }}>

          {/* Left column: stat cards + overview chart — 50% */}
          <Box sx={{ flex: '0 0 calc(50% - 7.5px)', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Stat cards — 3 evenly spaced, gap 10px */}
            <Box sx={{ display: 'flex', gap: '10px' }}>
              <Box sx={{ flex: 1 }}>
                <StatCard icon={<TicketIcon sx={{ fontSize: 28 }} />} label="Total Orders" value={totalOrders.toLocaleString()} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <StatCard icon={<SoldIcon sx={{ fontSize: 28 }} />} label="Confirmed Orders" value={confirmedOrders.toLocaleString()} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <StatCard icon={<EarningsIcon sx={{ fontSize: 28 }} />} label="Total Revenue" value={fmtCurrency(totalRevenue)} />
              </Box>
            </Box>

            {/* Overview chart below stat cards */}
            <OrdersOverviewChart />
          </Box>

          {/* Right column: category chart — 50%, stretch to left column height */}
          <Box sx={{ flex: '0 0 calc(50% - 7.5px)', minWidth: 0, display: 'flex' }}>
            <OrdersCategoryChart />
          </Box>

        </Box>

        {/* Table card */}
        <Box  sx={{
            bgcolor: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0, // cực quan trọng để scroll hoạt động trong flex
          }}>
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: '15px',
              py: '12px',
              borderBottom: '1px solid #F7F7F7',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'black' }}>Orders List</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {/* Search */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  bgcolor: 'white',
                  border: '1px solid #EEF0FF',
                  borderRadius: '25px',
                  px: '12px',
                  py: '7px',
                }}
              >
                <SearchIcon sx={{ color: '#ADACAE', fontSize: 14, flexShrink: 0 }} />
                <InputBase
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{ fontSize: 12, color: '#36437C', width: 140, '& input::placeholder': { color: '#ADACAE' } }}
                />
              </Box>

              {/* Status filter */}
              <Box
                sx={{
                  display: 'flex',
                  gap: '4px',
                  bgcolor: 'white',
                  border: '1px solid #EEF0FF',
                  borderRadius: '25px',
                  p: '4px',
                }}
              >
                {STATUSES.map((s) => (
                  <Box
                    key={s}
                    component="button"
                    onClick={() => handleStatus(s)}
                    sx={{
                      px: '10px',
                      py: '4px',
                      borderRadius: '20px',
                      fontSize: 11,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: statusFilter === s ? 700 : 500,
                      bgcolor: statusFilter === s ? '#F36BF9' : 'transparent',
                      color: statusFilter === s ? 'white' : '#36437C',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: statusFilter === s ? '#F36BF9' : '#EEF0FF' },
                    }}
                  >
                    {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label ?? s}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'auto',
            }}>
            {/* {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={32} sx={{ color: '#F36BF9' }} />
              </Box>
            ) : isError ? (
              <Alert severity="error" sx={{ m: 2 }}>Failed to load orders.</Alert>
            ) : ( */}
              <Table sx={{ minWidth: 800, borderCollapse: 'collapse' }}>
                <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'white' }}>
                  <TableRow sx={{ borderBottom: '1px solid #F7F7F7' }}>
                    {([
                      { label: 'Order ID',    key: 'id' as SortKey,           pl: '15px', pr: '8px', width: '110px' },
                      { label: 'Date',        key: 'createdAt' as SortKey,                           width: '150px' },
                      { label: 'Name',        key: null,                                              width: '150px' },
                      { label: 'Event',       key: null,                                              width: '150px' },
                      { label: 'Ticket Type', key: null,                                              width: '150px' },
                      { label: 'Price',       key: null,                                              width: '90px',  align: 'center' },
                      { label: 'Quantity',    key: null,                                              width: '90px',  align: 'center' },
                      { label: 'Amount',      key: 'totalAmount' as SortKey,                         width: '90px',  align: 'center' },
                      { label: 'Status',      key: 'status' as SortKey,       pr: '15px',            width: '110px' },
                    ] as Array<{ label: string; key: SortKey; pl?: string; pr?: string; width?: string; align?: 'center' | 'left' }>).map(({ label, key, pl, pr, width, align }) => (
                      <TableCell
                        key={label}
                        align={align}
                        sx={{ py: '10px', px: '8px', pl: pl ?? '8px', pr: pr ?? '8px', width, cursor: key ? 'pointer' : 'default', userSelect: 'none', borderBottom: 'none' }}
                        onClick={() => key && handleSort(key)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Typography sx={{ fontWeight: 600, color: '#ADACAE', fontSize: 12, whiteSpace: 'nowrap' }}>
                            {label}
                          </Typography>
                          {key && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0 }}>
                              <Box component="span" sx={{ fontSize: 8, color: sortKey === key && sortDir === 'asc' ? '#36437C' : '#ADACAE', lineHeight: 1 }}>▲</Box>
                              <Box component="span" sx={{ fontSize: 8, color: sortKey === key && sortDir === 'desc' ? '#36437C' : '#ADACAE', lineHeight: 1 }}>▼</Box>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: '30px', color: '#ADACAE', fontSize: 12, borderBottom: 'none' }}>
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((order, i) => {
                      const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                      const { date, time } = fmtDate(order.createdAt);
                      const item = order.items?.[0];
                      const ticketTypeName = item?.ticketTypeName ?? '—';
                      const eventTitle = order.eventSnapshot?.title ?? '—';
                      const unitPrice = item?.unitPrice ?? 0;
                      const quantity = item?.quantity ?? 0;
                      return (
                        <TableRow
                          key={order.id}
                          sx={{
                            borderBottom: '1px solid #F7F7F7',
                            bgcolor: i % 2 === 1 ? '#FCFCFC' : 'white',
                            '&:hover': { bgcolor: '#FAFAFA' },
                            transition: 'background-color 0.1s',
                          }}
                        >
                          {/* Order ID — Group 2: 110px */}
                          <TableCell sx={{ py: '10px', px: '8px', pl: '20px', border: 'none', width: '110px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#36437C' }}>#{order.id}</Typography>
                          </TableCell>
                          {/* Date — Group 1: 150px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{date}</Typography>
                              <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>{time}</Typography>
                            </Box>
                          </TableCell>
                          {/* Name — Group 1: 150px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                            <Tooltip title={order.userEmail ?? ''} placement="top">
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black', maxWidth: 138, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {order.userEmail ?? '—'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          {/* Event — Group 1: 150px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black', maxWidth: 138, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {eventTitle}
                              </Typography>
                              {order.eventSnapshot?.categoryName && (
                                <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>{order.eventSnapshot.categoryName}</Typography>
                              )}
                            </Box>
                          </TableCell>
                          {/* Ticket Type — Group 1: 150px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D9D9D9', flexShrink: 0 }} />
                              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#36437C', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticketTypeName}</Typography>
                            </Box>
                          </TableCell>
                          {/* Price — Group 3: 90px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{fmtCurrency(unitPrice)}</Typography>
                          </TableCell>
                          {/* Quantity — Group 3: 90px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{quantity}</Typography>
                          </TableCell>
                          {/* Amount — Group 3: 90px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'black' }}>{fmtCurrency(order.totalAmount ?? 0)}</Typography>
                          </TableCell>
                          {/* Status — Group 2: 110px */}
                          <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '110px' }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: '8px',
                                py: '5px',
                                borderRadius: '10px',
                                bgcolor: sc.bg,
                                color: sc.color,
                                fontSize: 12,
                                fontWeight: 500,
                                minWidth: 60,
                              }}
                            >
                              {sc.label}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            {/* // )} */}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '15px', py: '10px', borderTop: '1px solid #F7F7F7' }}>
            <Typography sx={{ fontSize: 11, color: '#ADACAE' }}>
              Showing {processed.length === 0 ? 0 : page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, processed.length)} of {processed.length} orders
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Box
                component="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                sx={{ px: '10px', py: '5px', borderRadius: '8px', border: 'none', cursor: page === 0 ? 'not-allowed' : 'pointer', bgcolor: 'transparent', fontSize: 11, fontWeight: 500, color: '#36437C', opacity: page === 0 ? 0.4 : 1, '&:hover': { bgcolor: page === 0 ? 'transparent' : '#EEF0FF' } }}
              >
                Prev
              </Box>
              {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                <Box
                  key={p}
                  component="button"
                  onClick={() => setPage(p)}
                  sx={{ width: 28, height: 28, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, bgcolor: page === p ? '#36437C' : 'transparent', color: page === p ? 'white' : '#36437C', transition: 'all 0.15s', '&:hover': { bgcolor: page === p ? '#36437C' : '#EEF0FF' } }}
                >
                  {p + 1}
                </Box>
              ))}
              <Box
                component="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                sx={{ px: '10px', py: '5px', borderRadius: '8px', border: 'none', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', bgcolor: 'transparent', fontSize: 11, fontWeight: 500, color: '#36437C', opacity: page >= totalPages - 1 ? 0.4 : 1, '&:hover': { bgcolor: page >= totalPages - 1 ? 'transparent' : '#EEF0FF' } }}
              >
                Next
              </Box>
            </Box>
          </Box>
        </Box>
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
