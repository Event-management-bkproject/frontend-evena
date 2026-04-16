'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoneyOff as RefundIcon,
  FiberManualRecord as LiveDotIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { BRAND, ORDER_STATUS_CONFIG, ORDER_STATUSES, TABLE_PER_PAGE } from '@/src/utils/constants/constant';
import type { OrderStatusFilter } from '@/src/utils/constants/constant';
import { formatCurrency, formatTableDate } from '@/src/utils/format';
import { OrderResponse, OrderStatus, PaymentStatus } from '@/src/stores/types/order';
import { SSENormalizedType } from '@/src/stores/types/sse';
import { useSSE } from '@/src/providers/SSEProvider';
import { RefundDialog } from '@/src/components/RefundDialog/RefundDialog';

// ─── Types ──────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'createdAt' | 'totalAmount' | 'status' | null;
type SortDir = 'asc' | 'desc';

const ORDER_SSE_EVENTS = new Set([
  SSENormalizedType.ORDER_CREATED,
  SSENormalizedType.ORDER_CONFIRMED,
  SSENormalizedType.ORDER_CANCELLED,
  SSENormalizedType.ORDER_EXPIRED,
  SSENormalizedType.ORDER_REFUNDED,
]);

// ─── Component ───────────────────────────────────────────────────────────────

interface OrganizerOrdersTableProps {
  orders: OrderResponse[];
  isLoading: boolean;
  isError: boolean;
}

