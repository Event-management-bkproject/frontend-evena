'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import { KeyboardArrowDown as ChevronDownIcon } from '@mui/icons-material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import sampleData from '@/src/data/ordersChartData.json';
import { OrderResponse } from '@/src/stores/types/order';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Period = 'This Week' | 'This Month';

function computeFromOrders(orders: OrderResponse[]) {
  const now = new Date();

  // ── Weekly: current Sun→Sat window ──────────────────────────────────────
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const dayBuckets: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // ── Monthly: current month grouped into 4 weeks ─────────────────────────
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const weekBuckets: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const order of orders) {
    const d = new Date(order.createdAt);

    if (d >= startOfWeek && d < endOfWeek) {
      dayBuckets[d.getDay()]++;
    }
    if (d >= startOfMonth && d <= endOfMonth) {
      weekBuckets[Math.min(Math.floor((d.getDate() - 1) / 7), 3)]++;
    }
  }

  const weekly  = DAY_LABELS.map((day, i) => ({ day, orders: dayBuckets[i] }));
  const monthly = [0, 1, 2, 3].map((i) => ({ day: `Week ${i + 1}`, orders: weekBuckets[i] }));

  return { weekly, monthly };
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '10px 10px 10px 0', px: '12px', py: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '1px solid #DDD8D8' }}>
      <Typography sx={{ color: '#ADACAE', fontSize: 8, fontWeight: 500 }}>{label}</Typography>
      <Box sx={{ height: '1px', bgcolor: '#DDD8D8', my: '4px' }} />
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <Typography sx={{ color: 'black', fontSize: 12, fontWeight: 600 }}>{payload[0].value.toLocaleString()}</Typography>
        <Typography sx={{ color: '#ADACAE', fontSize: 8, fontWeight: 500 }}>Orders</Typography>
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { orders?: OrderResponse[] }

export function OrdersOverviewChart({ orders }: Props) {
  const [period, setPeriod] = useState<Period>('This Week');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const computed = useMemo(() => {
    if (!orders?.length) return null;
    return computeFromOrders(orders);
  }, [orders]);

  // Use real data if computed has any non-zero values, otherwise fall back to sample
  const hasRealData = computed && (
    computed.weekly.some((d) => d.orders > 0) ||
    computed.monthly.some((d) => d.orders > 0)
  );

  const weeklyData  = hasRealData ? computed!.weekly  : sampleData.overview.weekly;
  const monthlyData = hasRealData ? computed!.monthly : sampleData.overview.monthly;

  const data    = period === 'This Week' ? weeklyData  : monthlyData;
  const yValues = data.map((d) => d.orders);
  const yMax    = Math.max(...yValues, 10);
  const yRound  = yMax <= 10 ? 10 : yMax <= 50 ? 50 : yMax <= 200 ? 200 : yMax <= 1000 ? 1000 : 2000;

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '20px', py: '15px' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'black' }}>Orders Overview</Typography>
          {!hasRealData && (
            <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>Sample data — no orders this period</Typography>
          )}
        </Box>
        <Box>
          <Box
            component="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
            sx={{ bgcolor: '#EEF0FF', display: 'flex', alignItems: 'center', gap: '6px', px: '12px', py: '8px', borderRadius: '25px', width: 130, border: 'none', cursor: 'pointer', '&:hover': { bgcolor: '#E2E5F7' } }}
          >
            <Typography sx={{ fontWeight: 500, color: '#36437C', fontSize: 12, flex: 1, textAlign: 'left' }}>{period}</Typography>
            <ChevronDownIcon sx={{ fontSize: 14, color: '#36437C' }} />
          </Box>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: '12px', mt: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 130 } }}>
            {(['This Week', 'This Month'] as Period[]).map((p) => (
              <MenuItem key={p} onClick={() => { setPeriod(p); setAnchorEl(null); }}
                sx={{ fontSize: 12, fontWeight: period === p ? 600 : 500, color: period === p ? '#F36BF9' : '#36437C', '&:hover': { bgcolor: '#EEF0FF' } }}>
                {p}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box sx={{ px: '10px', pb: '15px' }}>
        <ResponsiveContainer width="99%" height={200} debounce={50}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8979FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8979FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="#00001A" strokeOpacity={0.15} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.7)', fontFamily: 'Inter, sans-serif' }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.7)', fontFamily: 'Inter, sans-serif' }}
              tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : `${v}`}
              domain={[0, yRound]} width={38} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8979FF', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="orders" stroke="#8979FF" strokeWidth={2} fill="url(#ordersGradient)"
              dot={(props: any) => {
                const { cx, cy, index } = props;
                const peak = data.reduce((mi, d, i) => d.orders > data[mi].orders ? i : mi, 0);
                const isHighlight = index === peak;
                return <circle key={`dot-${index}`} cx={cx} cy={cy} r={isHighlight ? 5 : 4} fill={isHighlight ? '#F36BF9' : 'white'} stroke="#8979FF" strokeWidth={1.5} />;
              }}
              activeDot={{ r: 6, fill: '#F36BF9', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
