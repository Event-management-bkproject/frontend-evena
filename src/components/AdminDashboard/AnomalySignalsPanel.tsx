'use client';

import { useMemo } from 'react';
import { Box, Card, Typography, Chip, CircularProgress } from '@mui/material';
import {
  Warning as WarnIcon,
  CheckCircle as OkIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useGetActivityLogsQuery, ActivityLogEntry } from '@/src/stores/services/ActivityLogApi';
import { ADMIN } from '@/src/utils/constants/adminBrand';
import dayjs from 'dayjs';

interface Signal {
  id: string;
  severity: 'high' | 'medium' | 'low';
  label: string;
  detail: string;
  actor?: string;
}

// Sliding 5-minute window threshold for repeated actions by same actor
const RAPID_THRESHOLD = 5;
const RAPID_WINDOW_MINUTES = 5;

function detectAnomalies(logs: ActivityLogEntry[]): Signal[] {
  const signals: Signal[] = [];
  const now = dayjs();

  // Group by actor + action within the past RAPID_WINDOW_MINUTES minutes
  const recent = logs.filter((l) => dayjs(l.createdAt).isAfter(now.subtract(RAPID_WINDOW_MINUTES, 'minute')));

  const actorActionCount: Record<string, { count: number; actorName: string }> = {};
  for (const log of recent) {
    if (!log.actorId) continue;
    const key = `${log.actorId}::${log.action}`;
    if (!actorActionCount[key]) actorActionCount[key] = { count: 0, actorName: log.actorName ?? log.actorId };
    actorActionCount[key].count++;
  }

  for (const [key, { count, actorName }] of Object.entries(actorActionCount)) {
    if (count >= RAPID_THRESHOLD) {
      const action = key.split('::')[1];
      signals.push({
        id: `rapid-${key}`,
        severity: count >= 10 ? 'high' : 'medium',
        label: `Rapid ${action.replace(/_/g, ' ')}`,
        detail: `${count}× in ${RAPID_WINDOW_MINUTES} min`,
        actor: actorName,
      });
    }
  }

  // Detect ORDER_EXPIRED spikes (many expired = users not paying)
  const expiredOrders = recent.filter((l) => l.action === 'ORDER_EXPIRED');
  if (expiredOrders.length >= 5) {
    signals.push({
      id: 'order-expired-spike',
      severity: 'medium',
      label: 'Order Expiry Spike',
      detail: `${expiredOrders.length} orders expired in ${RAPID_WINDOW_MINUTES} min — users not completing payment`,
    });
  }

  // Detect REFUND_REQUEST spike
  const refundRequests = recent.filter((l) => l.action.includes('REFUND'));
  if (refundRequests.length >= 3) {
    signals.push({
      id: 'refund-spike',
      severity: 'medium',
      label: 'Refund Request Spike',
      detail: `${refundRequests.length} refund events in ${RAPID_WINDOW_MINUTES} min`,
    });
  }

  // Detect failed payment pattern (ORDER_CANCELLED after ORDER_CREATED by same actor)
  const cancelledByActor: Record<string, number> = {};
  for (const log of logs.slice(0, 100)) {
    if (log.action === 'ORDER_CANCELLED' && log.actorId) {
      cancelledByActor[log.actorId] = (cancelledByActor[log.actorId] ?? 0) + 1;
    }
  }
  for (const [actorId, count] of Object.entries(cancelledByActor)) {
    if (count >= 4) {
      const actor = logs.find((l) => l.actorId === actorId)?.actorName ?? actorId;
      signals.push({
        id: `cancel-pattern-${actorId}`,
        severity: count >= 8 ? 'high' : 'medium',
        label: 'High Order Cancellation Rate',
        detail: `${count} cancellations`,
        actor,
      });
    }
  }

  return signals.slice(0, 6); // cap at 6 signals
}

const SEVERITY_COLOR: Record<string, string> = {
  high: ADMIN.error,
  medium: ADMIN.warning,
  low: ADMIN.info,
};

export default function AnomalySignalsPanel() {
  const { data, isLoading } = useGetActivityLogsQuery({ page: 0, size: 100, sort: 'DESC' });

  const signals = useMemo(() => {
    if (!data?.content) return [];
    return detectAnomalies(data.content);
  }, [data]);

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${ADMIN.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SecurityIcon sx={{ color: ADMIN.warning, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 14 }}>
          Anomaly Signals
        </Typography>
        {signals.length > 0 && (
          <Chip
            label={signals.length}
            size="small"
            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: ADMIN.error + '18', color: ADMIN.error, ml: 'auto' }}
          />
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={20} sx={{ color: ADMIN.primary }} />
        </Box>
      ) : signals.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2.5, gap: 0.75 }}>
          <OkIcon sx={{ fontSize: 28, color: ADMIN.success }} />
          <Typography sx={{ fontSize: 12, color: ADMIN.textSecondary }}>No anomalies in last 5 min</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {signals.map((s) => {
            const color = SEVERITY_COLOR[s.severity];
            return (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  p: 1.25,
                  borderRadius: '8px',
                  bgcolor: color + '10',
                  border: `1px solid ${color}30`,
                  alignItems: 'flex-start',
                }}
              >
                <WarnIcon sx={{ color, fontSize: 16, mt: 0.15, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: ADMIN.heading }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: ADMIN.textSecondary }}>
                    {s.detail}{s.actor ? ` — ${s.actor}` : ''}
                  </Typography>
                </Box>
                <Chip
                  label={s.severity.toUpperCase()}
                  size="small"
                  sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: color + '18', color, flexShrink: 0 }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}
