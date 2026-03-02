'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import chartData from '@/src/data/ordersChartData.json';

const categories    = chartData.category.categories;
const breakdown     = chartData.category.topCategoryBreakdown;
const subCategories = breakdown.events;
const totalOrders   = categories.reduce((s, c) => s + c.value, 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <Box sx={{ position: 'relative', height: '5px', width: '100%', borderRadius: '999px', bgcolor: '#DDD8D8', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '0 auto 0 0',
          bgcolor: '#36437C',
          borderRadius: '999px',
          width: `${pct}%`,
        }}
      />
    </Box>
  );
}

function CategoryBar({ name, percentage, value, color }: typeof categories[0]) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: '5px', alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: 'black' }}>{name}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 400, color: '#DDD8D8' }}>({percentage.toFixed(2)}%)</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            height: '10px',
            flex: 1,
            borderRadius: '999px',
            bgcolor: '#F7F7F7',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: '0 auto 0 0',
              borderRadius: '999px',
              bgcolor: color,
              width: `${(percentage / 30) * 100}%`,
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 10, fontWeight: 600, color: 'rgba(0,0,0,0.7)', flexShrink: 0 }}>
          {value.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersCategoryChart() {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '25px', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', height: '100%', justifyContent: 'space-between' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '20px', py: '15px' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'black' }}>
          Orders Category
        </Typography>
        <Box
          sx={{
            bgcolor: '#EEF0FF',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            px: '12px',
            py: '8px',
            borderRadius: '25px',
            width: 130,
          }}
        >
          <Typography sx={{ fontWeight: 500, color: '#36437C', fontSize: 12, flex: 1 }}>This Week</Typography>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M9.29375 13.7063C9.68437 14.0969 10.3188 14.0969 10.7094 13.7063L15.7094 8.70625C16.1 8.31563 16.1 7.68125 15.7094 7.29063C15.3188 6.9 14.6844 6.9 14.2937 7.29063L10 11.5844L5.70625 7.29375C5.31563 6.90312 4.68125 6.90312 4.29063 7.29375C3.9 7.68437 3.9 8.31875 4.29063 8.70938L9.29062 13.7094L9.29375 13.7063Z" fill="#36437C" />
          </svg>
        </Box>
      </Box>

      {/* Pie + Bars */}
      <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', px: '10px', pb: '10px' }}>
        {/* Donut chart */}
        <Box sx={{ position: 'relative', flexShrink: 0, width: 180, height: 180 }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {categories.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontWeight: 500, color: '#ADACAE', fontSize: 10 }}>Total Orders</Typography>
            <Typography sx={{ fontWeight: 600, color: 'rgba(54,67,124,0.9)', fontSize: 18 }}>
              {totalOrders.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Category bars */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: 0 }}>
          {categories.slice(0, 4).map((cat) => (
            <CategoryBar key={cat.name} {...cat} />
          ))}
        </Box>
      </Box>

      {/* Music subcategory breakdown */}
      <Box sx={{ p: '20px' }}>
        <Box sx={{ bgcolor: '#F7F7F7', display: 'flex', flexDirection: 'column', gap: '10px', p: '10px', borderRadius: '10px' }}>
          <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 600, fontSize: 12, color: 'black' }}>{breakdown.name}</Typography>
            <Typography sx={{ fontWeight: 500, color: '#ADADAD', fontSize: 10 }}>
              ({breakdown.totalOrders.toLocaleString()} Orders)
            </Typography>
          </Box>
          {subCategories.map((sub) => (
            <Box key={sub.name} sx={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: '#7D7D7D',
                  fontSize: 10,
                  width: 160,
                  flexShrink: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {sub.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <MiniProgressBar current={sub.current} total={sub.total} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', flexShrink: 0, fontSize: 10 }}>
                  <Typography sx={{ fontWeight: 600, color: 'rgba(0,0,0,0.7)', fontSize: 10 }}>
                    {sub.current.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: 'black', fontSize: 10 }}>/</Typography>
                  <Typography sx={{ fontWeight: 500, color: '#ADADAD', fontSize: 10 }}>
                    {sub.total.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
