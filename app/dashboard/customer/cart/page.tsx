'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Grid, CircularProgress,
  Dialog, DialogContent, IconButton, Divider, Tabs, Tab, Pagination,
} from '@mui/material';
import {
  ShoppingBag, ConfirmationNumber, Close, QrCode2, Place, CalendarToday,
  CheckCircle, Cancel, AccessTime, Visibility,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetMyOrdersQuery,
  useGetMyTicketsQuery,
  useCancelOrderMutation,
} from '@/src/stores/services/OrderApi';
import {
  OrderStatus, OrderListResponse, TicketStatus, TicketResponse,
} from '@/src/stores/types/order';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import SnackbarNotification from '@/src/components/SnackbarNotification';
import { ConfirmationDialog } from '@/src/components/ConfirmationDialog';
import { useSnackbar } from '@/src/hooks/useSnackbar';
import { useTranslation } from 'react-i18next';
import { useSSE } from '@/src/providers/SSEProvider';
import { SSENormalizedType } from '@/src/stores/types/sse';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// ── Status configs ───────────────────────────────────────────────────────────

const ORDER_GRADIENT: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]:  'linear-gradient(135deg,#22C55E,#16A34A)',
  [OrderStatus.PENDING]:    'linear-gradient(135deg,#F97316,#EA580C)',
  [OrderStatus.PROCESSING]: 'linear-gradient(135deg,#6093FC,#2563EB)',
  [OrderStatus.CANCELLED]:  'linear-gradient(135deg,#94A3B8,#64748B)',
  [OrderStatus.EXPIRED]:    'linear-gradient(135deg,#94A3B8,#64748B)',
  [OrderStatus.REFUNDED]:   'linear-gradient(135deg,#A78BFA,#7C3AED)',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]:  'Confirmed',
  [OrderStatus.PENDING]:    'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.CANCELLED]:  'Cancelled',
  [OrderStatus.EXPIRED]:    'Expired',
  [OrderStatus.REFUNDED]:   'Refunded',
};

const TICKET_STATUS_CFG: Record<TicketStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  [TicketStatus.ACTIVE]:          { label: 'Active',          color: '#16A34A', bg: 'rgba(255,255,255,0.92)', icon: <CheckCircle sx={{ fontSize: 12 }} /> },
  [TicketStatus.TRANSFER_LOCKED]: { label: 'Transfer Locked', color: '#D97706', bg: 'rgba(255,255,255,0.92)', icon: <AccessTime sx={{ fontSize: 12 }} /> },
  [TicketStatus.USED]:            { label: 'Used',            color: '#475569', bg: 'rgba(255,255,255,0.92)', icon: <AccessTime sx={{ fontSize: 12 }} /> },
  [TicketStatus.CANCELLED]:       { label: 'Cancelled',       color: '#DC2626', bg: 'rgba(255,255,255,0.92)', icon: <Cancel sx={{ fontSize: 12 }} /> },
  [TicketStatus.EXPIRED]:         { label: 'Expired',         color: '#64748B', bg: 'rgba(255,255,255,0.92)', icon: <Cancel sx={{ fontSize: 12 }} /> },
};

// ── Shared sub-components ────────────────────────────────────────────────────

function TicketStatusChip({ status }: { status: TicketStatus }) {
  const cfg = TICKET_STATUS_CFG[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9', icon: null };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: cfg.bg }}>
      <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
}

function TearLine() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#F8FAFC', flexShrink: 0, ml: -3.5 }} />
      <Box sx={{ flex: 1, borderTop: '2px dashed #F1F5F9', mx: 1 }} />
      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#F8FAFC', flexShrink: 0, mr: -3.5 }} />
    </Box>
  );
}

