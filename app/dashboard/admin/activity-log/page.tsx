'use client';

import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Chip, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, CircularProgress, MenuItem, Select, FormControl, InputLabel,
  Avatar, Pagination, Divider, TextField, Drawer, IconButton, Stack, Collapse,
  Tooltip, ListSubheader, Alert, Button,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as AccountTreeIcon,
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Bolt as BoltIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip as ReTooltip,
  Cell, LineChart, Line,
} from 'recharts';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import {
  useGetActivityLogsQuery,
  useGetEntityTimelineQuery,
  useGetActivityLogStatsQuery,
  useGetActivityLogHourlyQuery,
  ActivityLogEntry,
  ActivityLogFilter,
  ActivityLogStats,
  HourlyCount,
} from '@/src/stores/services/ActivityLogApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_GROUPS: Record<string, string[]> = {
  Event: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_DELETED'],
  Order: ['ORDER_CREATED', 'ORDER_CANCELLED', 'ORDER_SUCCESSFULL'],
  Ticket: ['TICKET_ISSUED', 'TICKET_USED', 'TICKET_CANCELLED'],
  Payment: ['PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED'],
  Organization: [
    'ORGANIZATION_ADDED', 'ORGANIZATION_UPDATED', 'ORGANIZATION_VERIFIED',
    'ORGANIZATION_APPROVED', 'ORGANIZATION_REJECTED', 'ORGANIZATION_DELETED', 'MEMBER_UPDATED',
  ],
  Refund: ['REFUND_REQUESTED', 'REFUND_APPROVED', 'REFUND_REJECTED', 'REFUND_COMPLETED', 'REFUND_FAILED'],
  FlexPass: [
    'FLEXPASS_LISTING_CREATED', 'FLEXPASS_LISTING_APPROVED', 'FLEXPASS_LISTING_REJECTED',
    'FLEXPASS_LISTING_CANCELLED', 'FLEXPASS_LISTING_EXPIRED', 'FLEXPASS_PRICE_LOCKED',
    'FLEXPASS_PAYMENT_PENDING', 'FLEXPASS_TRANSFER_COMPLETED', 'FLEXPASS_TRANSFER_FAILED',
    'FLEXPASS_REFUND_COMPENSATION_PENDING', 'FLEXPASS_REFUND_COMPENSATION_COMPLETED',
    'FLEXPASS_REFUND_COMPENSATION_FAILED', 'FLEXPASS_SALE_WINDOW_CREATED',
    'FLEXPASS_SALE_WINDOW_CANCELLED', 'FLEXPASS_SALE_WINDOW_OPENED', 'FLEXPASS_SALE_WINDOW_CLOSED',
  ],
};

const ENTITY_TYPES = [
  'EVENT', 'TICKET_TYPE', 'ORDER', 'TICKET', 'PAYMENT',
  'ORGANIZATION', 'REFUND_REQUEST', 'FLEXPASS_LISTING', 'FLEXPASS_PURCHASE', 'FLEXPASS_SALE_WINDOW',
];

// Saved filter presets
const SAVED_FILTERS: Array<{ label: string; filter: Partial<ActivityLogFilter> }> = [
  { label: 'All activity', filter: {} },
  { label: 'Critical only', filter: { action: 'EVENT_DELETED' } },
  { label: 'Failed payments', filter: { action: 'PAYMENT_FAILED' } },
  { label: 'Refunds this week', filter: { action: 'REFUND_REQUESTED', from: dayjs().startOf('week').toISOString() } },
  { label: 'Org events', filter: { entityType: 'ORGANIZATION' } },
];

// ─── Color helpers ─────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'success' | 'info';

function getSeverity(action: string): Severity {
  if (/DELET|CANCEL|FAIL|REJECT/.test(action)) return 'critical';
  if (/REFUND|PENDING|INITIAT/.test(action)) return 'warning';
  if (/CREATE|ISSUED|SUCCESS|COMPLET|VERIF|APPROV|PUBLISH/.test(action)) return 'success';
  return 'info';
}

