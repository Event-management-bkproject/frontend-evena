'use client';

import { useState } from 'react';
import {
  Box, Card, Typography, Chip, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, CircularProgress, MenuItem, Select, FormControl, InputLabel,
  Avatar, Pagination, Divider, TextField, Drawer, IconButton, Stack, Collapse,
  Tooltip, ListSubheader,
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
} from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import {
  useGetActivityLogsQuery,
  useGetEntityTimelineQuery,
  ActivityLogEntry,
} from '@/src/stores/services/ActivityLogApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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
    'FLEXPASS_REFUND_COMPENSATION_PENDING', 'FLEXPASS_REFUND_COMPENSATION_COMPLETED', 'FLEXPASS_REFUND_COMPENSATION_FAILED',
    'FLEXPASS_SALE_WINDOW_CREATED', 'FLEXPASS_SALE_WINDOW_CANCELLED',
    'FLEXPASS_SALE_WINDOW_OPENED', 'FLEXPASS_SALE_WINDOW_CLOSED',
  ],
};

const ENTITY_TYPES = [
  'EVENT', 'TICKET_TYPE', 'ORDER', 'TICKET', 'PAYMENT',
  'ORGANIZATION', 'REFUND_REQUEST', 'FLEXPASS_LISTING', 'FLEXPASS_PURCHASE', 'FLEXPASS_SALE_WINDOW',
];

