'use client';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import sampleData from '@/src/data/ordersChartData.json';
import { OrderResponse, OrderStatus } from '@/src/stores/types/order';

const COLORS = ['#F36BF9', '#36437C', '#6093FC', '#F59E0B', '#22C55E', '#EF4444'];

// ─── Compute ──────────────────────────────────────────────────────────────────

interface CategoryEntry { name: string; value: number; percentage: number; color: string }
interface BreakdownEntry { name: string; current: number; total: number }
interface Breakdown { name: string; totalOrders: number; events: BreakdownEntry[] }

function computeFromOrders(orders: OrderResponse[]): { categories: CategoryEntry[]; breakdown: Breakdown | null } {
  if (!orders.length) return { categories: [], breakdown: null };

  // Group by category name
  const catMap: Record<string, number> = {};
  for (const order of orders) {
    const cat = order.eventSnapshot?.categoryName ?? 'Others';
    catMap[cat] = (catMap[cat] ?? 0) + 1;
  }

  const total = orders.length;
  const categories: CategoryEntry[] = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({
      name,
      value,
      percentage: (value / total) * 100,
      color: COLORS[i % COLORS.length],
    }));

  // Top category breakdown by event
  const top = categories[0];
  if (!top) return { categories, breakdown: null };

  const topOrders = orders.filter((o) => (o.eventSnapshot?.categoryName ?? 'Others') === top.name);

  const evMap: Record<string, { confirmed: number; total: number }> = {};
  for (const order of topOrders) {
    const title = order.eventSnapshot?.title ?? 'Unknown Event';
    if (!evMap[title]) evMap[title] = { confirmed: 0, total: 0 };
    evMap[title].total++;
    if (order.status === OrderStatus.CONFIRMED) evMap[title].confirmed++;
  }

  const events: BreakdownEntry[] = Object.entries(evMap)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
    .map(([name, { confirmed, total }]) => ({ name, current: confirmed, total }));

  return { categories, breakdown: { name: top.name, totalOrders: top.value, events } };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <Box sx={{ position: 'relative', height: '5px', width: '100%', borderRadius: '999px', bgcolor: '#DDD8D8', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: '0 auto 0 0', bgcolor: '#36437C', borderRadius: '999px', width: `${pct}%` }} />
    </Box>
  );
}

function CategoryBar({ name, percentage, value, color }: CategoryEntry) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'black' }}>{name}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 400, color: '#DDD8D8' }}>({percentage.toFixed(2)}%)</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
        <Box sx={{ position: 'relative', height: '10px', flex: 1, borderRadius: '999px', bgcolor: '#F7F7F7', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: '0 auto 0 0', borderRadius: '999px', bgcolor: color, width: `${Math.min(percentage * (100 / 35), 100)}%` }} />
        </Box>
        <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.7)', flexShrink: 0 }}>{value.toLocaleString()}</Typography>
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { orders?: OrderResponse[] }

export function OrdersCategoryChart({ orders }: Props) {
  const { categories, breakdown } = useMemo(() => {
    if (!orders?.length) return { categories: [], breakdown: null };
    return computeFromOrders(orders);
  }, [orders]);

  const hasRealData = categories.length > 0;

  // Fall back to sample data
  const displayCategories: CategoryEntry[] = hasRealData
    ? categories
    : (sampleData.category.categories as CategoryEntry[]);

  const displayBreakdown: Breakdown | null = hasRealData
    ? breakdown
    : (sampleData.category.topCategoryBreakdown as Breakdown);

  const totalOrders = displayCategories.reduce((s, c) => s + c.value, 0);

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', height: '100%', justifyContent: 'space-between' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '20px', py: '15px' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'black' }}>Orders Category</Typography>
          {!hasRealData && (
            <Typography sx={{ fontSize: 10, color: '#ADACAE' }}>Sample data</Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: '#EEF0FF', display: 'flex', alignItems: 'center', gap: '6px', px: '12px', py: '8px', borderRadius: '25px', width: 130 }}>
          <Typography sx={{ fontWeight: 500, color: '#36437C', fontSize: 12, flex: 1 }}>All Time</Typography>
        </Box>
      </Box>

      {/* Pie + Bars */}
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', px: '10px', pb: '10px' }}>
        <Box sx={{ position: 'relative', flexShrink: 0, width: 180, height: 180 }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={displayCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                {displayCategories.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <Typography sx={{ fontWeight: 500, color: '#ADACAE', fontSize: 10 }}>Total Orders</Typography>
            <Typography sx={{ fontWeight: 600, color: 'rgba(54,67,124,0.9)', fontSize: 18 }}>
              {totalOrders.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: 0 }}>
          {displayCategories.slice(0, 4).map((cat) => (
            <CategoryBar key={cat.name} {...cat} />
          ))}
        </Box>
      </Box>

      {/* Top category breakdown */}
      {displayBreakdown && (
        <Box sx={{ p: '20px' }}>
          <Box sx={{ bgcolor: '#F7F7F7', display: 'flex', flexDirection: 'column', gap: '10px', p: '10px', borderRadius: '10px' }}>
            <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 600, fontSize: 12, color: 'black' }}>{displayBreakdown.name}</Typography>
              <Typography sx={{ fontWeight: 500, color: '#ADADAD', fontSize: 10 }}>
                ({displayBreakdown.totalOrders.toLocaleString()} Orders)
              </Typography>
            </Box>
            {displayBreakdown.events.map((ev) => (
              <Box key={ev.name} sx={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ fontWeight: 500, color: '#7D7D7D', fontSize: 10, width: 160, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <MiniProgressBar current={ev.current} total={ev.total} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)', fontSize: 10 }}>{ev.current.toLocaleString()}</Typography>
                    <Typography sx={{ fontWeight: 600, color: 'black', fontSize: 10 }}>/</Typography>
                    <Typography sx={{ fontWeight: 500, color: '#ADADAD', fontSize: 10 }}>{ev.total.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