function getActionColor(action: string): string {
  const s = getSeverity(action);
  if (s === 'critical') return ADMIN.error;
  if (s === 'warning')  return ADMIN.warning;
  if (s === 'success')  return ADMIN.success;
  return ADMIN.primary;
}

function getActorColor(role?: string): string {
  if (!role) return ADMIN.textMuted;
  if (role === 'ADMIN')     return '#10B981';
  if (role === 'ORGANIZER') return '#3B82F6';
  return '#06B6D4';
}

function actorInitials(name?: string, role?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  return role?.[0] ?? '?';
}

// ─── JsonDiff ─────────────────────────────────────────────────────────────────

function JsonDiff({ label, value }: { label: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  if (!value) return <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>—</Typography>;
  return (
    <Box>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: ADMIN.primary }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
        {open ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
      </Box>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            mt: 0.5, p: 1, bgcolor: ADMIN.pageBg, borderRadius: 1,
            fontSize: 11, fontFamily: 'monospace', overflow: 'auto',
            maxHeight: 300, border: `1px solid ${ADMIN.border}`,
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}
        >
          {JSON.stringify(value, null, 2)}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── LogDetailDrawer ──────────────────────────────────────────────────────────

function LogDetailDrawer({ log, onClose }: { log: ActivityLogEntry | null; onClose: () => void }) {
  if (!log) return null;
  const c = getActionColor(log.action);
  const actorColor = getActorColor(log.actorRole);

  return (
    <Drawer anchor="right" open={!!log} onClose={onClose} slotProps={{ paper: { sx: { width: 480, p: 3 } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 16 }}>
          Log Entry #{log.id}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Action</Typography>
          <Chip label={log.action} size="small" sx={{ bgcolor: c + '15', color: c, fontWeight: 700 }} />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Entity</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={log.entityType} size="small" sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.body }}>
              {log.entityId}
            </Typography>
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Actor</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 28, height: 28, bgcolor: actorColor + '20', color: actorColor, fontSize: 11, fontWeight: 700 }}>
              {actorInitials(log.actorName, log.actorRole)}
            </Avatar>
            <Box>
              {log.actorName && (
                <Typography variant="body2" sx={{ fontSize: 13, color: ADMIN.body, fontWeight: 600 }}>
                  {log.actorName}
                </Typography>
              )}
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.textMuted }}>
                {log.actorId?.substring(0, 12)}…
              </Typography>
            </Box>
            <Chip label={log.actorRole} size="small" sx={{ fontSize: 10, height: 18 }} />
          </Stack>
        </Box>

        {log.eventId && (
          <Box>
            <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Event ID</Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.body }}>{log.eventId}</Typography>
          </Box>
        )}

        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Time</Typography>
          <Typography variant="body2" sx={{ fontSize: 13, color: ADMIN.body }}>
            {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')} ({dayjs(log.createdAt).fromNow()})
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 0.5 }}>Description</Typography>
          <Typography variant="body2" sx={{ fontSize: 13, color: ADMIN.body }}>{log.description || '—'}</Typography>
        </Box>

        <Divider sx={{ borderColor: ADMIN.border }} />

        <Box>
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontWeight: 600, display: 'block', mb: 1 }}>
            State Changes
          </Typography>
          <JsonDiff label="Before (oldValue)" value={log.oldValue} />
          <Box sx={{ mt: 1 }}>
            <JsonDiff label="After (newValue)" value={log.newValue} />
          </Box>
        </Box>
      </Stack>
    </Drawer>
  );
}

// ─── EntityTimelineDrawer ─────────────────────────────────────────────────────