function getColor(action: string) {
  if (/CREATE|ISSUED|SUCCESS|COMPLET|VERIF|APPROV|PUBLISH/.test(action)) return ADMIN.success;
  if (/DELET|CANCEL|FAIL|REJECT/.test(action)) return ADMIN.error;
  if (/UPDATE|PENDING|INITIAT|OPEN/.test(action)) return ADMIN.primary;
  if (/REFUND|REQUEST/.test(action)) return ADMIN.warning;
  return ADMIN.textMuted;
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
  const c = getColor(log.action);

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
            <Avatar sx={{ width: 24, height: 24, bgcolor: c + '20', color: c, fontSize: 10, fontWeight: 700 }}>
              {log.actorRole?.[0] ?? '?'}
            </Avatar>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.body }}>{log.actorId}</Typography>
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
  target,
  onClose,
  onSelectLog,
}: {
  target: { entityType: string; entityId: string } | null;
  onClose: () => void;
  onSelectLog: (log: ActivityLogEntry) => void;
}) {
  const { data, isLoading } = useGetEntityTimelineQuery(
    target
      ? { entityType: target.entityType, entityId: target.entityId, size: 100 }
      : { entityType: '', entityId: '' },
    { skip: !target },
  );

  const entries = data?.content ?? [];

  return (
    <Drawer
      anchor="right"
      open={!!target}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 520, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5,
        borderBottom: `1px solid ${ADMIN.border}`,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 16 }}>
            Entity Timeline
          </Typography>
          {target && (
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Chip
                label={target.entityType}
                size="small"
                sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary, fontSize: 10 }}
              />
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.textMuted }}>
                {target.entityId}
              </Typography>
            </Stack>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* Body */}
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
              const c = getColor(entry.action);
              const isLast = idx === entries.length - 1;
              const hasChanges = entry.oldValue != null || entry.newValue != null;

              return (
                <Box key={entry.id} sx={{ display: 'flex', gap: 2 }}>
                  {/* Dot + connecting line */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '3px' }}>
                    <Box sx={{
                      width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                      bgcolor: c, boxShadow: `0 0 0 3px ${c}22`,
                    }} />
                    {!isLast && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: ADMIN.border, minHeight: 28, mt: '3px' }} />
                    )}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, pb: isLast ? 0 : 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={entry.action}
                        size="small"
                        sx={{ bgcolor: c + '15', color: c, fontWeight: 600, fontSize: 10 }}
                      />
                      <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                        {dayjs(entry.createdAt).format('DD/MM/YY HH:mm:ss')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                        · {dayjs(entry.createdAt).fromNow()}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body, mb: 0.75 }}>
                      {entry.description}
                    </Typography>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Avatar sx={{ width: 18, height: 18, bgcolor: c + '20', color: c, fontSize: 9, fontWeight: 700 }}>
                        {entry.actorRole?.[0] ?? '?'}
                      </Avatar>
                      <Typography variant="caption" sx={{ color: ADMIN.textMuted, fontFamily: 'monospace' }}>
                        {entry.actorId?.substring(0, 8)}…
                      </Typography>
                      <Chip
                        label={entry.actorRole}
                        size="small"
                        sx={{ fontSize: 9, height: 16, '& .MuiChip-label': { px: 0.75 } }}
                      />
                    </Stack>

                    {hasChanges && (
                      <Box
                        onClick={() => { onClose(); onSelectLog(entry); }}
                        sx={{
                          mt: 0.75, display: 'inline-flex', alignItems: 'center',
                          cursor: 'pointer', color: ADMIN.primary,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600 }}>
                          View diff →
                        </Typography>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminActivityLogPage() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [entityIdFilter, setEntityIdFilter] = useState('');
  const [actorIdFilter, setActorIdFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [timelineTarget, setTimelineTarget] = useState<{ entityType: string; entityId: string } | null>(null);

  const { data, isLoading, isFetching } = useGetActivityLogsQuery({
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    entityId: entityIdFilter || undefined,
    actorId: actorIdFilter || undefined,
    from: fromFilter || undefined,
    to: toFilter || undefined,
    sort: `createdAt,${sortOrder}`,
    page,
    size: 20,
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  function resetFilters() {
    setActionFilter('');
    setEntityTypeFilter('');
    setEntityIdFilter('');
    setActorIdFilter('');
    setFromFilter('');
    setToFilter('');
    setPage(0);
  }

  const activeFilterCount = [actionFilter, entityTypeFilter, entityIdFilter, actorIdFilter, fromFilter, toFilter]
    .filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

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
          {/* ── Filters ── */}
          <Card sx={{ mb: 3, p: 2, border: `1px solid ${ADMIN.border}`, borderRadius: '12px', boxShadow: 'none' }}>

            {/* Basic row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Action — grouped dropdown */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                  sx={{ bgcolor: ADMIN.cardBg }}
                >
                  <MenuItem value="">All actions</MenuItem>
                  {Object.entries(ACTION_GROUPS).map(([group, actions]) => [
                    <ListSubheader
                      key={group}
                      sx={{ fontSize: 10, color: ADMIN.textMuted, lineHeight: '28px', bgcolor: ADMIN.pageBg }}
                    >
                      {group.toUpperCase()}
                    </ListSubheader>,
                    ...actions.map((a) => (
                      <MenuItem key={a} value={a} sx={{ fontSize: 12, pl: 2.5 }}>{a}</MenuItem>
                    )),
                  ])}
                </Select>
              </FormControl>

              {/* Entity Type */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label="Entity Type"
                  onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(0); }}
                  sx={{ bgcolor: ADMIN.cardBg }}
                >
                  <MenuItem value="">All types</MenuItem>
                  {ENTITY_TYPES.map((e) => (
                    <MenuItem key={e} value={e} sx={{ fontSize: 12 }}>{e}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort toggle */}
              <Tooltip title={sortOrder === 'desc' ? 'Newest first — click to show oldest first' : 'Oldest first — click to show newest first'}>
                <Box
                  onClick={() => { setSortOrder((s) => s === 'desc' ? 'asc' : 'desc'); setPage(0); }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    px: 1.5, height: 40, borderRadius: 1, cursor: 'pointer',
                    border: `1px solid ${ADMIN.border}`, color: ADMIN.textSecondary,
                    '&:hover': { borderColor: ADMIN.primary, color: ADMIN.primary },
                    transition: 'all 0.15s',
                  }}
                >
                  {sortOrder === 'desc'
                    ? <ArrowDownIcon sx={{ fontSize: 15 }} />
                    : <ArrowUpIcon sx={{ fontSize: 15 }} />
                  }
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                    {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
                  </Typography>
                </Box>
              </Tooltip>

              {/* Advanced filter toggle with badge */}
              <Tooltip title="Advanced filters (date range, Entity ID, Actor ID)">
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
                    <Box sx={{
                      width: 16, height: 16, borderRadius: '50%',
                      bgcolor: ADMIN.primary, color: '#fff',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activeFilterCount}
                    </Box>
                  )}
                </Box>
              </Tooltip>

              {hasActiveFilters && (
                <Typography
                  variant="caption"
                  sx={{ color: ADMIN.primary, cursor: 'pointer', ml: 'auto' }}
                  onClick={resetFilters}
                >
                  Clear all
                </Typography>
              )}
            </Box>

            {/* Active filter chips */}
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

            {/* Advanced filters */}
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
                          <TableCell
                            key={h}
                            sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => {
                        const c = getColor(log.action);
                        const hasChanges = log.oldValue != null || log.newValue != null;
                        return (
                          <TableRow
                            key={log.id}
                            onClick={() => setSelectedLog(log)}
                            sx={{ cursor: 'pointer', '&:hover': { bgcolor: ADMIN.surfaceBg } }}
                          >
                            {/* Time */}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>
                                {dayjs(log.createdAt).format('DD/MM/YY HH:mm:ss')}
                              </Typography>
                              <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>
                                {dayjs(log.createdAt).fromNow()}
                              </Typography>
                            </TableCell>

                            {/* Actor */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: c + '18', color: c, fontSize: 11, fontWeight: 700 }}>
                                  {log.actorRole?.[0] ?? '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.textSecondary }}>
                                    {log.actorId?.substring(0, 8)}…
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block' }}>
                                    {log.actorRole}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>

                            {/* Action */}
                            <TableCell>
                              <Chip
                                label={log.action}
                                size="small"
                                sx={{ bgcolor: c + '15', color: c, fontWeight: 600, fontSize: 10, maxWidth: 240 }}
                              />
                            </TableCell>

                            {/* Entity + timeline button */}
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Chip
                                    label={log.entityType}
                                    size="small"
                                    sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary, fontSize: 10 }}
                                  />
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTimelineTarget({ entityType: log.entityType, entityId: log.entityId });
                                    }}
                                    sx={{
                                      p: 0.5, color: ADMIN.textMuted,
                                      '&:hover': { color: ADMIN.primary, bgcolor: ADMIN.primary + '10' },
                                    }}
                                  >
                                    <AccountTreeIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>

                            {/* Description */}
                            <TableCell sx={{ maxWidth: 280 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: 13, color: ADMIN.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              >
                                {log.description}
                              </Typography>
                            </TableCell>

                            {/* Changes */}
                            <TableCell>
                              {hasChanges ? (
                                <Chip
                                  label="View diff"
                                  size="small"
                                  sx={{ bgcolor: ADMIN.primaryLight, color: ADMIN.primaryText, fontSize: 10, cursor: 'pointer' }}
                                />
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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
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

          {/* Detail drawer */}
          <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />

          {/* Entity timeline drawer */}
          <EntityTimelineDrawer
            target={timelineTarget}
            onClose={() => setTimelineTarget(null)}
            onSelectLog={(log) => {
              setTimelineTarget(null);
              setSelectedLog(log);
            }}
          />
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
