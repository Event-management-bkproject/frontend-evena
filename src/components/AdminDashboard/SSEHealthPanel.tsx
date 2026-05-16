'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, Card, Typography, Chip, CircularProgress, Tooltip } from '@mui/material';
import {
  Circle as DotIcon,
  Wifi as WifiIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ADMIN } from '@/src/utils/constants/adminBrand';

const SSE_BASE_URL = process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000';
const POLL_INTERVAL_MS = 30_000;

interface ChannelStats {
  active_connections: number;
}

interface SSEStats {
  total_connections: number;
  channels: Record<string, ChannelStats>;
}

type ServiceStatus = 'up' | 'down' | 'loading';

interface BackendHealth {
  status: ServiceStatus;
  db?: string;
}

interface SSEHealth {
  status: ServiceStatus;
  stats?: SSEStats;
}

function StatusDot({ status }: { status: ServiceStatus }) {
  const color =
    status === 'up' ? ADMIN.success :
    status === 'down' ? ADMIN.error :
    ADMIN.textMuted;

  return (
    <DotIcon sx={{ fontSize: 10, color, animation: status === 'up' ? 'pulse 2s infinite' : 'none' }} />
  );
}

function ServiceCard({
  label,
  status,
  primary,
  secondary,
  loading,
}: {
  label: string;
  status: ServiceStatus;
  primary: string;
  secondary?: string;
  loading?: boolean;
}) {
  const statusLabel = status === 'up' ? 'UP' : status === 'down' ? 'DOWN' : '...';
  const statusColor = status === 'up' ? ADMIN.success : status === 'down' ? ADMIN.error : ADMIN.textMuted;

  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        borderRadius: '10px',
        border: `1px solid ${status === 'down' ? ADMIN.error + '40' : ADMIN.border}`,
        bgcolor: status === 'down' ? ADMIN.errorBg : ADMIN.surfaceBg,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: ADMIN.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        {loading ? (
          <CircularProgress size={10} sx={{ color: ADMIN.textMuted }} />
        ) : (
          <Chip
            icon={<StatusDot status={status} />}
            label={statusLabel}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: statusColor + '18',
              color: statusColor,
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        )}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: ADMIN.heading }} noWrap>
        {primary}
      </Typography>
      {secondary && (
        <Typography sx={{ fontSize: 11, color: ADMIN.textMuted }} noWrap>
          {secondary}
        </Typography>
      )}
    </Box>
  );
}

export default function SSEHealthPanel() {
  const [backend, setBackend] = useState<BackendHealth>({ status: 'loading' });
  const [sse, setSSE] = useState<SSEHealth>({ status: 'loading' });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';

    // Backend health
    try {
      const res = await fetch(`${apiUrl}/actuator/health`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBackend({
          status: data.status === 'UP' ? 'up' : 'down',
          db: data.components?.db?.status,
        });
      } else {
        setBackend({ status: 'down' });
      }
    } catch {
      setBackend({ status: 'down' });
    }

    // SSE service health + stats
    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch(`${SSE_BASE_URL}/health`),
        fetch(`${SSE_BASE_URL}/stats`),
      ]);

      const statsData: SSEStats | null = statsRes.ok ? await statsRes.json() : null;
      setSSE({
        status: healthRes.ok ? 'up' : 'down',
        stats: statsData ?? undefined,
      });
    } catch {
      setSSE({ status: 'down' });
    }

    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const totalConnections = sse.stats?.total_connections ?? 0;
  const channels = sse.stats?.channels ?? {};
  const channelSummary = Object.entries(channels)
    .filter(([, v]) => v.active_connections > 0)
    .map(([k, v]) => `${k}: ${v.active_connections}`)
    .join(' · ');

  const backendPrimary =
    backend.status === 'loading' ? 'Checking...' :
    backend.status === 'up' ? (backend.db === 'UP' ? 'Healthy' : 'DB degraded') :
    'Unreachable';

  const ssePrimary =
    sse.status === 'loading' ? 'Checking...' :
    sse.status === 'up' ? `${totalConnections} client${totalConnections !== 1 ? 's' : ''} connected` :
    'Unreachable';

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${ADMIN.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        p: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WifiIcon sx={{ color: ADMIN.primary, fontSize: 18 }} />
          <Typography sx={{ fontWeight: 700, color: ADMIN.heading, fontSize: 14 }}>
            System Health
          </Typography>
        </Box>
        <Tooltip title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Checking...'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'default' }}>
            <RefreshIcon sx={{ fontSize: 12, color: ADMIN.textMuted }} />
            <Typography sx={{ fontSize: 10, color: ADMIN.textMuted }}>
              {lastChecked ? `${lastChecked.toLocaleTimeString()}` : '—'}
            </Typography>
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: channelSummary ? 1.5 : 0 }}>
        <ServiceCard
          label="Backend"
          status={backend.status}
          primary={backendPrimary}
          secondary={backend.db ? `DB: ${backend.db}` : undefined}
          loading={backend.status === 'loading'}
        />
        <ServiceCard
          label="SSE Service"
          status={sse.status}
          primary={ssePrimary}
          secondary={sse.status === 'up' ? 'auto-refresh in 30s' : undefined}
          loading={sse.status === 'loading'}
        />
      </Box>

      {sse.status === 'up' && channelSummary && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.25,
            borderRadius: '8px',
            bgcolor: ADMIN.primaryLight,
            border: `1px solid ${ADMIN.primary}20`,
          }}
        >
          <PeopleIcon sx={{ fontSize: 14, color: ADMIN.primary, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: ADMIN.primaryText }}>
            {channelSummary}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
