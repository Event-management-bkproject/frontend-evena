'use client';

import { useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Event as EventIcon,
  ShoppingCart as OrdersIcon,
  AssignmentReturn as RefundIcon,
  ConfirmationNumber as TicketsIcon,
  Category as ContentIcon,
  CheckCircle as VerifiedIcon,
  PendingActions as PendingIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetOrganizationsQuery } from '@/src/stores/services/OrganizerApi';
import { useGetMyEventsQuery } from '@/src/stores/services/EventApi';
import { useGetOrganizerOrdersQuery } from '@/src/stores/services/OrderApi';
import { useGetOrganizerRefundRequestsQuery } from '@/src/stores/services/RefundRequestApi';
import { useGetCategoriesQuery } from '@/src/stores/services/CategoryApi';
import { useGetVenuesQuery } from '@/src/stores/services/VenueApi';
import { useGetActivityLogsQuery } from '@/src/stores/services/ActivityLogApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import { LAYOUT } from '@/src/utils/constants/layout';
import { OrderStatus } from '@/src/stores/types/order';
import { RefundRequestStatus } from '@/src/stores/types/refundRequest';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  loading?: boolean;
}

function KpiCard({ label, value, sub, icon, gradient, loading }: KpiCardProps) {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '12px',
        border: `1px solid ${ADMIN.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
          fontSize: 20,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: ADMIN.textSecondary, fontSize: 12, fontWeight: 500 }}>
          {label}
        </Typography>
        {loading ? (
          <CircularProgress size={18} sx={{ color: ADMIN.primary, display: 'block', mt: 0.5 }} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN.heading, lineHeight: 1.2, mt: 0.25 }}>
            {value}
          </Typography>
        )}
        {sub && (
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontSize: 11 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

function getActionColor(action: string): string {
  if (/CREATE|ISSUED|SUCCESS|COMPLET|VERIF|APPROV|PUBLISH/.test(action)) return ADMIN.success;
  if (/DELET|CANCEL|FAIL|REJECT/.test(action)) return ADMIN.error;
  if (/UPDATE|PENDING|INITIAT|OPEN/.test(action)) return ADMIN.primary;
  if (/REFUND|REQUEST/.test(action)) return ADMIN.warning;
  return ADMIN.textMuted;
}

export default function AdminOverviewPage() {
  const { data: orgsData, isLoading: orgsLoading } = useGetOrganizationsQuery({ page: 0, size: 200 });
  const { data: eventsData, isLoading: eventsLoading } = useGetMyEventsQuery({ page: 0, size: 200 });
  const { data: ordersData, isLoading: ordersLoading } = useGetOrganizerOrdersQuery({ page: 0, size: 200 });
  const { data: refundsData, isLoading: refundsLoading } = useGetOrganizerRefundRequestsQuery({ page: 0, size: 200 });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: venuesData } = useGetVenuesQuery({ page: 0, size: 100 });
  const { data: logsData, isLoading: logsLoading } = useGetActivityLogsQuery({ page: 0, size: 12 });

  const totalOrgs = orgsData?.data?.totalElements ?? 0;
  const pendingOrgs = useMemo(() => (orgsData?.data?.content ?? []).filter((o) => !o.verified).length, [orgsData]);
  const totalEvents = eventsData?.data?.totalElements ?? 0;
  const totalOrders = ordersData?.data?.totalElements ?? 0;
  const confirmedOrders = useMemo(() => (ordersData?.data?.content ?? []).filter((o) => o.status === OrderStatus.CONFIRMED).length, [ordersData]);
  const totalRevenue = useMemo(() => (ordersData?.data?.content ?? []).filter((o) => o.status === OrderStatus.CONFIRMED).reduce((s, o) => s + o.totalAmount, 0), [ordersData]);
  const pendingRefunds = useMemo(() => (refundsData?.data?.content ?? []).filter((r) => r.status === RefundRequestStatus.PENDING).length, [refundsData]);
  const totalRefunds = refundsData?.data?.totalElements ?? 0;

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const recentLogs = logsData?.content ?? [];

  const kpiRow1 = [
    { label: 'Organizations', value: totalOrgs, sub: pendingOrgs > 0 ? `${pendingOrgs} pending` : 'All verified', icon: <BusinessIcon fontSize="small" />, gradient: `linear-gradient(135deg, #3B82F6, #1D4ED8)`, loading: orgsLoading },
    { label: 'Events', value: totalEvents, sub: 'all statuses', icon: <EventIcon fontSize="small" />, gradient: `linear-gradient(135deg, #8B5CF6, #6D28D9)`, loading: eventsLoading },
    { label: 'Confirmed Orders', value: confirmedOrders, sub: fmt(totalRevenue), icon: <OrdersIcon fontSize="small" />, gradient: `linear-gradient(135deg, #10B981, #059669)`, loading: ordersLoading },
    { label: 'Pending Refunds', value: pendingRefunds, sub: `${totalRefunds} total requests`, icon: <RefundIcon fontSize="small" />, gradient: `linear-gradient(135deg, #F59E0B, #D97706)`, loading: refundsLoading },
  ];

  const kpiRow2 = [
    { label: 'Categories', value: categoriesData?.data?.length ?? 0, sub: '', icon: <ContentIcon fontSize="small" />, gradient: `linear-gradient(135deg, #EC4899, #BE185D)`, loading: false },
    { label: 'Venues', value: venuesData?.data?.totalElements ?? 0, sub: '', icon: <TicketsIcon fontSize="small" />, gradient: `linear-gradient(135deg, #14B8A6, #0D9488)`, loading: false },
    { label: 'Total Orders', value: totalOrders, sub: 'all statuses', icon: <TrendingIcon fontSize="small" />, gradient: `linear-gradient(135deg, #0EA5E9, #0284C7)`, loading: ordersLoading },
    { label: 'Verified Orgs', value: totalOrgs - pendingOrgs, sub: `of ${totalOrgs} total`, icon: <VerifiedIcon fontSize="small" />, gradient: `linear-gradient(135deg, #22C55E, #16A34A)`, loading: orgsLoading },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Overview"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Overview' }]}
        >
          {/* KPI rows */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
            {kpiRow1.map((k) => <KpiCard key={k.label} {...k} />)}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            {kpiRow2.map((k) => <KpiCard key={k.label} {...k} />)}
          </Box>

          {/* Bottom row: alerts + activity */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: 3 }}>
            {/* Action required */}
            <Card sx={{ borderRadius: '12px', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PendingIcon sx={{ color: ADMIN.warning, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 15 }}>Action Required</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {pendingOrgs > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: '8px', bgcolor: ADMIN.warningBg, border: `1px solid ${ADMIN.warning}30` }}>
                    <BusinessIcon sx={{ color: ADMIN.warning, fontSize: 18, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: ADMIN.body }}>
                      <strong style={{ color: ADMIN.warning }}>{pendingOrgs}</strong> org{pendingOrgs > 1 ? 's' : ''} awaiting verification
                    </Typography>
                  </Box>
                )}
                {pendingRefunds > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, borderRadius: '8px', bgcolor: ADMIN.errorBg, border: `1px solid ${ADMIN.error}30` }}>
                    <RefundIcon sx={{ color: ADMIN.error, fontSize: 18, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: ADMIN.body }}>
                      <strong style={{ color: ADMIN.error }}>{pendingRefunds}</strong> refund{pendingRefunds > 1 ? 's' : ''} pending review
                    </Typography>
                  </Box>
                )}
                {pendingOrgs === 0 && pendingRefunds === 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <VerifiedIcon sx={{ fontSize: 36, color: ADMIN.success, mb: 0.5 }} />
                    <Typography variant="body2" sx={{ color: ADMIN.textSecondary }}>All clear — no pending actions</Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2, borderColor: ADMIN.border }} />

              <Typography sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 13, mb: 1.5 }}>Platform Health</Typography>
              {[
                { label: 'Verification Rate', value: totalOrgs ? `${Math.round(((totalOrgs - pendingOrgs) / totalOrgs) * 100)}%` : '—', color: ADMIN.success },
                { label: 'Order Confirmation Rate', value: totalOrders ? `${Math.round((confirmedOrders / totalOrders) * 100)}%` : '—', color: ADMIN.primary },
                { label: 'Refund Resolution Rate', value: totalRefunds ? `${Math.round(((totalRefunds - pendingRefunds) / totalRefunds) * 100)}%` : '—', color: ADMIN.info },
              ].map((s) => (
                <Box key={s.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 12 }}>{s.label}</Typography>
                  <Chip label={s.value} size="small" sx={{ bgcolor: s.color + '18', color: s.color, fontWeight: 700, fontSize: 11, height: 20 }} />
                </Box>
              ))}
            </Card>

            {/* Activity feed */}
            <Card sx={{ borderRadius: '12px', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingIcon sx={{ color: ADMIN.primary, fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 15 }}>Recent Activity</Typography>
              </Box>

              {logsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ color: ADMIN.primary }} />
                </Box>
              ) : recentLogs.length === 0 ? (
                <Typography variant="body2" sx={{ color: ADMIN.textMuted, textAlign: 'center', py: 4 }}>No activity yet</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 360, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: ADMIN.borderLight } }}>
                  {recentLogs.map((log, idx) => {
                    const c = getActionColor(log.action);
                    return (
                      <Box key={log.id}>
                        <Box sx={{ display: 'flex', gap: 1.5, py: 1.25 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: c + '18', color: c, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {log.actorRole?.[0] ?? '?'}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: ADMIN.body, fontSize: 13, lineHeight: 1.3 }} noWrap>
                              {log.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip label={log.action} size="small" sx={{ height: 16, fontSize: 10, bgcolor: c + '15', color: c, fontWeight: 600 }} />
                              <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                                {dayjs(log.createdAt).fromNow()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        {idx < recentLogs.length - 1 && <Divider sx={{ borderColor: ADMIN.border }} />}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Card>
          </Box>
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