function EntityTimelineDrawer({
  target, onClose, onSelectLog,
}: {
  target: { entityType: string; entityId: string } | null;
  onClose: () => void;
  onSelectLog: (log: ActivityLogEntry) => void;
}) {
  const { data, isLoading } = useGetEntityTimelineQuery(
    target ? { entityType: target.entityType, entityId: target.entityId, size: 100 } : { entityType: '', entityId: '' },
    { skip: !target },
  );

  const entries: ActivityLogEntry[] = data?.content ?? [];

  return (
    <Drawer anchor="right" open={!!target} onClose={onClose} slotProps={{ paper: { sx: { width: 520, p: 0 } } }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${ADMIN.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 16 }}>Entity Timeline</Typography>
          {target && (
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Chip label={target.entityType} size="small" sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary, fontSize: 10 }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.textMuted }}>{target.entityId}</Typography>
            </Stack>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <Box sx={{ px: 3, py: 2.5, overflowY: 'auto', height: 'calc(100% - 82px)' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} sx={{ color: ADMIN.primary }} />
          </Box>
        ) : entries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <TimelineIcon sx={{ fontSize: 40, color: ADMIN.border, mb: 1 }} />
            <Typography sx={{ color: ADMIN.textSecondary, fontSize: 13 }}>No timeline entries found</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mb: 2.5 }}>
              {entries.length} event{entries.length !== 1 ? 's' : ''} in lifecycle
            </Typography>
            {entries.map((entry, idx) => {
              const c = getActionColor(entry.action);
              const isLast = idx === entries.length - 1;
              const hasChanges = entry.oldValue != null || entry.newValue != null;
              return (
                <Box key={entry.id} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '3px' }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: '50%', flexShrink: 0, bgcolor: c, boxShadow: `0 0 0 3px ${c}22` }} />
                    {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: ADMIN.border, minHeight: 28, mt: '3px' }} />}
                  </Box>
                  <Box sx={{ flex: 1, pb: isLast ? 0 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={entry.action} size="small" sx={{ bgcolor: c + '15', color: c, fontWeight: 600, fontSize: 10 }} />
                      <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                        {dayjs(entry.createdAt).format('DD/MM/YY HH:mm:ss')} · {dayjs(entry.createdAt).fromNow()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body, mb: 0.75 }}>{entry.description}</Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar sx={{ width: 18, height: 18, bgcolor: getActorColor(entry.actorRole) + '20', color: getActorColor(entry.actorRole), fontSize: 9, fontWeight: 700 }}>
                        {actorInitials(entry.actorName, entry.actorRole)}
                      </Avatar>
                      <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                        {entry.actorName ?? entry.actorId?.substring(0, 8) + '…'}
                      </Typography>
                      <Chip label={entry.actorRole} size="small" sx={{ fontSize: 9, height: 16, '& .MuiChip-label': { px: 0.75 } }} />
                    </Stack>
                    {hasChanges && (
                      <Box onClick={() => { onClose(); onSelectLog(entry); }} sx={{ mt: 0.75, display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: ADMIN.primary }}>
                        <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>View diff →</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── SummaryCards ─────────────────────────────────────────────────────────────

function SummaryCards({
  hourlyData,
  stats,
}: {
  hourlyData: Array<{ hourLabel: string; count: number; isSpike: boolean }>;
  stats?: ActivityLogStats;
}) {
  const { data: fetchedStats } = useGetActivityLogStatsQuery(undefined, { skip: !!stats });
  const stats_ = stats ?? fetchedStats;

  const hourlyCounts = hourlyData.map((h) => h.count);
  const criticalCounts = hourlyData.map((h) => (h.isSpike ? h.count : 0));

  const todayChange = stats_
    ? stats_.yesterdayCount > 0
      ? Math.round(((stats_.activitiesToday - stats_.yesterdayCount) / stats_.yesterdayCount) * 100)
      : null
    : null;

  const criticalChange = stats_
    ? stats_.criticalYesterday > 0
      ? Math.round(((stats_.criticalToday - stats_.criticalYesterday) / stats_.criticalYesterday) * 100)
      : null
    : null;

  const topPct = stats_ && stats_.activitiesToday > 0
    ? Math.round((stats_.topActionCount / stats_.activitiesToday) * 100)
    : 0;

  const cards = [
    {
      label: 'Activities today',
      value: stats_?.activitiesToday ?? '—',
      change: todayChange,
      icon: <TodayIcon sx={{ fontSize: 16 }} />,
      color: ADMIN.primary,
      sparkData: hourlyCounts,
      sub: stats_?.yesterdayCount != null ? `${stats_.yesterdayCount} yesterday` : undefined,
    },
    {
      label: 'Critical events',
      value: stats_?.criticalToday ?? '—',
      change: criticalChange,
      icon: <WarningIcon sx={{ fontSize: 16 }} />,
      color: ADMIN.error,
      sparkData: criticalCounts,
      sub: stats_?.criticalYesterday != null ? `${stats_.criticalYesterday} yesterday` : undefined,
    },
    {
      label: 'Active actors',
      value: stats_?.activeActors ?? '—',
      icon: <PeopleIcon sx={{ fontSize: 16 }} />,
      color: ADMIN.success,
      sparkData: hourlyCounts,
      sub: 'unique users today',
    },
    {
      label: 'Top action',
      value: stats_?.topAction ?? '—',
      icon: <BoltIcon sx={{ fontSize: 16 }} />,
      color: ADMIN.warning,
      sparkData: hourlyCounts,
      sub: stats_ ? `${stats_.topActionCount} times · ${topPct}% of total` : undefined,
      smallValue: true,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
      {cards.map((card) => (
        <Card
          key={card.label}
          sx={{ p: 2, border: `1px solid ${ADMIN.border}`, borderRadius: '12px', boxShadow: 'none' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontWeight: 500 }}>
              {card.label}
            </Typography>
            <Box sx={{ color: card.color, opacity: 0.7 }}>{card.icon}</Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
            <Typography
              sx={{
                fontSize: card.smallValue ? 14 : 24,
                fontWeight: 700,
                color: ADMIN.heading,
                lineHeight: 1,
                fontFamily: card.smallValue ? 'inherit' : 'monospace',
              }}
            >
              {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </Typography>
            {card.change != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                {card.change >= 0
                  ? <TrendingUpIcon sx={{ fontSize: 13, color: card.color }} />
                  : <ArrowDownIcon sx={{ fontSize: 13, color: ADMIN.success }} />
                }
                <Typography variant="caption" sx={{ color: card.change >= 0 ? card.color : ADMIN.success, fontWeight: 700, fontSize: 11 }}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </Typography>
              </Box>
            )}
          </Box>

          {card.sub && (
            <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontSize: 11 }}>
              {card.sub}
            </Typography>
          )}

          <Box sx={{ mt: 1 }}>
            <Sparkline data={card.sparkData} color={card.color} />
          </Box>
        </Card>
      ))}
    </Box>
  );
}

// ─── TimelineChart ────────────────────────────────────────────────────────────

function TimelineChart({
  data,
  onHourClick,
}: {
  data: Array<{ hourLabel: string; count: number; isSpike: boolean }>;
  onHourClick: (hourLabel: string) => void;
}) {
  return (
    <Card sx={{ mb: 3, p: 2.5, border: `1px solid ${ADMIN.border}`, borderRadius: '12px', boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ADMIN.heading }}>
          Activity timeline · last 24h
        </Typography>
        <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>Click a bar to filter</Typography>
      </Box>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
          onClick={(e) => e?.activeLabel && onHourClick(e.activeLabel as string)}
        >
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 10, fill: ADMIN.textMuted }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <ReTooltip
            contentStyle={{ background: ADMIN.cardBg, border: `1px solid ${ADMIN.border}`, borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [v ?? 0, 'events']}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} cursor="pointer">
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.isSpike ? ADMIN.error : ADMIN.primary + 'BB'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {data.some((d) => d.isSpike) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: ADMIN.error }} />
          <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontSize: 11 }}>
            Red bars = spike (≥ 2× hourly average)
          </Typography>
        </Box>
      )}
    </Card>
  );
}