export function OrganizerOrdersTable({ orders, isLoading, isError }: OrganizerOrdersTableProps) {
  const { t } = useTranslation();
  const { lastEvent, isConnected } = useSSE();

  // Table state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  // Refund dialog
  const [refundOrder, setRefundOrder] = useState<OrderResponse | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // SSE feedback
  const [orgToast, setOrgToast] = useState<{ message: string; severity: 'success' | 'info' | 'warning' } | null>(null);
  const [flashTable, setFlashTable] = useState(false);

  // ── SSE: react to organizer-targeted order events ──────────────────────────
  useEffect(() => {
    if (!lastEvent || !ORDER_SSE_EVENTS.has(lastEvent.type)) return;

    // Only react to events explicitly tagged for the organizer,
    // or to any ORDER event if not tagged (e.g. if organizer is also customer)
    const isOrganizerEvent = !!lastEvent.data?.organizerNotification;
    if (!isOrganizerEvent) return;

    // Flash the table header to signal data refresh
    setFlashTable(true);
    const t1 = setTimeout(() => setFlashTable(false), 700);

    // Show an appropriate organizer-specific toast
    const eventName = lastEvent.data?.eventName as string | undefined;
    const ticketCount = lastEvent.data?.ticketCount as number | undefined;

    let message: string | null = null;
    let severity: 'success' | 'info' | 'warning' = 'info';

    switch (lastEvent.type) {
      case SSENormalizedType.ORDER_CREATED:
        message = eventName
          ? `New order received for "${eventName}"`
          : 'New order received';
        severity = 'success';
        break;
      case SSENormalizedType.ORDER_CONFIRMED:
        message = eventName && ticketCount != null
          ? `${ticketCount} ticket(s) confirmed for "${eventName}"`
          : eventName
            ? `Order confirmed for "${eventName}"`
            : 'Order confirmed';
        severity = 'success';
        break;
      case SSENormalizedType.ORDER_REFUNDED:
        message = eventName ? `Refund processed for "${eventName}"` : 'Refund processed';
        severity = 'info';
        break;
      case SSENormalizedType.ORDER_CANCELLED:
        message = eventName ? `Order cancelled for "${eventName}"` : 'Order cancelled';
        severity = 'warning';
        break;
      case SSENormalizedType.ORDER_EXPIRED:
        message = eventName ? `Order expired for "${eventName}"` : 'Order expired';
        severity = 'warning';
        break;
    }

    if (message) setOrgToast({ message, severity });

    return () => { clearTimeout(t1); };
  }, [lastEvent]);

  // ── Filter + sort + paginate ───────────────────────────────────────────────

  const processed = useMemo(() => {
    let rows = [...orders];

    if (statusFilter !== 'ALL') {
      rows = rows.filter((o) => o.status === statusFilter);
    }

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
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / TABLE_PER_PAGE));
  const paged = processed.slice(page * TABLE_PER_PAGE, (page + 1) * TABLE_PER_PAGE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }
  function handleSearch(v: string) { setSearch(v); setPage(0); }
  function handleStatus(s: OrderStatusFilter) { setStatusFilter(s); setPage(0); }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: '350px',
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
            // Brief green flash when SSE data arrives
            transition: 'background-color 0.4s',
            bgcolor: flashTable ? 'rgba(76, 175, 80, 0.06)' : 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'black' }}>
              {t('organizer.ordersList')}
            </Typography>
            {/* Live connection indicator */}
            <Tooltip title={isConnected ? 'Live — updates automatically' : 'Connecting...'}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <LiveDotIcon
                  sx={{
                    fontSize: 10,
                    color: isConnected ? '#4CAF50' : '#ADACAE',
                    animation: isConnected ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                    },
                  }}
                />
                <Typography sx={{ fontSize: 10, color: isConnected ? '#4CAF50' : '#ADACAE', fontWeight: 500 }}>
                  {isConnected ? 'Live' : 'Connecting'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {/* Search */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              bgcolor: 'white', border: '1px solid #EEF0FF',
              borderRadius: '25px', px: '12px', py: '7px',
            }}>
              <SearchIcon sx={{ color: '#ADACAE', fontSize: 14, flexShrink: 0 }} />
              <InputBase
                placeholder={t('organizer.searchOrders')}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ fontSize: 12, color: '#36437C', width: 140, '& input::placeholder': { color: '#ADACAE' } }}
              />
            </Box>

            {/* Status filter */}
            <Box sx={{
              display: 'flex', gap: '4px', bgcolor: 'white',
              border: '1px solid #EEF0FF', borderRadius: '25px', p: '4px',
            }}>
              {ORDER_STATUSES.map((s) => (
                <Box
                  key={s}
                  component="button"
                  onClick={() => handleStatus(s)}
                  sx={{
                    px: '10px', py: '4px', borderRadius: '20px', fontSize: 11,
                    border: 'none', cursor: 'pointer',
                    fontWeight: statusFilter === s ? 700 : 500,
                    bgcolor: statusFilter === s ? BRAND.primary : 'transparent',
                    color: statusFilter === s ? 'white' : BRAND.darkSecondary,
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: statusFilter === s ? BRAND.primary : '#EEF0FF' },
                  }}
                >
                  {s === 'ALL' ? 'All' : ORDER_STATUS_CONFIG[s]?.label ?? s}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Table body */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress size={32} sx={{ color: BRAND.primary }} />
            </Box>
          ) : isError ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {t('messages.error.loadFailed', { item: t('common.navigation.orders') })}
            </Alert>
          ) : (
            <Table sx={{ minWidth: 800, borderCollapse: 'collapse' }}>
              <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'white' }}>
                <TableRow sx={{ borderBottom: '1px solid #F7F7F7' }}>
                  {([
                    { label: t('common.labels.orderId'),    key: 'id' as SortKey,          pl: '15px', width: '110px' },
                    { label: t('common.labels.date'),        key: 'createdAt' as SortKey,               width: '150px' },
                    { label: t('common.labels.name'),        key: null,                                  width: '150px' },
                    { label: t('common.labels.event'),       key: null,                                  width: '150px' },
                    { label: t('common.labels.ticketType'), key: null,                                  width: '150px' },
                    { label: t('common.labels.price'),       key: null,                                  width: '90px', align: 'center' as const },
                    { label: t('common.labels.quantity'),    key: null,                                  width: '90px', align: 'center' as const },
                    { label: t('common.labels.amount'),      key: 'totalAmount' as SortKey,             width: '90px', align: 'center' as const },
                    { label: t('common.labels.status'),      key: 'status' as SortKey,     pr: '15px', width: '110px' },
                    { label: 'Actions',                      key: null,                     pr: '15px', width: '80px', align: 'center' as const },
                  ]).map(({ label, key, pl, pr, width, align }) => (
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
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: '30px', color: '#ADACAE', fontSize: 12, borderBottom: 'none' }}>
                      {t('organizer.noOrdersFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((order, i) => {
                    const sc = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.PENDING;
                    const { date, time } = formatTableDate(order.createdAt);
                    const item = order.items?.[0];
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
                        <TableCell sx={{ py: '10px', px: '8px', pl: '20px', border: 'none', width: '110px' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#36437C' }}>#{order.id}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{date}</Typography>
                            <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>{time}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                          <Tooltip title={order.userEmail ?? ''} placement="top">
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black', maxWidth: 138, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.userEmail ?? '—'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black', maxWidth: 138, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.eventSnapshot?.title ?? '—'}
                            </Typography>
                            {order.eventSnapshot?.categoryName && (
                              <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>{order.eventSnapshot.categoryName}</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '150px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D9D9D9', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#36437C', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item?.ticketTypeName ?? '—'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{formatCurrency(item?.unitPrice ?? 0)}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'black' }}>{item?.quantity ?? 0}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '90px' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'black' }}>{formatCurrency(order.totalAmount ?? 0)}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '110px' }}>
                          <Box sx={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            px: '8px', py: '5px', borderRadius: '10px',
                            bgcolor: sc.bg, color: sc.color, fontSize: 12, fontWeight: 500, minWidth: 60,
                          }}>
                            {sc.label}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: '10px', px: '8px', border: 'none', width: '80px', textAlign: 'center' }}>
                          {order.status === OrderStatus.CONFIRMED &&
                            order.payments?.some((p) => p.status === PaymentStatus.SUCCESS) && (
                            <Tooltip title="Process Refund">
                              <IconButton
                                size="small"
                                onClick={() => setRefundOrder(order)}
                                sx={{ color: '#F36BF9', '&:hover': { bgcolor: 'rgba(243,107,249,0.08)' } }}
                              >
                                <RefundIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Box>

        {/* Pagination */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '15px', py: '10px', borderTop: '1px solid #F7F7F7' }}>
          <Typography sx={{ fontSize: 11, color: '#ADACAE' }}>
            {t('organizer.showingOrders', {
              from: processed.length === 0 ? 0 : page * TABLE_PER_PAGE + 1,
              to: Math.min((page + 1) * TABLE_PER_PAGE, processed.length),
              total: processed.length,
            })}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Box
              component="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              sx={{ px: '10px', py: '5px', borderRadius: '8px', border: 'none', cursor: page === 0 ? 'not-allowed' : 'pointer', bgcolor: 'transparent', fontSize: 11, fontWeight: 500, color: BRAND.darkSecondary, opacity: page === 0 ? 0.4 : 1, '&:hover': { bgcolor: page === 0 ? 'transparent' : '#EEF0FF' } }}
            >
              {t('common.buttons.previous')}
            </Box>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Box
                key={p}
                component="button"
                onClick={() => setPage(p)}
                sx={{ width: 28, height: 28, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, bgcolor: page === p ? BRAND.dark : 'transparent', color: page === p ? 'white' : BRAND.dark, transition: 'all 0.15s', '&:hover': { bgcolor: page === p ? BRAND.dark : '#EEF0FF' } }}
              >
                {p + 1}
              </Box>
            ))}
            <Box
              component="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              sx={{ px: '10px', py: '5px', borderRadius: '8px', border: 'none', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', bgcolor: 'transparent', fontSize: 11, fontWeight: 500, color: BRAND.darkSecondary, opacity: page >= totalPages - 1 ? 0.4 : 1, '&:hover': { bgcolor: page >= totalPages - 1 ? 'transparent' : '#EEF0FF' } }}
            >
              {t('common.buttons.next')}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Refund Dialog */}
      {refundOrder && (() => {
        const successPayment = refundOrder.payments?.find((p) => p.status === PaymentStatus.SUCCESS);
        if (!successPayment) return null;
        return (
          <RefundDialog
            open={!!refundOrder}
            onClose={() => setRefundOrder(null)}
            paymentId={successPayment.paymentId}
            orderId={refundOrder.id}
            orderAmount={refundOrder.totalAmount}
            eventTitle={refundOrder.eventSnapshot?.title ?? '—'}
            onSuccess={() => {
              setSuccessMsg(`Refund for order #${refundOrder.id} processed successfully.`);
              setRefundOrder(null);
            }}
          />
        );
      })()}

      {/* Refund success snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={5000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMsg(null)} severity="success" variant="filled">
          {successMsg}
        </Alert>
      </Snackbar>

      {/* Organizer SSE order event toast */}
      <Snackbar
        open={!!orgToast}
        autoHideDuration={5000}
        onClose={() => setOrgToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOrgToast(null)}
          severity={orgToast?.severity ?? 'info'}
          variant="filled"
          sx={{ minWidth: 280 }}
        >
          {orgToast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
