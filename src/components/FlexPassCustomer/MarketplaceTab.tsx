'use client';

import { useState, useMemo } from 'react';
import {
  Box, Typography, CircularProgress, Alert, Dialog,
  DialogContent, DialogContentText, DialogActions, Button, MenuItem,
  Select, Chip, InputBase,
} from '@mui/material';
import {
  ShoppingCart as BuyIcon,
  ConfirmationNumber as TicketIcon,
  Search as SearchIcon,
  SwapVert as SortIcon,
  CheckCircle as CheckIcon,
  CalendarToday as CalIcon,
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

interface EventGroup {
  eventId: string;
  eventTitle: string;
  eventStartAt: string;
  listings: FlexPassMarketplaceListing[];
}

type SortKey = 'default' | 'price_asc' | 'price_desc';

// ─── TicketRow ────────────────────────────────────────────────────────────────

function TicketRow({
  listing,
  onBuy,
  isLast,
}: {
  listing: FlexPassMarketplaceListing;
  onBuy: (id: number) => void;
  isLast: boolean;
}) {
  const canBuy = listing.status === FlexPassListingStatus.PRICE_LOCKED && listing.finalPrice != null;
  const isFree = canBuy && listing.finalPrice === 0;
  const price = listing.finalPrice ?? listing.submittedPrice;
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
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
            {listing.ticketTypeName}
          </Typography>
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
              onClick={() => onBuy(listing.id)}
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
              onClick={() => onBuy(listing.id)}
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

function EventSection({ group, onBuy }: { group: EventGroup; onBuy: (id: number) => void }) {
  const gradient = accentGradient(group.eventTitle);
  const availableCount = group.listings.filter(
    (l) => l.status === FlexPassListingStatus.PRICE_LOCKED && l.finalPrice != null,
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
            label={`${group.listings.length} ticket type${group.listings.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ fontSize: 11, fontWeight: 600, height: 22, bgcolor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '20px' }}
          />
        </Box>
      </Box>

      {/* Ticket rows */}
      {group.listings.map((listing, idx) => (
        <TicketRow
          key={listing.id}
          listing={listing}
          onBuy={onBuy}
          isLast={idx === group.listings.length - 1}
        />
      ))}
    </Box>
  );
}

// ─── MarketplaceTab ───────────────────────────────────────────────────────────

export function MarketplaceTab() {
  const [confirmListingId, setConfirmListingId] = useState<number | null>(null);
  const [provider, setProvider] = useState<'VNPAY' | 'MOMO'>('VNPAY');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data, isLoading, error } = useGetMarketplaceListingsQuery();
  const [checkoutListing, { isLoading: checkoutLoading }] = useCheckoutListingMutation();

  const allListings = data?.data ?? [];
  const confirmListing = allListings.find((l) => l.id === confirmListingId);

  const groups = useMemo<EventGroup[]>(() => {
    // Filter
    let filtered = allListings;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) => l.eventTitle.toLowerCase().includes(q) || l.ticketTypeName.toLowerCase().includes(q),
      );
    }

    // Group by event
    const map = new Map<string, EventGroup>();
    for (const l of filtered) {
      if (!map.has(l.eventId)) {
        map.set(l.eventId, { eventId: l.eventId, eventTitle: l.eventTitle, eventStartAt: l.eventStartAt, listings: [] });
      }
      map.get(l.eventId)!.listings.push(l);
    }

    let result = Array.from(map.values());

    // Sort listings within each group
    if (sort !== 'default') {
      const dir = sort === 'price_asc' ? 1 : -1;
      result = result.map((g) => ({
        ...g,
        listings: [...g.listings].sort(
          (a, b) => dir * ((a.finalPrice ?? a.submittedPrice) - (b.finalPrice ?? b.submittedPrice)),
        ),
      }));
      // Also sort groups by their min/max price
      result.sort((a, b) => {
        const pa = Math.min(...a.listings.map((l) => l.finalPrice ?? l.submittedPrice));
        const pb = Math.min(...b.listings.map((l) => l.finalPrice ?? l.submittedPrice));
        return dir * (pa - pb);
      });
    }

    return result;
  }, [allListings, search, sort]);

  const totalListings = groups.reduce((sum, g) => sum + g.listings.length, 0);
  const totalAvailable = allListings.filter(
    (l) => l.status === FlexPassListingStatus.PRICE_LOCKED && l.finalPrice != null,
  ).length;

  const RULE_MESSAGES: Record<string, string> = {
    FLEXPASS_SELF_PURCHASE_NOT_ALLOWED: 'You cannot purchase your own listing.',
    FLEXPASS_LISTING_NOT_AVAILABLE: 'This listing is no longer available.',
    FLEXPASS_PRICE_NOT_LOCKED: 'Price has not been locked yet. Please try again later.',
  };

  const handleBuy = async () => {
    if (!confirmListingId) return;
    setCheckoutError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await checkoutListing({ listingId: confirmListingId, provider }).unwrap() as any;
      if (result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        setConfirmListingId(null);
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
    setConfirmListingId(null);
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
    <>
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
            <EventSection key={group.eventId} group={group} onBuy={setConfirmListingId} />
          ))}
        </Box>
      )}

      <Typography sx={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', mt: '28px' }}>
        Payment held in escrow · released to seller after identity verification
      </Typography>

      {/* Buy confirm dialog */}
      <Dialog
        open={confirmListingId !== null}
        onClose={handleCloseDialog}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
      >
        {(() => {
          const isFreeTicket = confirmListing != null && (confirmListing.finalPrice ?? confirmListing.submittedPrice) === 0;
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
                <Typography sx={{ fontSize: 12, color: '#64748B', mt: '2px' }}>{confirmListing?.eventTitle}</Typography>
              </Box>

              <DialogContent sx={{ pt: 2.5 }}>
                <DialogContentText sx={{ fontSize: 13, color: '#374151', mb: isFreeTicket ? 0 : '16px' }}>
                  {isFreeTicket ? (
                    <>Claim <strong>{confirmListing?.ticketTypeName}</strong> for free? The ticket will be transferred to your account after identity verification.</>
                  ) : (
                    <>Buy <strong>{confirmListing?.ticketTypeName}</strong> for{' '}
                    <strong style={{ color: '#0C4A6E' }}>
                      {confirmListing ? formatCurrency(confirmListing.finalPrice ?? confirmListing.submittedPrice) : ''}
                    </strong>?</>
                  )}
                </DialogContentText>

                {!isFreeTicket && (
                  <Select
                    fullWidth value={provider}
                    onChange={(e) => setProvider(e.target.value as 'VNPAY' | 'MOMO')}
                    size="small" sx={{ fontSize: 13, borderRadius: '8px', mt: '16px' }}
                  >
                    <MenuItem value="VNPAY" sx={{ fontSize: 13 }}>VNPay</MenuItem>
                    <MenuItem value="MOMO" sx={{ fontSize: 13 }}>MoMo</MenuItem>
                  </Select>
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
                  startIcon={isFreeTicket ? <CheckIcon sx={{ fontSize: 15 }} /> : undefined}
                  sx={{
                    textTransform: 'none', borderRadius: '9px', minWidth: 120, fontWeight: 700,
                    ...(isFreeTicket
                      ? { bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' }, boxShadow: '0 3px 10px rgba(22,163,74,0.25)' }
                      : { background: 'linear-gradient(135deg, #0EA5E9, #0369A1)', boxShadow: '0 3px 10px rgba(3,105,161,0.25)', '&:hover': { background: 'linear-gradient(135deg, #38BDF8, #0284C7)' } }
                    ),
                  }}
                >
                  {checkoutLoading ? 'Processing…' : isFreeTicket ? 'Claim Ticket' : 'Pay Now'}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </>
  );
}