// ─── AnomalyBanner ────────────────────────────────────────────────────────────

function AnomalyBanner({
  stats,
  hourlyData,
  onInvestigate,
}: {
  stats: { criticalToday: number; criticalYesterday: number } | undefined;
  hourlyData: Array<{ hourLabel: string; count: number; isSpike: boolean }>;
  onInvestigate: () => void;
}) {
  const spikes = hourlyData.filter((h) => h.isSpike);
  const criticalSpike = stats && stats.criticalToday > Math.max(stats.criticalYesterday * 1.5, 3);

  if (!criticalSpike && spikes.length === 0) return null;

  const anomalies: string[] = [];
  if (criticalSpike && stats) {
    anomalies.push(`${stats.criticalToday} critical events today (vs ${stats.criticalYesterday} yesterday)`);
  }
  if (spikes.length > 0) {
    anomalies.push(`Activity spike at ${spikes.map((s) => s.hourLabel).join(', ')}`);
  }

  return (
    <Alert
      severity="error"
      icon={<WarningIcon />}
      sx={{
        mb: 3, borderRadius: '12px',
        border: `1px solid ${ADMIN.error}40`,
        '& .MuiAlert-message': { width: '100%' },
      }}
      action={
        <Button size="small" color="error" variant="outlined" onClick={onInvestigate} sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
          Investigate
        </Button>
      }
    >
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
        {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'} detected in the last 24h
      </Typography>
      <Typography variant="caption" sx={{ color: ADMIN.errorText }}>
        {anomalies.join(' · ')}
      </Typography>
    </Alert>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminActivityLogPage() {
  const [page, setPage]                   = useState(0);
  const [actionFilter, setActionFilter]   = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter]     = useState('');
  const [actorIdFilter, setActorIdFilter]       = useState('');
  const [fromFilter, setFromFilter]             = useState('');
  const [toFilter, setToFilter]                 = useState('');
  const [sortOrder, setSortOrder]               = useState<'DESC' | 'ASC'>('DESC');
  const [showAdvanced, setShowAdvanced]         = useState(false);
  const [selectedLog, setSelectedLog]           = useState<ActivityLogEntry | null>(null);
  const [timelineTarget, setTimelineTarget]     = useState<{ entityType: string; entityId: string } | null>(null);
  const [activeSavedFilter, setActiveSavedFilter] = useState(0);

  const { data: apiData, isLoading: apiLoading, isFetching: apiFetching } = useGetActivityLogsQuery({
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    entityId: entityIdFilter || undefined,
    actorId: actorIdFilter || undefined,
    from: fromFilter || undefined,
    to: toFilter || undefined,
    sort: sortOrder,
    page,
    size: 20,
  });

  const { data: hourlyData = [] } = useGetActivityLogHourlyQuery();
  const { data: stats } = useGetActivityLogStatsQuery();

  const data       = apiData;
  const isLoading  = apiLoading;
  const isFetching = apiFetching;

  const logs = data?.content ?? [];
  const totalPages    = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  function applyPreset(idx: number) {
    const preset = SAVED_FILTERS[idx];
    setActiveSavedFilter(idx);
    setActionFilter(preset.filter.action ?? '');
    setEntityTypeFilter(preset.filter.entityType ?? '');
    setEntityIdFilter('');
    setActorIdFilter('');
    setFromFilter(preset.filter.from ? dayjs(preset.filter.from).format('YYYY-MM-DDTHH:mm') : '');
    setToFilter(preset.filter.to ? dayjs(preset.filter.to).format('YYYY-MM-DDTHH:mm') : '');
    setPage(0);
  }

  function resetFilters() {
    setActionFilter('');
    setEntityTypeFilter('');
    setEntityIdFilter('');
    setActorIdFilter('');
    setFromFilter('');
    setToFilter('');
    setPage(0);
    setActiveSavedFilter(0);
  }

  function onHourClick(hourLabel: string) {
    const baseDate = dayjs().subtract(23, 'hour').startOf('hour');
    const hourIndex = hourlyData.findIndex((h) => h.hourLabel === hourLabel);
    if (hourIndex < 0) return;
    const start = baseDate.add(hourIndex, 'hour');
    setFromFilter(start.format('YYYY-MM-DDTHH:mm'));
    setToFilter(start.add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
    setPage(0);
  }

  function onInvestigate() {
    const preset = { action: 'EVENT_DELETED' };
    setActionFilter(preset.action);
    setPage(0);
  }

  const activeFilterCount = [actionFilter, entityTypeFilter, entityIdFilter, actorIdFilter, fromFilter, toFilter].filter(Boolean).length;
  const hasActiveFilters  = activeFilterCount > 0;

  // Derive row severity for styling
  const rowStyle = useMemo(() => (action: string) => {
    const s = getSeverity(action);
    if (s === 'critical') return { bgcolor: ADMIN.errorBg, borderLeft: `3px solid ${ADMIN.error}` };
    if (s === 'warning')  return { bgcolor: ADMIN.warningBg, borderLeft: `3px solid ${ADMIN.warning}` };
    return {};
  }, []);

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Activity Log"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Activity Log' }]}
          actions={
            <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 13 }}>
              {totalElements.toLocaleString()} entries
            </Typography>
          }
        >
          {/* ── Anomaly Banner ── */}
          <AnomalyBanner stats={stats} hourlyData={hourlyData} onInvestigate={onInvestigate} />

          {/* ── Summary Cards ── */}
          <SummaryCards hourlyData={hourlyData} stats={stats} />

          {/* ── Timeline Chart ── */}
          {hourlyData.length > 0 && (
            <TimelineChart data={hourlyData} onHourClick={onHourClick} />
          )}

          {/* ── Saved Filter Chips ── */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
            {SAVED_FILTERS.map((preset, idx) => (
              <Chip
                key={preset.label}
                label={preset.label}
                size="small"
                onClick={() => applyPreset(idx)}
                sx={{
                  cursor: 'pointer',
                  fontWeight: activeSavedFilter === idx ? 700 : 400,
                  bgcolor: activeSavedFilter === idx ? ADMIN.primary : ADMIN.cardBg,
                  color: activeSavedFilter === idx ? '#fff' : ADMIN.body,
                  border: `1px solid ${activeSavedFilter === idx ? ADMIN.primary : ADMIN.border}`,
                  '&:hover': { bgcolor: activeSavedFilter === idx ? ADMIN.primaryHover : ADMIN.pageBg },
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </Box>

          {/* ── Filters ── */}
          <Card sx={{ mb: 3, p: 2, border: `1px solid ${ADMIN.border}`, borderRadius: '12px', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => { setActionFilter(e.target.value); setPage(0); setActiveSavedFilter(-1); }}
                  sx={{ bgcolor: ADMIN.cardBg }}
                >
                  <MenuItem value="">All actions</MenuItem>
                  {Object.entries(ACTION_GROUPS).map(([group, actions]) => [
                    <ListSubheader key={group} sx={{ fontSize: 10, color: ADMIN.textMuted, lineHeight: '28px', bgcolor: ADMIN.pageBg }}>
                      {group.toUpperCase()}
                    </ListSubheader>,
                    ...actions.map((a) => (
                      <MenuItem key={a} value={a} sx={{ fontSize: 12, pl: 2.5 }}>{a}</MenuItem>
                    )),
                  ])}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label="Entity Type"
                  onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); setActiveSavedFilter(-1); }}
                  sx={{ bgcolor: ADMIN.cardBg }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {ENTITY_TYPES.map((e) => (
                    <MenuItem key={e} value={e} sx={{ fontSize: 12 }}>{e}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title={sortOrder === 'DESC' ? 'Newest first' : 'Oldest first'}>
                <Box
                  onClick={() => { setSortOrder((s) => s === 'DESC' ? 'ASC' : 'DESC'); setPage(0); }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, height: 40, borderRadius: 1, cursor: 'pointer',
                    border: `1px solid ${ADMIN.border}`, color: ADMIN.textSecondary,
                    '&:hover': { borderColor: ADMIN.primary, color: ADMIN.primary },
                    transition: 'all 0.15s',
                  }}
                >
                  {sortOrder === 'DESC' ? <ArrowDownIcon sx={{ fontSize: 15 }} /> : <ArrowUpIcon sx={{ fontSize: 15 }} />}
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                    {sortOrder === 'DESC' ? 'Newest' : 'Oldest'}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Advanced filters">
                <Box
                  onClick={() => setShowAdvanced((v) => !v)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, height: 40, borderRadius: 1, cursor: 'pointer',
                    border: `1px solid ${showAdvanced || activeFilterCount > 0 ? ADMIN.primary : ADMIN.border}`,
                    color: showAdvanced || activeFilterCount > 0 ? ADMIN.primary : ADMIN.textSecondary,
                    bgcolor: showAdvanced || activeFilterCount > 0 ? ADMIN.primary + '08' : 'transparent',
                    '&:hover': { borderColor: ADMIN.primary, color: ADMIN.primary },
                    transition: 'all 0.15s',
                  }}
                >
                  <FilterIcon sx={{ fontSize: 15 }} />
                  {activeFilterCount > 0 && (
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: ADMIN.primary, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeFilterCount}
                    </Box>
                  )}
                </Box>
              </Tooltip>

              {hasActiveFilters && (
                <Typography variant="caption" sx={{ color: ADMIN.primary, cursor: 'pointer', ml: 'auto' }} onClick={resetFilters}>
                  Clear all
                </Typography>
              )}
            </Box>

            {hasActiveFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
                {actionFilter && (
                  <Chip label={actionFilter} size="small"
                    onDelete={() => { setActionFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
                {entityTypeFilter && (
                  <Chip label={entityTypeFilter} size="small"
                    onDelete={() => { setEntityTypeFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
                {entityIdFilter && (
                  <Chip label={`ID: ${entityIdFilter.substring(0, 14)}…`} size="small"
                    onDelete={() => { setEntityIdFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
                {actorIdFilter && (
                  <Chip label={`Actor: ${actorIdFilter.substring(0, 14)}…`} size="small"
                    onDelete={() => { setActorIdFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
                {fromFilter && (
                  <Chip label={`From: ${dayjs(fromFilter).format('DD/MM/YY HH:mm')}`} size="small"
                    onDelete={() => { setFromFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
                {toFilter && (
                  <Chip label={`To: ${dayjs(toFilter).format('DD/MM/YY HH:mm')}`} size="small"
                    onDelete={() => { setToFilter(''); setPage(0); }}
                    sx={{ bgcolor: ADMIN.primary + '12', color: ADMIN.primary, fontSize: 11 }} />
                )}
              </Box>
            )}

            <Collapse in={showAdvanced}>
              <Divider sx={{ my: 1.5, borderColor: ADMIN.border }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small" label="Entity ID" placeholder="UUID or numeric ID"
                  value={entityIdFilter}
                  onChange={(e) => { setEntityIdFilter(e.target.value.trim()); setPage(0); }}
                  sx={{ minWidth: 280, '& .MuiInputBase-root': { bgcolor: ADMIN.cardBg } }}
                />
                <TextField
                  size="small" label="Actor ID (UUID)" placeholder="User UUID"
                  value={actorIdFilter}
                  onChange={(e) => { setActorIdFilter(e.target.value.trim()); setPage(0); }}
                  sx={{ minWidth: 280, '& .MuiInputBase-root': { bgcolor: ADMIN.cardBg } }}
                />
                <TextField
                  size="small" label="From" type="datetime-local"
                  value={fromFilter}
                  onChange={(e) => { setFromFilter(e.target.value); setPage(0); }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ minWidth: 220, '& .MuiInputBase-root': { bgcolor: ADMIN.cardBg } }}
                />
                <TextField
                  size="small" label="To" type="datetime-local"
                  value={toFilter}
                  onChange={(e) => { setToFilter(e.target.value); setPage(0); }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ minWidth: 220, '& .MuiInputBase-root': { bgcolor: ADMIN.cardBg } }}
                />
              </Box>
            </Collapse>
          </Card>

          {/* ── Table ── */}
          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TimelineIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No activity logs found</Typography>
                {hasActiveFilters && (
                  <Typography variant="body2" sx={{ color: ADMIN.primary, cursor: 'pointer', mt: 1 }} onClick={resetFilters}>
                    Clear filters
                  </Typography>
                )}
              </Box>
            ) : (
              <>
                <TableContainer sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                        {['Time', 'Actor', 'Action', 'Entity', 'Description', 'Changes'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => {
                        const c = getActionColor(log.action);
                        const actorColor = getActorColor(log.actorRole);
                        const hasChanges = log.oldValue != null || log.newValue != null;
                        const sStyle = rowStyle(log.action);
                        return (
                          <TableRow
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            sx={{ cursor: 'pointer', '&:hover': { filter: 'brightness(0.97)' }, ...sStyle }}
                          >
                            {/* Time */}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>
                                {log.createdAt ? dayjs(log.createdAt).format('DD/MM/YY HH:mm:ss') : '—'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                                {log.createdAt ? dayjs(log.createdAt).fromNow() : '(unknown)'}
                              </Typography>
                            </TableCell>

                            {/* Actor */}
                            <TableCell>
                              {/* FlexPass purchase: show seller → buyer transfer */}
                              {log.entityType === 'FLEXPASS_PURCHASE' && log.ownerName ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Avatar sx={{ width: 20, height: 20, bgcolor: '#FEF3C7', color: '#B45309', fontSize: 8, fontWeight: 700 }}>
                                      {(log.ownerName ?? '?')[0].toUpperCase()}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontSize: 11, color: ADMIN.textSecondary, fontWeight: 500 }}>
                                      {log.ownerName}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ fontSize: 10, color: ADMIN.textMuted, pl: '24px' }}>↓ sold to</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Avatar sx={{ width: 20, height: 20, bgcolor: actorColor + '18', color: actorColor, fontSize: 8, fontWeight: 700 }}>
                                      {actorInitials(log.actorName, log.actorRole)}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontSize: 11, color: ADMIN.body, fontWeight: 600 }}>
                                      {log.actorName ?? log.actorId?.substring(0, 8) + '…'}
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 28, height: 28, bgcolor: actorColor + '18', color: actorColor, fontSize: 10, fontWeight: 700 }}>
                                    {actorInitials(log.actorName, log.actorRole)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="caption" sx={{ color: ADMIN.body, fontWeight: 600, display: 'block' }}>
                                      {log.actorName ?? log.actorId?.substring(0, 8) + '…'}
                                    </Typography>
                                    <Chip
                                      label={log.actorRole}
                                      size="small"
                                      sx={{
                                        fontSize: 9, height: 16,
                                        bgcolor: actorColor + '15',
                                        color: actorColor,
                                        '& .MuiChip-label': { px: 0.75 },
                                      }}
                                    />
                                  </Box>
                                </Box>
                              )}
                            </TableCell>

                            {/* Action */}
                            <TableCell>
                              <Chip
                                label={log.action}
                                size="small"
                                sx={{ bgcolor: c + '15', color: c, fontWeight: 600, fontSize: 10, maxWidth: 240 }}
                              />
                            </TableCell>

                            {/* Entity + timeline */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Chip label={log.entityType} size="small" sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary, fontSize: 10 }} />
                                  <Tooltip title={log.entityId}>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: ADMIN.textMuted, display: 'block', mt: 0.5, fontFamily: 'monospace', cursor: 'pointer' }}
                                    >
                                      {log.entityId?.length > 16 ? log.entityId.substring(0, 16) + '…' : log.entityId}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                                <Tooltip title="View entity timeline">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); setTimelineTarget({ entityType: log.entityType, entityId: log.entityId }); }}
                                    sx={{ p: 0.5, color: ADMIN.textMuted, '&:hover': { color: ADMIN.primary, bgcolor: ADMIN.primary + '10' } }}
                                  >
                                    <AccountTreeIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>

                            {/* Description */}
                            <TableCell sx={{ maxWidth: 280 }}>
                              <Typography variant="body2" sx={{ fontSize: 13, color: ADMIN.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {log.description}
                              </Typography>
                            </TableCell>

                            {/* Changes */}
                            <TableCell>
                              {hasChanges ? (
                                <Chip label="View diff" size="small" sx={{ bgcolor: ADMIN.primaryLight, color: ADMIN.primaryText, fontSize: 10, cursor: 'pointer' }} />
                              ) : (
                                <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ borderColor: ADMIN.border }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
                  <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                    Showing {logs.length} of {totalElements.toLocaleString()} entries
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(_, p) => setPage(p - 1)}
                    size="small"
                    sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: ADMIN.primary, color: '#fff' } }}
                  />
                </Box>
              </>
            )}
          </Card>

          <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
          <EntityTimelineDrawer
            target={timelineTarget}
            onClose={() => setTimelineTarget(null)}
            onSelectLog={(log) => { setTimelineTarget(null); setSelectedLog(log); }}
          />
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
