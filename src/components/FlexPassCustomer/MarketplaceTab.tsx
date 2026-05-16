'use client';

import { useState, useMemo } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Dialog,
  DialogContent, DialogContentText, DialogActions, Button, MenuItem,
  Select, Chip, InputBase, IconButton,
} from '@mui/material';
import {
  ShoppingCart as BuyIcon,
  ConfirmationNumber as TicketIcon,
  Search as SearchIcon,
  SwapVert as SortIcon,
  CheckCircle as CheckIcon,
  CalendarToday as CalIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useGetMarketplaceListingsQuery, useCheckoutListingMutation } from '@/src/stores/services/FlexPassApi';
import { FlexPassListingStatus, FlexPassMarketplaceListing } from '@/src/stores/types/flexpass';
import { formatCurrency } from './types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const ACCENT_GRADIENTS = [
  ['#0EA5E9', '#0369A1'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#8B5CF6', '#7C3AED'],
  ['#EC4899', '#DB2777'],
  ['#14B8A6', '#0D9488'],
  ['#EF4444', '#DC2626'],
  ['#06B6D4', '#0891B2'],
];

function accentGradient(seed: string) {
  const [a, b] = ACCENT_GRADIENTS[seed.charCodeAt(0) % ACCENT_GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function getInitials(title: string) {
  return title.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso; }
}

function pctLabel(price: number, original: number): { text: string; positive: boolean } | null {
  if (original <= 0) return null;
  const pct = ((price - original) / original) * 100;
  if (Math.abs(pct) < 0.5) return { text: 'Face value', positive: false };
  return { text: `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`, positive: pct > 0 };
}

// ─── types ────────────────────────────────────────────────────────────────────

interface TicketGroup {
  ticketTypeName: string;
  price: number;
  originalPrice: number;
  status: FlexPassListingStatus;
  finalPrice: number | null;
  count: number;
  representativeId: number;
  allIds: number[];
  perUserLimit: number | null;
}

interface EventGroup {
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  ticketGroups: TicketGroup[];
}

type SortKey = 'default' | 'price_asc' | 'price_desc';

// ─── TicketRow ────────────────────────────────────────────────────────────────

function TicketRow({
  group: listing,
  onBuy,
  isLast,
}: {
  group: TicketGroup;
  onBuy: (group: TicketGroup) => void;
  isLast: boolean;
}) {
  const canBuy = listing.status === FlexPassListingStatus.PRICE_LOCKED && listing.finalPrice != null;
  const isFree = canBuy && listing.finalPrice === 0;
  const price = listing.finalPrice ?? listing.price;
  const pct = pctLabel(price, listing.originalPrice);

  return (
    <Box sx={{
      px: { xs: 2, sm: 3 }, py: '14px',
      display: 'flex', alignItems: 'center', gap: { xs: '10px', sm: '16px' }, flexWrap: { xs: 'wrap', sm: 'nowrap' },
      borderBottom: isLast ? 'none' : '1px solid #F8FAFC',
      transition: 'background 0.15s',
      '&:hover': { bgcolor: '#F8FAFC' },
    }}>
      {/* Ticket icon + type */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 140 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
          bgcolor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TicketIcon sx={{ fontSize: 16, color: '#0369A1' }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
              {listing.ticketTypeName}
            </Typography>
            {listing.count > 1 && (
              <Chip label={`×${listing.count}`} size="small" sx={{ height: 16, fontSize: 10, fontWeight: 700, bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '20px' }} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '2px' }}>
            <CheckIcon sx={{ fontSize: 11, color: '#0EA5E9' }} />
            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Organizer verified</Typography>
          </Box>
        </Box>
      </Box>

      {/* Status badge */}
      {canBuy ? (
        <Chip
          label={isFree ? 'Free' : 'Available'}
          size="small"
          sx={{
            fontSize: 10, fontWeight: 700, height: 20, flexShrink: 0,
            bgcolor: isFree ? '#F0FDF4' : '#DCFCE7',
            color: isFree ? '#15803D' : '#15803D',
            border: `1px solid ${isFree ? '#86EFAC' : '#86EFAC'}`,
            borderRadius: '20px',
          }}
        />
      ) : (
        <Chip
          label="Opening soon"
          size="small"
          sx={{
            fontSize: 10, fontWeight: 600, height: 20, flexShrink: 0,
            bgcolor: '#FEF9C3', color: '#92400E', border: '1px solid #FDE68A', borderRadius: '20px',
          }}
        />
      )}

      {/* Price block */}
      <Box sx={{ textAlign: 'right', flexShrink: 0, minWidth: { xs: 80, sm: 110 } }}>
        {isFree ? (
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>
            Free
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0C4A6E', lineHeight: 1.1 }}>
              {formatCurrency(price)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', mt: '3px' }}>
              {listing.originalPrice > 0 && price !== listing.originalPrice && (
                <Typography sx={{ fontSize: 11, color: '#CBD5E1', textDecoration: 'line-through' }}>
                  {formatCurrency(listing.originalPrice)}
                </Typography>
              )}
              {pct && (
                <Chip
                  label={pct.text}
                  size="small"
                  sx={{
                    fontSize: 9, fontWeight: 700, height: 16, border: 'none', borderRadius: '20px',
                    bgcolor: pct.positive ? '#DCFCE7' : '#F1F5F9',
                    color: pct.positive ? '#15803D' : '#64748B',
                  }}
                />
              )}
            </Box>
          </>
        )}
      </Box>

      {/* Action */}
      <Box sx={{ flexShrink: 0, minWidth: { xs: '100%', sm: 110 }, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
        {canBuy ? (
          isFree ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
              onClick={() => onBuy(listing)}
              sx={{
                textTransform: 'none', fontWeight: 700, fontSize: 12,
                borderRadius: '9px', px: '14px', py: '7px', whiteSpace: 'nowrap',
                color: '#15803D', borderColor: '#86EFAC',
                '&:hover': { bgcolor: '#F0FDF4', borderColor: '#4ADE80' },
              }}
            >
              Claim Free
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<BuyIcon sx={{ fontSize: 14 }} />}
              onClick={() => onBuy(listing)}
              sx={{
                textTransform: 'none', fontWeight: 700, fontSize: 12,
                borderRadius: '9px', px: '14px', py: '7px', whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
                boxShadow: '0 3px 8px rgba(3,105,161,0.25)',
                '&:hover': { background: 'linear-gradient(135deg, #38BDF8, #0284C7)', boxShadow: '0 4px 12px rgba(3,105,161,0.35)' },
              }}
            >
              Buy Now
            </Button>
          )
        ) : (
          <Typography sx={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>–</Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── EventSection ─────────────────────────────────────────────────────────────

function EventSection({ group, onBuy }: { group: EventGroup; onBuy: (group: TicketGroup) => void }) {
  const gradient = accentGradient(group.eventTitle);
  const availableCount = group.ticketGroups.filter(
    (g) => g.status === FlexPassListingStatus.PRICE_LOCKED && g.finalPrice != null,
  ).length;

  return (
    <Box sx={{
      bgcolor: '#fff',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 16px rgba(3,105,161,0.09)' },
    }}>
      {/* Left accent bar */}
      <Box sx={{ height: 4, background: gradient }} />

      {/* Event header */}
      <Box sx={{
        px: { xs: 2, sm: 3 }, py: '16px',
        display: 'flex', alignItems: 'center', gap: '14px',
        borderBottom: '1px solid #F1F5F9',
        bgcolor: '#FAFBFD',
      }}>
        <Box sx={{
          width: 46, height: 46, borderRadius: '12px', flexShrink: 0,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: '#fff',
          boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
        }}>
          {getInitials(group.eventTitle)}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: 14, fontWeight: 700, color: '#0F172A',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {group.eventTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '3px' }}>
            <CalIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{fmtDate(group.eventStartAt)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {availableCount > 0 && (
            <Chip
              label={`${availableCount} available`}
              size="small"
              sx={{ fontSize: 11, fontWeight: 600, height: 22, bgcolor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: '20px' }}
            />
          )}
          <Chip
            label={`${group.ticketGroups.length} ticket type${group.ticketGroups.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ fontSize: 11, fontWeight: 600, height: 22, bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '20px' }}
          />
        </Box>
      </Box>

      {/* Ticket rows */}
      {group.ticketGroups.map((tg, idx) => (
        <TicketRow
          key={`${tg.ticketTypeName}-${tg.price}`}
          group={tg}
          onBuy={onBuy}
          isLast={idx === group.ticketGroups.length - 1}
        />
      ))}
    </Box>
  );
}

// ─── MarketplaceTab ───────────────────────────────────────────────────────────

interface ConfirmTarget {
  group: TicketGroup;
  quantity: number;
}

export function MarketplaceTab() {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [provider, setProvider] = useState<'VNPAY' | 'MOMO'>('VNPAY');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data, isLoading, error } = useGetMarketplaceListingsQuery();
  const [checkoutListing, { isLoading: checkoutLoading }] = useCheckoutListingMutation();

  const allListings = data?.data ?? [];

  const groups = useMemo<EventGroup[]>(() => {
    // Filter by search
    let filtered = allListings;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) => l.eventTitle.toLowerCase().includes(q) || l.ticketTypeName.toLowerCase().includes(q),
      );
    }

    // Only show events that have at least one PRICE_LOCKED listing (sale window is open)
    const priceLockedSet = new Set(
      filtered
        .filter((l) => l.status === FlexPassListingStatus.PRICE_LOCKED && l.finalPrice != null)
        .map((l) => l.eventId),
    );
    filtered = filtered.filter((l) => priceLockedSet.has(l.eventId));

    // Group by event → then by ticketTypeName + price (merge identical type+price rows)
    const eventMap = new Map<string, { eventId: string; eventTitle: string; eventStartAt: string; byKey: Map<string, TicketGroup> }>();
    for (const l of filtered) {
      if (!eventMap.has(l.eventId)) {
        eventMap.set(l.eventId, { eventId: l.eventId, eventTitle: l.eventTitle, eventStartAt: l.eventStartAt, byKey: new Map() });
      }
      const entry = eventMap.get(l.eventId)!;
      const price = l.finalPrice ?? l.submittedPrice;
      const key = `${l.ticketTypeName}::${Math.round(price)}`;
      if (!entry.byKey.has(key)) {
        entry.byKey.set(key, {
          ticketTypeName: l.ticketTypeName,
          price,
          originalPrice: l.originalPrice,
          status: l.status,
          finalPrice: l.finalPrice,
          count: 0,
          representativeId: l.id,
          allIds: [],
          perUserLimit: l.perUserLimit ?? null,
        });
      }
      const tg = entry.byKey.get(key)!;
      tg.count++;
      tg.allIds.push(l.id);
      // Prefer PRICE_LOCKED representative
      if (l.status === FlexPassListingStatus.PRICE_LOCKED && tg.status !== FlexPassListingStatus.PRICE_LOCKED) {
        tg.status = l.status;
        tg.finalPrice = l.finalPrice;
        tg.representativeId = l.id;
      }
    }

    let result: EventGroup[] = Array.from(eventMap.values()).map((e) => ({
      eventId: e.eventId,
      eventTitle: e.eventTitle,
      eventStartAt: e.eventStartAt,
      ticketGroups: Array.from(e.byKey.values()),
    }));

    // Sort ticket groups within each event
    if (sort !== 'default') {
      const dir = sort === 'price_asc' ? 1 : -1;
      result = result.map((g) => ({
        ...g,
        ticketGroups: [...g.ticketGroups].sort((a, b) => dir * (a.price - b.price)),
      }));
      result.sort((a, b) => {
        const pa = Math.min(...a.ticketGroups.map((tg) => tg.price));
        const pb = Math.min(...b.ticketGroups.map((tg) => tg.price));
        return dir * (pa - pb);
      });
    }

    return result;
  }, [allListings, search, sort]);

  const totalListings = groups.reduce((sum, g) => sum + g.ticketGroups.reduce((s, tg) => s + tg.count, 0), 0);
  const totalAvailable = groups.reduce((sum, g) => sum + g.ticketGroups.filter((tg) => tg.status === FlexPassListingStatus.PRICE_LOCKED && tg.finalPrice != null).reduce((s, tg) => s + tg.count, 0), 0);

  const RULE_MESSAGES: Record<string, string> = {
    FLEXPASS_SELF_PURCHASE_NOT_ALLOWED: 'You cannot purchase your own listing.',
    FLEXPASS_LISTING_NOT_AVAILABLE: 'This listing is no longer available.',
    FLEXPASS_PRICE_NOT_LOCKED: 'Price has not been locked yet. Please try again later.',
  };

  const handleBuy = async () => {
    if (!confirmTarget) return;
    setCheckoutError(null);
    const { group, quantity } = confirmTarget;
    const idsToProcess = group.allIds.slice(0, quantity);
    const isFree = group.finalPrice === 0;

    try {
      if (isFree) {
        // For free tickets: claim each one sequentially
        for (const id of idsToProcess) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (checkoutListing({ listingId: id, provider }) as any).unwrap();
        }
        setConfirmTarget(null);
      } else {
        // For paid: process first listing and redirect to payment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await checkoutListing({ listingId: idsToProcess[0], provider }).unwrap() as any;
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          setConfirmTarget(null);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const ruleCode: string | undefined = err?.data?.errors?.ruleCode;
      const apiMessage: string | undefined = err?.data?.message;
      setCheckoutError(
        (ruleCode && RULE_MESSAGES[ruleCode])
          ?? apiMessage
          ?? 'Purchase failed. Please try again.',
      );
    }
  };

  const handleCloseDialog = () => {
    setConfirmTarget(null);
    setCheckoutError(null);
  };

  const handleOpenConfirm = (group: TicketGroup) => {
    setConfirmTarget({ group, quantity: 1 });
    setCheckoutError(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: '80px' }}>
        <CircularProgress size={28} sx={{ color: '#0369A1' }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ borderRadius: '10px' }}>Failed to load marketplace listings.</Alert>;
  }

  return (
    <Box sx={{ height: '100%', minHeight: 0, overflowY: 'auto', pr: '2px', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: '#CBD5E1' } }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: '10px', mb: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{
          flex: 1, minWidth: 200,
          display: 'flex', alignItems: 'center', gap: '8px',
          bgcolor: '#fff', border: '1px solid #E2E8F0',
          borderRadius: '10px', px: '12px', py: '9px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <SearchIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
          <InputBase
            placeholder="Search event or ticket type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: 13, '& input::placeholder': { color: '#94A3B8' } }}
          />
        </Box>

        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '6px',
          bgcolor: '#fff', border: '1px solid #E2E8F0',
          borderRadius: '10px', px: '12px', py: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <SortIcon sx={{ fontSize: 15, color: '#64748B' }} />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            size="small" variant="standard" disableUnderline
            sx={{ fontSize: 13, color: '#475569', minWidth: 120, '& .MuiSelect-select': { py: '5px' } }}
          >
            <MenuItem value="default" sx={{ fontSize: 13 }}>Default</MenuItem>
            <MenuItem value="price_asc" sx={{ fontSize: 13 }}>Price: Low → High</MenuItem>
            <MenuItem value="price_desc" sx={{ fontSize: 13 }}>Price: High → Low</MenuItem>
          </Select>
        </Box>

        {/* Summary chips */}
        <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Chip
            label={`${groups.length} event${groups.length !== 1 ? 's' : ''}`}
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: '20px' }}
          />
          {totalAvailable > 0 && (
            <Chip
              label={`${totalAvailable} available`}
              sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#DCFCE7', color: '#15803D', border: 'none', borderRadius: '20px' }}
            />
          )}
          <Chip
            label={`${totalListings} total listing${totalListings !== 1 ? 's' : ''}`}
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '20px' }}
          />
        </Box>
      </Box>

      {/* Empty state */}
      {groups.length === 0 && (
        <Box sx={{ textAlign: 'center', py: '80px' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, #38BDF8, #0369A1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: '16px',
            boxShadow: '0 6px 20px rgba(3,105,161,0.25)',
          }}>
            <TicketIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#0F172A', mb: '6px' }}>
            {search ? 'No results found' : 'No listings right now'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#94A3B8', maxWidth: 300, mx: 'auto' }}>
            {search ? 'Try a different search term.' : 'Check back soon — approved resale tickets will appear here.'}
          </Typography>
        </Box>
      )}

      {/* Event sections */}
      {groups.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {groups.map((group) => (
            <EventSection key={group.eventId} group={group} onBuy={handleOpenConfirm} />
          ))}
        </Box>
      )}

      <Typography sx={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', mt: '28px' }}>
        Payment held in escrow · released to seller after identity verification
      </Typography>

      {/* Buy / Claim confirm dialog */}
      <Dialog
        open={confirmTarget !== null}
        onClose={handleCloseDialog}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        {confirmTarget && (() => {
          const { group, quantity } = confirmTarget;
          const isFreeTicket = group.finalPrice === 0;
          const unitPrice = group.finalPrice ?? group.price;
          const totalPrice = unitPrice * quantity;
          const maxQty = group.perUserLimit != null
            ? Math.min(group.count, group.perUserLimit)
            : group.count;

          const setQty = (q: number) =>
            setConfirmTarget({ group, quantity: Math.min(Math.max(1, q), maxQty) });

          return (
            <>
              <Box sx={{
                px: 3, pt: 2.5, pb: 2,
                background: isFreeTicket
                  ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)'
                  : 'linear-gradient(135deg, #EFF6FF, #F0F9FF)',
                borderBottom: '1px solid #E2E8F0',
              }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  {isFreeTicket ? 'Claim Free Ticket' : 'Confirm Purchase'}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', mt: '2px' }}>{group.ticketTypeName}</Typography>
              </Box>

              <DialogContent sx={{ pt: 2.5 }}>
                <DialogContentText sx={{ fontSize: 13, color: '#374151', mb: '16px' }}>
                  {isFreeTicket
                    ? <>Claim <strong>{group.ticketTypeName}</strong> for free. Tickets will be transferred after identity verification.</>
                    : <>Buy <strong>{group.ticketTypeName}</strong> — {maxQty} available.</>
                  }
                </DialogContentText>

                {/* Quantity selector */}
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                  px: '14px', py: '10px', mb: group.perUserLimit != null ? '6px' : '16px',
                }}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Quantity</Typography>
                    <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>
                      {group.count} available{group.perUserLimit != null ? ` · max ${group.perUserLimit}/person` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconButton size="small" onClick={() => setQty(quantity - 1)} disabled={quantity <= 1}
                      sx={{ width: 28, height: 28, bgcolor: 'white', border: '1px solid #E2E8F0',
                        '&:hover': { bgcolor: '#F1F5F9' }, '&:disabled': { opacity: 0.4 } }}>
                      <RemoveIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F172A', minWidth: 28, textAlign: 'center' }}>
                      {quantity}
                    </Typography>
                    <IconButton size="small" onClick={() => setQty(quantity + 1)} disabled={quantity >= maxQty}
                      sx={{ width: 28, height: 28, bgcolor: 'white', border: '1px solid #E2E8F0',
                        '&:hover': { bgcolor: '#F1F5F9' }, '&:disabled': { opacity: 0.4 } }}>
                      <AddIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
                {group.perUserLimit != null && quantity >= maxQty && (
                  <Typography sx={{ fontSize: 11, color: '#F59E0B', mb: '14px', pl: '2px' }}>
                    Maximum {group.perUserLimit} ticket{group.perUserLimit !== 1 ? 's' : ''} per person for this ticket type.
                  </Typography>
                )}
                {group.perUserLimit != null && quantity < maxQty && (
                  <Box sx={{ mb: '14px' }} />
                )}

                {/* Price summary */}
                {!isFreeTicket && (
                  <>
                    <Box sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
                      px: '14px', py: '10px', mb: '14px',
                    }}>
                      <Typography sx={{ fontSize: 13, color: '#64748B' }}>
                        {formatCurrency(unitPrice)} × {quantity}
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0C4A6E' }}>
                        {formatCurrency(totalPrice)}
                      </Typography>
                    </Box>
                    <Select
                      fullWidth value={provider}
                      onChange={(e) => setProvider(e.target.value as 'VNPAY' | 'MOMO')}
                      size="small" sx={{ fontSize: 13, borderRadius: '8px' }}
                    >
                      <MenuItem value="VNPAY" sx={{ fontSize: 13 }}>VNPay</MenuItem>
                      <MenuItem value="MOMO" sx={{ fontSize: 13 }}>MoMo</MenuItem>
                    </Select>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', px: 1.5, py: 1, mt: 1 }}>
                      <Typography sx={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                        ⚠️ <strong>Simulation mode</strong> — MoMo &amp; VNPay payments are simulated. No real charge will occur.
                      </Typography>
                    </Box>
                  </>
                )}

                {isFreeTicket && (
                  <Box sx={{ bgcolor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', px: '14px', py: '10px' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                      Total: Free × {quantity}
                    </Typography>
                  </Box>
                )}

                {checkoutError && (
                  <Alert severity="error" sx={{ mt: '14px', borderRadius: '8px', fontSize: 13 }}>
                    {checkoutError}
                  </Alert>
                )}
              </DialogContent>

              <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2.5 }}>
                <Button onClick={handleCloseDialog} variant="text" sx={{ color: '#64748B', textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBuy}
                  variant="contained"
                  disabled={checkoutLoading}
                  startIcon={isFreeTicket ? <CheckIcon sx={{ fontSize: 15 }} /> : <BuyIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    textTransform: 'none', borderRadius: '9px', minWidth: 130, fontWeight: 700,
                    ...(isFreeTicket
                      ? { bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' }, boxShadow: '0 3px 10px rgba(22,163,74,0.25)' }
                      : { background: 'linear-gradient(135deg, #0EA5E9, #0369A1)', boxShadow: '0 3px 10px rgba(3,105,161,0.25)', '&:hover': { background: 'linear-gradient(135deg, #38BDF8, #0284C7)' } }
                    ),
                  }}
                >
                  {checkoutLoading
                    ? 'Processing…'
                    : isFreeTicket
                      ? `Claim ${quantity > 1 ? `${quantity} ` : ''}Ticket${quantity > 1 ? 's' : ''}`
                      : 'Pay Now'}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