// ── Order card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onCancel,
  isCancelling,
  onViewTickets,
}: {
  order: OrderListResponse;
  onCancel: (id: number) => void;
  isCancelling: boolean;
  onViewTickets: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const gradient = ORDER_GRADIENT[order.status] ?? ORDER_GRADIENT[OrderStatus.CANCELLED];
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;

  const itemsSummary = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.quantity}× ${i.ticketTypeName}`).join(' · ')
    : `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        transition: 'transform 0.25s, box-shadow 0.25s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(96,147,252,0.16)' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Gradient header */}
      <Box sx={{ p: 2.5, background: gradient, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: 15, lineHeight: 1.3, mb: 0.5, pr: 7 }} noWrap>
          {order.eventTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
          Order #{order.id}
        </Typography>
        <Box
          sx={{
            position: 'absolute', top: 12, right: 12,
            px: 1.5, py: 0.4, borderRadius: '20px',
            bgcolor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {statusLabel.toUpperCase()}
          </Typography>
        </Box>
      </Box>

      <TearLine />

      {/* Body */}
      <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B', flexShrink: 0 }}>
              <ConfirmationNumber sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: 12 }}>Tickets</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, color: '#334155', maxWidth: 150, textAlign: 'right' }} noWrap>
              {itemsSummary}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
              <CalendarToday sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: 12 }}>Date</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontSize: 12, color: '#64748B' }}>Total</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
              {order.totalAmount === 0 ? 'Free' : formatVND(order.totalAmount)}
            </Typography>
          </Box>
        </Box>

        {/* Primary action */}
        <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={() => router.push(`/dashboard/customer/cart/${order.id}`)}
              sx={{
                borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 13,
                background: gradient, boxShadow: 'none',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
              }}
            >
              {order.status === OrderStatus.PENDING ? t('customer.payNow') : t('customer.continuePayment')}
            </Button>
          )}

          {order.status === OrderStatus.CONFIRMED && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<ConfirmationNumber sx={{ fontSize: 15 }} />}
              onClick={onViewTickets}
              sx={{
                borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 13,
                background: 'linear-gradient(135deg,#F36BF9,#6093FC)', boxShadow: 'none',
                '&:hover': { boxShadow: '0 4px 12px rgba(96,147,252,0.3)' },
              }}
            >
              {t('customer.viewMyTickets')}
            </Button>
          )}

          {/* Secondary actions row */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility sx={{ fontSize: 14 }} />}
              onClick={() => router.push(`/dashboard/customer/cart/${order.id}`)}
              sx={{
                flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 12,
                borderColor: '#E2E8F0', color: '#475569',
                '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
              }}
            >
              Details
            </Button>

            {order.status === OrderStatus.PENDING && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Cancel sx={{ fontSize: 14 }} />}
                onClick={() => onCancel(order.id)}
                disabled={isCancelling}
                sx={{
                  flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600, fontSize: 12,
                  borderColor: '#FCA5A5', color: '#EF4444',
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.04)', borderColor: '#EF4444' },
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Ticket card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, onViewQR }: { ticket: TicketResponse; onViewQR: (t: TicketResponse) => void }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        transition: 'transform 0.25s, box-shadow 0.25s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 28px rgba(96,147,252,0.16)' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          background: ticket.status === TicketStatus.ACTIVE
            ? 'linear-gradient(135deg,#F36BF9 0%,#6093FC 100%)'
            : ticket.status === TicketStatus.USED
            ? 'linear-gradient(135deg,#64748B,#94A3B8)'
            : 'linear-gradient(135deg,#EF4444,#F97316)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: 16, lineHeight: 1.3, mb: 0.5, pr: 6 }} noWrap>
          {ticket.eventTitle || 'Event'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
          {ticket.ticketTypeName}
        </Typography>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <TicketStatusChip status={ticket.status} />
        </Box>
      </Box>

      <TearLine />

      <Box sx={{ px: 2.5, pb: 2.5, pt: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
              <ConfirmationNumber sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: 12 }}>Ticket ID</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
              #{ticket.id}
            </Typography>
          </Box>

          {ticket.venueName && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
                <Place sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontSize: 12 }}>Venue</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, color: '#334155', maxWidth: 140, textAlign: 'right' }} noWrap>
                {ticket.venueName}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
              <CalendarToday sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontSize: 12 }}>Issued</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
              {new Date(ticket.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          {ticket.status === TicketStatus.ACTIVE && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<QrCode2 />}
              onClick={() => onViewQR(ticket)}
              sx={{
                borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                boxShadow: '0 4px 12px rgba(96,147,252,0.3)',
                '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
              }}
            >
              {t('customer.viewQRCode')}
            </Button>
          )}

          {ticket.status === TicketStatus.USED && ticket.usedAt && (
            <Box sx={{ px: 2, py: 1.25, bgcolor: '#F8FAFC', borderRadius: '10px', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: 12, color: '#64748B' }}>
                Used on {new Date(ticket.usedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { lastEvent } = useSSE();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const [tab, setTab] = useState(searchParams.get('tab') === '1' ? 1 : 0);

  useEffect(() => {
    setTab(searchParams.get('tab') === '1' ? 1 : 0);
  }, [searchParams]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketFilter, setTicketFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);

  const ITEMS_PER_PAGE = 9;

  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } =
    useGetMyOrdersQuery({
      page: orderPage - 1,
      size: ITEMS_PER_PAGE,
      status: orderFilter !== 'ALL' ? orderFilter : undefined,
    });
  const { data: ticketsData, isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } =
    useGetMyTicketsQuery(undefined, { pollingInterval: 5 * 60 * 1000 });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = ordersData?.data?.content ?? [];
  const orderTotalPages = ordersData?.data?.totalPages ?? 0;
  const orderTotalElements = ordersData?.data?.totalElements ?? 0;
  const tickets = ticketsData?.data ?? [];

  // Total across all statuses — fetched separately for the "All" chip count
  const { data: allOrdersCountData } = useGetMyOrdersQuery({ page: 0, size: 1 });
  const totalOrders = allOrdersCountData?.data?.totalElements ?? orderTotalElements;

  useEffect(() => {
    if (!lastEvent) return;
    switch (lastEvent.type) {
      case SSENormalizedType.ORDER_CONFIRMED:
      case SSENormalizedType.ORDER_CANCELLED:
      case SSENormalizedType.ORDER_EXPIRED:
        refetchOrders();
        break;
      case SSENormalizedType.TICKET_ISSUED:
      case SSENormalizedType.TICKET_CHECKED_IN:
        refetchTickets();
        break;
    }
  }, [lastEvent, refetchOrders, refetchTickets]);

  const handleCancelConfirm = async () => {
    if (cancelTargetId === null) return;
    try {
      await cancelOrder(cancelTargetId).unwrap();
      showSnackbar(t('messages.success.orderCancelled'), 'success');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      showSnackbar(
        t('messages.error.cancelFailed', { item: t('common.entities.order'), reason: e?.data?.message ?? '' }),
        'error',
      );
    } finally {
      setCancelTargetId(null);
    }
  };

  const isInitialLoading = (tab === 0 && ordersLoading && orders.length === 0)
    || (tab === 1 && ticketsLoading && tickets.length === 0);

  if (isInitialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#6093FC' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Page header with tabs */}
      <Box sx={{ background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -40, right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(243,107,249,0.1)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 4, md: 5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#F36BF9,#6093FC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                My Bookings
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                Manage your orders and tickets in one place
              </Typography>
            </Box>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#F36BF9', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'none', fontSize: 14, minHeight: 48, px: 2 },
              '& .Mui-selected': { color: '#fff !important' },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingBag sx={{ fontSize: 16 }} />
                  <span>{t('customer.myOrders')}</span>
                  <Box sx={{ px: 1, py: 0.2, borderRadius: '10px', bgcolor: tab === 0 ? 'rgba(243,107,249,0.3)' : 'rgba(255,255,255,0.12)', minWidth: 24, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>{totalOrders}</Typography>
                  </Box>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ fontSize: 16 }} />
                  <span>{t('customer.myTickets')}</span>
                  <Box sx={{ px: 1, py: 0.2, borderRadius: '10px', bgcolor: tab === 1 ? 'rgba(243,107,249,0.3)' : 'rgba(255,255,255,0.12)', minWidth: 24, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>{tickets.length}</Typography>
                  </Box>
                </Box>
              }
            />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>

        {/* ── Orders tab ─────────────────────────────────────── */}
        {tab === 0 && (() => {
          const ORDER_FILTERS: { key: OrderStatus | 'ALL'; label: string; color: string }[] = [
            { key: 'ALL',                    label: 'All',        color: '#F36BF9' },
            { key: OrderStatus.CONFIRMED,    label: 'Confirmed',  color: '#16A34A' },
            { key: OrderStatus.PENDING,      label: 'Pending',    color: '#F97316' },
            { key: OrderStatus.PROCESSING,   label: 'Processing', color: '#6093FC' },
            { key: OrderStatus.REFUNDED,     label: 'Refunded',   color: '#7C3AED' },
            { key: OrderStatus.CANCELLED,    label: 'Cancelled',  color: '#64748B' },
            { key: OrderStatus.EXPIRED,      label: 'Expired',    color: '#94A3B8' },
          ];

          const handleOrderFilterChange = (f: OrderStatus | 'ALL') => {
            setOrderFilter(f);
            setOrderPage(1);
          };

          const rangeStart = (orderPage - 1) * ITEMS_PER_PAGE + 1;
          const rangeEnd = Math.min(orderPage * ITEMS_PER_PAGE, orderTotalElements);

          if (ordersError) {
            return (
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 4, textAlign: 'center', border: '1px solid #FEE2E2' }}>
                <Typography color="error" fontWeight={600}>
                  {t('messages.error.loadFailed', { item: t('common.entities.order') })}
                </Typography>
              </Box>
            );
          }

          if (!ordersLoading && totalOrders === 0) {
            return (
              <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: { xs: 5, md: 8 }, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(243,107,249,0.12),rgba(229,90,224,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <ShoppingBag sx={{ fontSize: 36, color: '#F36BF9' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 1 }}>
                  {t('customer.noOrdersYet')}
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                  Browse events and book your first tickets to get started
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/dashboard/customer')}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                    background: 'linear-gradient(135deg,#F36BF9,#e55ae0)',
                    boxShadow: '0 4px 14px rgba(243,107,249,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg,#e055e8,#cc44cc)' },
                  }}
                >
                  {t('customer.browseEvents')}
                </Button>
              </Box>
            );
          }

          return (
            <>
              {/* Filter chips + range info */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ORDER_FILTERS.map(({ key, label, color }) => {
                    const active = orderFilter === key;
                    const chipCount = key === 'ALL' ? totalOrders : (active ? orderTotalElements : null);
                    return (
                      <Box
                        key={key}
                        onClick={() => handleOrderFilterChange(key)}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          px: '12px', py: '5px', borderRadius: '20px', cursor: 'pointer',
                          border: `1.5px solid ${active ? color : '#E2E8F0'}`,
                          bgcolor: active ? `${color}18` : '#fff',
                          transition: 'all 0.14s',
                          '&:hover': { borderColor: color },
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: active ? color : '#64748B' }}>
                          {label}
                        </Typography>
                        {chipCount !== null && (
                          <Box sx={{ minWidth: 18, height: 18, borderRadius: '20px', px: '4px', bgcolor: active ? color : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: active ? '#fff' : '#64748B' }}>{chipCount}</Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>
                  {ordersLoading ? 'Loading…' : orderTotalElements === 0 ? 'No orders' : `Showing ${rangeStart}–${rangeEnd} of ${orderTotalElements}`}
                </Typography>
              </Box>

              {ordersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={28} sx={{ color: '#F36BF9' }} />
                </Box>
              ) : orderTotalElements === 0 ? (
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 5, textAlign: 'center', border: '1px dashed #E2E8F0' }}>
                  <Typography sx={{ fontSize: 14, color: '#94A3B8' }}>No orders in this category.</Typography>
                </Box>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {orders.map((order) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={order.id}>
                        <OrderCard
                          order={order}
                          onCancel={setCancelTargetId}
                          isCancelling={isCancelling}
                          onViewTickets={() => setTab(1)}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {orderTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={orderTotalPages}
                        page={orderPage}
                        onChange={(_, p) => setOrderPage(p)}
                        size="small"
                        sx={{
                          '& .MuiPaginationItem-root.Mui-selected': {
                            background: 'linear-gradient(135deg,#F36BF9,#e55ae0)',
                            color: '#fff',
                            '&:hover': { background: 'linear-gradient(135deg,#e055e8,#cc44cc)' },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          );
        })()}

        {/* ── Tickets tab ────────────────────────────────────── */}
        {tab === 1 && (() => {
          const TICKET_FILTERS: { key: TicketStatus | 'ALL'; label: string; color?: string }[] = [
            { key: 'ALL',                      label: 'All' },
            { key: TicketStatus.ACTIVE,        label: 'Active',   color: '#059669' },
            { key: TicketStatus.USED,          label: 'Used',     color: '#475569' },
            { key: TicketStatus.TRANSFER_LOCKED, label: 'Locked', color: '#D97706' },
            { key: TicketStatus.CANCELLED,     label: 'Cancelled',color: '#DC2626' },
          ];

          const filteredTickets = ticketFilter === 'ALL'
            ? tickets
            : tickets.filter((t) => t.status === ticketFilter);

          const ticketTotalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
          const pagedTickets = filteredTickets.slice(
            (ticketPage - 1) * ITEMS_PER_PAGE,
            ticketPage * ITEMS_PER_PAGE,
          );

          const handleFilterChange = (f: TicketStatus | 'ALL') => {
            setTicketFilter(f);
            setTicketPage(1);
          };

          if (ticketsError) {
            return (
              <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 4, textAlign: 'center', border: '1px solid #FEE2E2' }}>
                <Typography color="error" fontWeight={600}>
                  {t('messages.error.loadFailed', { item: t('common.entities.ticket') })}
                </Typography>
              </Box>
            );
          }

          if (tickets.length === 0) {
            return (
              <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: { xs: 5, md: 8 }, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(243,107,249,0.12),rgba(96,147,252,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                  <ConfirmationNumber sx={{ fontSize: 36, background: 'linear-gradient(135deg,#F36BF9,#6093FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                </Box>
                <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 1 }}>
                  {t('customer.noTicketsYet')}
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                  Discover and book events to collect your first ticket
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push('/dashboard/customer')}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                    background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                    boxShadow: '0 4px 14px rgba(96,147,252,0.35)',
                    '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
                  }}
                >
                  {t('customer.browseEvents')}
                </Button>
              </Box>
            );
          }

          return (
            <>
              {/* Filter chips + count */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {TICKET_FILTERS.map(({ key, label, color }) => {
                    const active = ticketFilter === key;
                    const count = key === 'ALL' ? tickets.length : tickets.filter((t) => t.status === key).length;
                    const accent = color ?? '#6093FC';
                    return (
                      <Box
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          px: '12px', py: '5px', borderRadius: '20px', cursor: 'pointer',
                          border: `1.5px solid ${active ? accent : '#E2E8F0'}`,
                          bgcolor: active ? `${accent}18` : '#fff',
                          transition: 'all 0.14s',
                          '&:hover': { borderColor: accent },
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: active ? accent : '#64748B' }}>
                          {label}
                        </Typography>
                        <Box sx={{ minWidth: 18, height: 18, borderRadius: '20px', px: '4px', bgcolor: active ? accent : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: active ? '#fff' : '#64748B' }}>{count}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>
                  {filteredTickets.length === 0 ? 'No tickets' : `Showing ${(ticketPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(ticketPage * ITEMS_PER_PAGE, filteredTickets.length)} of ${filteredTickets.length}`}
                </Typography>
              </Box>

              {filteredTickets.length === 0 ? (
                <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 5, textAlign: 'center', border: '1px dashed #E2E8F0' }}>
                  <Typography sx={{ fontSize: 14, color: '#94A3B8' }}>No tickets in this category.</Typography>
                </Box>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {pagedTickets.map((ticket) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ticket.id}>
                        <TicketCard ticket={ticket} onViewQR={setSelectedTicket} />
                      </Grid>
                    ))}
                  </Grid>

                  {ticketTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination
                        count={ticketTotalPages}
                        page={ticketPage}
                        onChange={(_, p) => setTicketPage(p)}
                        size="small"
                        sx={{
                          '& .MuiPaginationItem-root.Mui-selected': {
                            background: 'linear-gradient(135deg,#F36BF9,#6093FC)',
                            color: '#fff',
                            '&:hover': { background: 'linear-gradient(135deg,#e055e8,#4a7ef0)' },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </>
          );
        })()}
      </Container>

      {/* QR Code modal */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        {selectedTicket && (
          <>
            <Box sx={{ p: 3, background: 'linear-gradient(135deg,#F36BF9,#6093FC)', position: 'relative' }}>
              <IconButton
                onClick={() => setSelectedTicket(null)}
                size="small"
                sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
              >
                <Close fontSize="small" />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', pr: 4, lineHeight: 1.3 }}>
                {selectedTicket.eventTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
                {selectedTicket.ticketTypeName}
              </Typography>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, bgcolor: '#F8FAFC', borderRadius: '16px', mb: 3, border: '1px solid #E2E8F0' }}>
                <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <QRCodeSVG
                    value={(ticketsData?.data?.find(t => t.id === selectedTicket.id) ?? selectedTicket).qrPayload}
                    size={200}
                    level="M"
                  />
                </Box>
                <Typography variant="caption" sx={{ mt: 1.5, color: '#64748B' }}>
                  Xuất trình mã QR này tại cửa vào
                </Typography>
              </Box>

              <Divider sx={{ mb: 2, borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Ticket ID', value: `#${selectedTicket.id}` },
                  { label: 'Type', value: selectedTicket.ticketTypeName },
                  ...(selectedTicket.venueName ? [{ label: 'Venue', value: selectedTicket.venueName }] : []),
                  {
                    label: 'Issued',
                    value: new Date(selectedTicket.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="#64748B" fontSize={12}>{label}</Typography>
                    <Typography variant="caption" fontWeight={700} color="#0F172A" fontSize={13}>{value}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(96,147,252,0.07)', borderRadius: '12px', border: '1px solid rgba(96,147,252,0.15)', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                  {t('customer.presentQRCode')}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Footer />

      <ConfirmationDialog
        open={cancelTargetId !== null}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleCancelConfirm}
        title={t('customer.cancelOrderTitle')}
        message={t('customer.confirmCancelOrder')}
        variant="error"
        loading={isCancelling}
        confirmText={t('common.buttons.confirm')}
        cancelText={t('common.buttons.cancel')}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
}
