'use client';

import { useState } from 'react';
import {
  Box, Card, Typography, Chip, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress, MenuItem, Select, FormControl, InputLabel, Avatar, Pagination, Divider,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import AdminLayout from '@/src/components/layout/AdminLayout';
import AdminPageShell from '@/src/components/AdminSidebar/AdminPageShell';
import RoleGuard from '@/src/components/RoleGuard';
import { useGetActivityLogsQuery } from '@/src/stores/services/ActivityLogApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const LOG_ACTIONS = [
  'EVENT_CREATED','EVENT_UPDATED','EVENT_DELETED',
  'ORDER_CREATED','ORDER_CANCELLED','ORDER_SUCCESSFULL',
  'TICKET_ISSUED','TICKET_USED','TICKET_CANCELLED',
  'PAYMENT_INITIATED','PAYMENT_SUCCESS','PAYMENT_FAILED','PAYMENT_REFUNDED',
  'ORGANIZATION_ADDED','ORGANIZATION_UPDATED','ORGANIZATION_VERIFIED','ORGANIZATION_DELETED',
  'REFUND_REQUESTED','REFUND_APPROVED','REFUND_REJECTED','REFUND_COMPLETED',
  'FLEXPASS_LISTING_CREATED','FLEXPASS_TRANSFER_COMPLETED','FLEXPASS_SALE_WINDOW_OPENED',
];

const ENTITY_TYPES = [
  'EVENT','TICKET_TYPE','ORDER','TICKET','PAYMENT',
  'ORGANIZATION','REFUND_REQUEST','FLEXPASS_LISTING','FLEXPASS_PURCHASE','FLEXPASS_SALE_WINDOW',
];

function getColor(action: string) {
  if (/CREATE|ISSUED|SUCCESS|COMPLET|VERIF|APPROV|PUBLISH/.test(action)) return ADMIN.success;
  if (/DELET|CANCEL|FAIL|REJECT/.test(action)) return ADMIN.error;
  if (/UPDATE|PENDING|INITIAT|OPEN/.test(action)) return ADMIN.primary;
  if (/REFUND|REQUEST/.test(action)) return ADMIN.warning;
  return ADMIN.textMuted;
}

export default function AdminActivityLogPage() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const { data, isLoading, isFetching } = useGetActivityLogsQuery({
    action: actionFilter || undefined,
    entityType: entityTypeFilter || undefined,
    page,
    size: 20,
  });

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminLayout>
        <AdminPageShell
          title="Activity Log"
          breadcrumbs={[{ label: 'Admin', href: '/dashboard/admin' }, { label: 'Activity Log' }]}
          actions={
            <Typography variant="body2" sx={{ color: ADMIN.textSecondary, fontSize: 13 }}>
              {totalElements} total entries
            </Typography>
          }
        >
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                label="Action"
                onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                sx={{ bgcolor: ADMIN.cardBg }}
              >
                <MenuItem value="">All actions</MenuItem>
                {LOG_ACTIONS.map((a) => (
                  <MenuItem key={a} value={a} sx={{ fontSize: 12 }}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
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
          </Box>

          <Card sx={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${ADMIN.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: ADMIN.primary }} />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TimelineIcon sx={{ fontSize: 48, color: ADMIN.border, mb: 1 }} />
                <Typography sx={{ color: ADMIN.textSecondary }}>No activity logs found</Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: ADMIN.pageBg }}>
                        {['Time', 'Actor', 'Action', 'Entity', 'Description'].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600, color: ADMIN.heading, fontSize: 12, borderBottom: `1px solid ${ADMIN.border}` }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => {
                        const c = getColor(log.action);
                        return (
                          <TableRow key={log.id} sx={{ '&:hover': { bgcolor: ADMIN.surfaceBg } }}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" sx={{ fontSize: 12, color: ADMIN.body }}>{dayjs(log.createdAt).format('DD/MM/YY HH:mm:ss')}</Typography>
                              <Typography variant="caption" sx={{ color: ADMIN.textMuted }}>{dayjs(log.createdAt).fromNow()}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: c + '18', color: c, fontSize: 11, fontWeight: 700 }}>
                                  {log.actorRole?.[0] ?? '?'}
                                </Avatar>
                                <Box>
                                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: ADMIN.textSecondary }}>{log.actorId?.substring(0, 8)}…</Typography>
                                  <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block' }}>{log.actorRole}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={log.action} size="small" sx={{ bgcolor: c + '15', color: c, fontWeight: 600, fontSize: 10, maxWidth: 220 }} />
                            </TableCell>
                            <TableCell>
                              <Chip label={log.entityType} size="small" sx={{ bgcolor: ADMIN.pageBg, color: ADMIN.textSecondary, fontSize: 10 }} />
                              <Typography variant="caption" sx={{ color: ADMIN.textMuted, display: 'block', mt: 0.5, fontFamily: 'monospace' }}>{log.entityId}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontSize: 13, color: ADMIN.body }}>{log.description}</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ borderColor: ADMIN.border }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <Pagination count={totalPages} page={page + 1} onChange={(_, p) => setPage(p - 1)} size="small"
                    sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: ADMIN.primary, color: '#fff' } }} />
                </Box>
              </>
            )}
          </Card>
        </AdminPageShell>
      </AdminLayout>
    </RoleGuard>
  );
}
