'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Dialog, DialogContent, DialogActions,
  TextField, Chip, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  AccessTime as ClockIcon,
  TrendingUp as TrendIcon,
  Info as InfoIcon,
  CheckCircleOutline as SelectedIcon,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  useGetPriceAnalysisQuery,
  useGetEventSaleWindowQuery,
  useCreateSaleWindowMutation,
  useCancelSaleWindowMutation,
} from '@/src/stores/services/FlexPassApi';
import {
  FlexPassPricingMethod,
  FlexPassSaleWindowStatus,
  FlexPassPriceAnalysisItem,
} from '@/src/stores/types/flexpass';
import { BRAND } from '@/src/utils/constants/constant';

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v.toLocaleString('vi-VN') + ' ₫';
}

function fromDatetimeLocal(s: string): string {
  return s + ':00';
}

const WINDOW_STATUS_CFG: Record<FlexPassSaleWindowStatus, { label: string; color: string; bg: string; border: string }> = {
  [FlexPassSaleWindowStatus.SCHEDULED]: { label: 'Scheduled', color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
  [FlexPassSaleWindowStatus.OPENED]:    { label: 'Active',    color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7' },
  [FlexPassSaleWindowStatus.CLOSED]:    { label: 'Closed',    color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
  [FlexPassSaleWindowStatus.CANCELLED]: { label: 'Cancelled', color: '#717182', bg: '#f7f7f7', border: '#e5e7eb' },
};

const METHOD_CFG = {
  [FlexPassPricingMethod.MEAN]: {
    label: 'Mean',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    desc: 'Arithmetic average of all submitted prices. Sensitive to extreme outliers.',
  },
  [FlexPassPricingMethod.MEDIAN]: {
    label: 'Median',
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    desc: 'Middle value of sorted prices. Resistant to very high or low listings.',
  },
  [FlexPassPricingMethod.TRIMMED_MEAN]: {
    label: 'Trimmed Mean',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    desc: 'Removes top/bottom 10% then averages the rest. Best overall accuracy.',
    recommended: true,
  },
} as const;

// ─── Custom chart tooltip ──────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { value: number; label: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', px: 1.5, py: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      <Typography sx={{ fontSize: 11, color: '#64748B', mb: '2px' }}>{payload[0].payload.label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{fmt(payload[0].payload.value)}</Typography>
    </Box>
  );
}

// ─── Price chart for one ticket type ─────────────────────────────────────────

function TicketPriceChart({
  item,
  selected,
  onSelect,
}: {
  item: FlexPassPriceAnalysisItem;
  selected: FlexPassPricingMethod;
  onSelect: (m: FlexPassPricingMethod) => void;
}) {
  const bars = [
    { key: FlexPassPricingMethod.MEAN,         label: 'Mean',         value: item.mean },
    { key: FlexPassPricingMethod.MEDIAN,       label: 'Median',       value: item.median },
    { key: FlexPassPricingMethod.TRIMMED_MEAN, label: 'Trimmed Mean', value: item.trimmedMean },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (data: any) => {
    const key = data?.activePayload?.[0]?.payload?.key as FlexPassPricingMethod | undefined;
    if (key) onSelect(key);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{item.ticketTypeName}</Typography>
        <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{item.sampleCount} listing{item.sampleCount !== 1 ? 's' : ''} analyzed</Typography>
      </Box>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={bars}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => {
              if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
              if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
              return String(v);
            }}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {bars.map((b) => {
              const cfg = METHOD_CFG[b.key];
              const isSelected = selected === b.key;
              return (
                <Cell
                  key={b.key}
                  fill={cfg.color}
                  opacity={isSelected ? 1 : 0.28}
                  stroke={isSelected ? cfg.color : 'transparent'}
                  strokeWidth={2}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ─── Vertical method cards (right panel) ─────────────────────────────────────

function MethodCards({
  selected,
  onSelect,
  prices,
}: {
  selected: FlexPassPricingMethod;
  onSelect: (m: FlexPassPricingMethod) => void;
  prices?: Record<FlexPassPricingMethod, number>;
}) {
  const methods = [
    FlexPassPricingMethod.MEAN,
    FlexPassPricingMethod.MEDIAN,
    FlexPassPricingMethod.TRIMMED_MEAN,
  ] as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      {methods.map((m) => {
        const cfg = METHOD_CFG[m];
        const isSelected = selected === m;
        const price = prices?.[m];

        return (
          <Box
            key={m}
            onClick={() => onSelect(m)}
            sx={{
              flex: 1,
              p: '12px 14px',
              borderRadius: '12px',
              border: `2px solid ${isSelected ? cfg.color : '#E2E8F0'}`,
              bgcolor: isSelected ? cfg.bg : '#FAFAFA',
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              '&:hover': { borderColor: cfg.color, bgcolor: cfg.bg },
            }}
          >
            {/* Color dot */}
            <Box sx={{
              width: 10, height: 10, borderRadius: '50%',
              bgcolor: cfg.color, flexShrink: 0,
              boxShadow: isSelected ? `0 0 0 3px ${cfg.border}` : 'none',
              transition: 'box-shadow 0.15s',
            }} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: '2px' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: isSelected ? cfg.color : '#374151' }}>
                  {cfg.label}
                </Typography>
                {'recommended' in cfg && cfg.recommended && (
                  <Chip
                    label="Recommended"
                    size="small"
                    sx={{ fontSize: 9, fontWeight: 800, height: 15, bgcolor: 'rgba(139,92,246,0.12)', color: '#7C3AED', border: 'none' }}
                  />
                )}
              </Box>
              {price !== undefined && (
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: cfg.color, lineHeight: 1.2, mb: '2px' }}>
                  {fmt(price)}
                </Typography>
              )}
              <Typography sx={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                {cfg.desc}
              </Typography>
            </Box>

            {isSelected && (
              <SelectedIcon sx={{ fontSize: 16, color: cfg.color, flexShrink: 0 }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── CreateSaleWindowDialog ────────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

function CreateSaleWindowDialog({ open, eventId, eventTitle, onClose }: CreateDialogProps) {
  const [methodsByTicket, setMethodsByTicket] = useState<Record<number, FlexPassPricingMethod>>({});
  const [activeTicketTypeId, setActiveTicketTypeId] = useState<number | null>(null);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [err, setErr] = useState('');

  const { data: analysisData, isLoading: analysisLoading } = useGetPriceAnalysisQuery(eventId, { skip: !open });
  const [createWindow, { isLoading: creating }] = useCreateSaleWindowMutation();

  const analysis = analysisData?.data;
  const hasData = (analysis?.items.length ?? 0) > 0;

  // Initialise per-ticket methods once analysis loads
  useEffect(() => {
    if (!analysis || !hasData) return;
    const ids = analysis.items.map(i => i.ticketTypeId);
    setMethodsByTicket(prev => {
      const next = { ...prev };
      ids.forEach(id => { if (!(id in next)) next[id] = FlexPassPricingMethod.TRIMMED_MEAN; });
      return next;
    });
    setActiveTicketTypeId(prev => prev ?? ids[0]);
  }, [analysis, hasData]);

  const activeItem = analysis?.items.find(i => i.ticketTypeId === activeTicketTypeId) ?? analysis?.items[0] ?? null;

  const activeMethod = activeTicketTypeId !== null
    ? (methodsByTicket[activeTicketTypeId] ?? FlexPassPricingMethod.TRIMMED_MEAN)
    : FlexPassPricingMethod.TRIMMED_MEAN;

  const activePricesMap = activeItem
    ? {
        [FlexPassPricingMethod.MEAN]:         activeItem.mean,
        [FlexPassPricingMethod.MEDIAN]:       activeItem.median,
        [FlexPassPricingMethod.TRIMMED_MEAN]: activeItem.trimmedMean,
      }
    : undefined;

  const handleSelectMethod = (ticketTypeId: number, m: FlexPassPricingMethod) => {
    setMethodsByTicket(prev => ({ ...prev, [ticketTypeId]: m }));
    setActiveTicketTypeId(ticketTypeId);
  };

  const validate = (): string => {
    if (!startAt) return 'Please set a sale start time.';
    if (!endAt)   return 'Please set a sale end time.';
    if (new Date(startAt) <= new Date()) return 'Sale start must be in the future.';
    if (new Date(endAt) <= new Date(startAt)) return 'Sale end must be after sale start.';
    return '';
  };

  const handleCreate = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr('');
    try {
      await createWindow({
        eventId,
        pricingMethodByTicketTypeId: methodsByTicket,
        startAt: fromDatetimeLocal(startAt),
        endAt:   fromDatetimeLocal(endAt),
      }).unwrap();
      onClose();
    } catch (ex: unknown) {
      const msg = (ex as { data?: { message?: string } })?.data?.message ?? 'Failed to create sale window.';
      setErr(msg);
    }
  };

  const handleClose = () => { setErr(''); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: '18px', overflow: 'hidden' } }}>

      {/* Header */}
      <Box sx={{
        px: 3, pt: 2.5, pb: 2,
        borderBottom: '1px solid #F1F5F9',
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScheduleIcon sx={{ fontSize: 17, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Schedule Sale Window
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#64748B' }}>
              {eventTitle}
            </Typography>
          </Box>
        </Box>
        {hasData && (
          <Chip
            label="Select a ticket type to configure its pricing method"
            size="small"
            sx={{ fontSize: 10, color: '#7C3AED', bgcolor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px' }}
          />
        )}
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* ── Top 2-column zone ─────────────────────────── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 300px' },
          gap: 0,
          borderBottom: '1px solid #F1F5F9',
        }}>
          {/* Left: Price Analysis */}
          <Box sx={{ p: 3, borderRight: { md: '1px solid #F1F5F9' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Price Analysis</Typography>
              {analysisLoading && <CircularProgress size={12} sx={{ color: BRAND.primary }} />}
            </Box>

            {!analysisLoading && !hasData && (
              <Box sx={{
                p: 3, bgcolor: '#F8FAFC', borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 1, textAlign: 'center',
              }}>
                <InfoIcon sx={{ fontSize: 24, color: '#CBD5E1' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                  No approved listings yet
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#94A3B8', maxWidth: 280 }}>
                  Prices will be calculated at window open time. You can still schedule the window now.
                </Typography>
              </Box>
            )}

            {hasData && analysis && (
              <>
                {/* Ticket type selector */}
                {analysis.items.length > 1 && (
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: 12 }}>Ticket Type</InputLabel>
                    <Select
                      value={activeTicketTypeId ?? ''}
                      label="Ticket Type"
                      onChange={(e) => setActiveTicketTypeId(Number(e.target.value))}
                      sx={{ fontSize: 13, borderRadius: '8px' }}
                    >
                      {analysis.items.map((item) => {
                        const m = methodsByTicket[item.ticketTypeId] ?? FlexPassPricingMethod.TRIMMED_MEAN;
                        const mCfg = METHOD_CFG[m];
                        return (
                          <MenuItem key={item.ticketTypeId} value={item.ticketTypeId}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                              <Typography sx={{ fontSize: 13 }}>{item.ticketTypeName}</Typography>
                              <Chip
                                label={mCfg.label}
                                size="small"
                                sx={{ fontSize: 9, height: 16, fontWeight: 700, bgcolor: mCfg.bg, color: mCfg.color, border: `1px solid ${mCfg.border}` }}
                              />
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}

                {/* Single chart for active ticket */}
                {activeItem && (
                  <Box sx={{ bgcolor: '#FAFAFA', borderRadius: '12px', border: '1px solid #F1F5F9', p: '16px 16px 8px' }}>
                    <TicketPriceChart
                      item={activeItem}
                      selected={activeMethod}
                      onSelect={(m) => activeTicketTypeId !== null && handleSelectMethod(activeTicketTypeId, m)}
                    />
                  </Box>
                )}

                {/* Per-ticket method summary (shown when multiple ticket types) */}
                {analysis.items.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysis.items.map((item) => {
                      const m = methodsByTicket[item.ticketTypeId] ?? FlexPassPricingMethod.TRIMMED_MEAN;
                      const mCfg = METHOD_CFG[m];
                      const isActive = item.ticketTypeId === activeTicketTypeId;
                      return (
                        <Box
                          key={item.ticketTypeId}
                          onClick={() => setActiveTicketTypeId(item.ticketTypeId)}
                          sx={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            px: '10px', py: '4px', borderRadius: '20px', cursor: 'pointer',
                            border: `1px solid ${isActive ? '#8B5CF6' : '#E2E8F0'}`,
                            bgcolor: isActive ? 'rgba(139,92,246,0.06)' : '#FAFAFA',
                            transition: 'all 0.12s',
                            '&:hover': { borderColor: '#C4B5FD' },
                          }}
                        >
                          <Typography sx={{ fontSize: 11, color: '#374151' }}>{item.ticketTypeName}</Typography>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: mCfg.color, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 10, fontWeight: 700, color: mCfg.color }}>{mCfg.label}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Right: Pricing Method for active ticket */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Pricing Method
              </Typography>
              {activeItem && (
                <Typography sx={{ fontSize: 11, color: '#7C3AED', fontWeight: 600, mt: '2px' }}>
                  {activeItem.ticketTypeName}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <MethodCards
                selected={activeMethod}
                onSelect={(m) => activeTicketTypeId !== null && handleSelectMethod(activeTicketTypeId, m)}
                prices={activePricesMap}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Bottom zone: dates + info ─────────────────── */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A', mb: 1.25 }}>
              Sale Window Period
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Sale Start"
                type="datetime-local"
                size="small"
                value={startAt}
                onChange={(e) => { setStartAt(e.target.value); setErr(''); }}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
              />
              <TextField
                label="Sale End"
                type="datetime-local"
                size="small"
                value={endAt}
                onChange={(e) => { setEndAt(e.target.value); setErr(''); }}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
              />
            </Box>
          </Box>

          {err && <Alert severity="error" sx={{ borderRadius: '8px', fontSize: 13, py: 0.5 }}>{err}</Alert>}

          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 15, color: '#94A3B8', flexShrink: 0, mt: '1px' }} />
            <Typography sx={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
              Prices lock once at window creation and are <strong>never recalculated</strong>. Approved listings will be locked to the chosen price when the window opens.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        justifyContent: 'space-between', px: 3, pb: 2.5, pt: 0,
        borderTop: '1px solid #F1F5F9',
      }}>
        <Button onClick={handleClose} variant="text" sx={{ color: '#64748B', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={creating}
          startIcon={!creating && <ScheduleIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: 'none', borderRadius: '9px', minWidth: 160,
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            boxShadow: '0 3px 10px rgba(124,58,237,0.3)',
            fontWeight: 700, fontSize: 13,
            '&:hover': { background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' },
          }}
        >
          {creating ? <CircularProgress size={16} color="inherit" /> : 'Schedule Window'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Single window card ───────────────────────────────────────────────────────

function SaleWindowCard({
  saleWindow,
  eventId,
  onCancelled,
}: {
  saleWindow: import('@/src/stores/types/flexpass').FlexPassSaleWindowResponse;
  eventId: string;
  onCancelled: () => void;
}) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelWindow] = useCancelSaleWindowMutation();

  const cfg = WINDOW_STATUS_CFG[saleWindow.status];
  const isActive = saleWindow.status === FlexPassSaleWindowStatus.OPENED;
  const isDimmed = saleWindow.status === FlexPassSaleWindowStatus.CLOSED || saleWindow.status === FlexPassSaleWindowStatus.CANCELLED;
  const canCancel = saleWindow.status === FlexPassSaleWindowStatus.SCHEDULED;

  const fmtDt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelWindow({ saleWindowId: saleWindow.id, eventId }).unwrap();
      onCancelled();
    } catch { /* snackbar handled by RTK */ }
    finally { setCancelLoading(false); }
  };

  const methodLabel = (() => {
    const methods = saleWindow.prices.map(p => p.pricingMethod).filter(Boolean);
    const unique = [...new Set(methods)];
    if (methods.length === 0) return METHOD_CFG[saleWindow.pricingMethod].label;
    return unique.length === 1 ? METHOD_CFG[unique[0]].label : 'Mixed';
  })();

  return (
    <Box sx={{
      mb: '10px', borderRadius: '10px', overflow: 'hidden',
      border: `1px solid ${cfg.border}`,
      bgcolor: isDimmed ? '#FAFAFA' : cfg.bg,
      opacity: isDimmed ? 0.72 : 1,
    }}>
      <Box sx={{
        px: '14px', py: '10px',
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        borderBottom: saleWindow.prices.length > 0 ? `1px solid ${cfg.border}` : 'none',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color, boxShadow: isActive ? `0 0 0 3px ${cfg.border}` : 'none' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
        </Box>
        <Box sx={{ width: 1, height: 14, bgcolor: cfg.border, flexShrink: 0 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <TrendIcon sx={{ fontSize: 12, color: '#7C3AED' }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#7C3AED' }}>{methodLabel}</Typography>
        </Box>
        <Box sx={{ width: 1, height: 14, bgcolor: cfg.border, flexShrink: 0 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 160 }}>
          <ClockIcon sx={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDt(saleWindow.startAt)}</Typography>
          <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>→</Typography>
          <Typography sx={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDt(saleWindow.endAt)}</Typography>
        </Box>
        {canCancel && (
          <Button
            size="small" variant="text"
            startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
            disabled={cancelLoading} onClick={handleCancel}
            sx={{
              ml: 'auto', flexShrink: 0,
              textTransform: 'none', fontSize: 11, fontWeight: 600,
              color: '#EF4444', borderRadius: '7px', px: '10px', py: '4px',
              '&:hover': { bgcolor: '#FEF2F2' },
            }}
          >
            {cancelLoading ? 'Cancelling…' : 'Cancel'}
          </Button>
        )}
      </Box>
      {saleWindow.prices.length > 0 && (
        <Box sx={{ px: '14px', py: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mr: '2px', flexShrink: 0 }}>
            Locked
          </Typography>
          {saleWindow.prices.map((p) => {
            const mCfg = p.pricingMethod ? METHOD_CFG[p.pricingMethod] : null;
            return (
              <Box key={p.ticketTypeId} sx={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                px: '10px', py: '3px', borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.7)', border: `1px solid ${cfg.border}`,
              }}>
                <Typography sx={{ fontSize: 11, color: '#374151' }}>{p.ticketTypeName}</Typography>
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>·</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: isActive ? '#7C3AED' : '#374151' }}>{fmt(p.selectedPrice)}</Typography>
                {mCfg && <Typography sx={{ fontSize: 10, color: mCfg.color, fontWeight: 600 }}>{mCfg.label}</Typography>}
                {isActive && <CheckIcon sx={{ fontSize: 11, color: '#10B981' }} />}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// ─── SaleWindowPanel ──────────────────────────────────────────────────────────

interface SaleWindowPanelProps {
  eventId: string;
  eventTitle: string;
  approvedCount: number;
}

export function SaleWindowPanel({ eventId, eventTitle, approvedCount }: SaleWindowPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: windowData, isLoading } = useGetEventSaleWindowQuery(eventId);
  const saleWindows = windowData?.data ?? [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
        <CircularProgress size={14} sx={{ color: BRAND.primary }} />
        <Typography sx={{ fontSize: 12, color: '#717182' }}>Loading sale windows…</Typography>
      </Box>
    );
  }

  return (
    <>
      {saleWindows.length === 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '12px',
          px: '16px', py: '12px', mb: '10px',
          bgcolor: '#FAFAFA', borderRadius: '10px',
          border: '1px dashed #E2E8F0',
        }}>
          <ScheduleIcon sx={{ fontSize: 16, color: '#CBD5E1', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
              No sale window scheduled
            </Typography>
            {approvedCount > 0 && (
              <Typography sx={{ fontSize: 11, color: '#10B981', mt: '1px' }}>
                {approvedCount} listing{approvedCount !== 1 ? 's' : ''} approved and ready to lock
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {saleWindows.map((sw) => (
        <SaleWindowCard key={sw.id} saleWindow={sw} eventId={eventId} onCancelled={() => {}} />
      ))}

      <Button
        size="small" variant="outlined" fullWidth
        startIcon={<ScheduleIcon sx={{ fontSize: 13 }} />}
        onClick={() => setCreateOpen(true)}
        sx={{
          textTransform: 'none', borderRadius: '8px', fontSize: 12,
          fontWeight: 600, py: '7px',
          color: '#7C3AED', borderColor: 'rgba(124,58,237,0.3)',
          '&:hover': { bgcolor: 'rgba(124,58,237,0.04)', borderColor: '#7C3AED' },
        }}
      >
        + Schedule New Window
      </Button>

      <CreateSaleWindowDialog
        open={createOpen}
        eventId={eventId}
        eventTitle={eventTitle}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
