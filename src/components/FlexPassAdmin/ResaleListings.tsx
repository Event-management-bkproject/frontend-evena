import { useMemo, useState, useEffect } from 'react';
import { Box, Typography, InputBase, Popover } from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { BRAND } from '@/src/utils/constants/constant';
import { ResaleTicket, StatusFilter, STATUS_FILTERS } from './types';
import { ResaleCard } from './ResaleCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toIso(d: Date | null): string {
  return d ? format(d, 'yyyy-MM-dd') : '';
}

function inRange(listedAt: string, from: Date | null, to: Date | null): boolean {
  const isoFrom = toIso(from);
  const isoTo   = toIso(to);
  if (!isoFrom && !isoTo) return true;
  if (isoFrom && listedAt < isoFrom) return false;
  if (isoTo   && listedAt > isoTo)   return false;
  return true;
}

// ─── Mini date-picker trigger ─────────────────────────────────────────────────

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
}

function DatePickerField({ label, value, onChange, minDate, maxDate }: DatePickerFieldProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleSelect = (d: Date | null) => {
    onChange(d);
    setAnchor(null);
  };

  const isActive = Boolean(value);

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: 'flex', alignItems: 'center', gap: '5px',
          bgcolor: isActive ? 'rgba(243,107,249,0.08)' : BRAND.bgSection,
          border: `1px solid ${isActive ? 'rgba(243,107,249,0.35)' : 'transparent'}`,
          borderRadius: '8px', px: '10px', py: '6px', flex: 1,
          cursor: 'pointer', transition: 'all 0.15s',
          '&:hover': { borderColor: isActive ? BRAND.primary : 'rgba(0,0,0,0.15)' },
        }}
      >
        <Typography sx={{ fontSize: 11, color: '#717182', flexShrink: 0, fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 12, color: isActive ? '#030213' : '#b0b0c0', flex: 1, fontWeight: isActive ? 500 : 400 }}>
          {value ? format(value, 'dd/MM/yyyy') : ''}
        </Typography>
        <ArrowDownIcon sx={{ fontSize: 14, color: '#b0b0c0', flexShrink: 0 }} />
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: '6px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.06)',
            },
          },
        }}
      >
        {/* Popover header */}
        <Box sx={{
          px: '16px', py: '12px',
          background: `${BRAND.primary}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
            {label === 'From' ? 'Start date' : 'End date'}
          </Typography>
          {value && (
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
              {format(value, 'EEE, dd MMM yyyy')}
            </Typography>
          )}
        </Box>

        {/* Calendar */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={value}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            sx={{
              width: 320,
              px: '8px',
              '& .MuiPickersCalendarHeader-root': {
                color: '#030213',
                '& .MuiPickersArrowSwitcher-button': { color: '#717182' },
                '& .MuiPickersCalendarHeader-labelContainer': { fontWeight: 600, fontSize: 13 },
              },
              '& .MuiDayCalendar-weekDayLabel': {
                fontSize: 11, color: '#b0b0c0', fontWeight: 600,
              },
              '& .MuiPickersDay-root': {
                fontSize: 12, borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(243,107,249,0.1)' },
                '&.Mui-selected': {
                  bgcolor: BRAND.primary,
                  color: 'white',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#e55ae0' },
                  '&:focus': { bgcolor: BRAND.primary },
                },
                '&.MuiPickersDay-today': {
                  border: `1.5px solid ${BRAND.primary}`,
                  color: BRAND.primary,
                  fontWeight: 600,
                  '&.Mui-selected': { color: 'white', border: 'none' },
                },
              },
              '& .MuiYearCalendar-root': {
                '& .MuiPickersYear-yearButton': {
                  borderRadius: '8px',
                  '&.Mui-selected': { bgcolor: BRAND.primary, '&:hover': { bgcolor: '#e55ae0' } },
                },
              },
            }}
          />
        </LocalizationProvider>

        {/* Clear / footer */}
        {value && (
          <Box sx={{ px: '16px', pb: '12px', pt: '4px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Box
              component="button"
              onClick={() => { onChange(null); setAnchor(null); }}
              sx={{
                width: '100%', border: 'none', bgcolor: '#f7f7f7', borderRadius: '8px',
                py: '7px', fontSize: 12, color: '#717182', cursor: 'pointer', fontFamily: 'inherit',
                '&:hover': { bgcolor: '#efefef', color: '#030213' },
              }}
            >
              Clear date
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
}

// ─── ResaleListings ───────────────────────────────────────────────────────────

interface ResaleListingsProps {
  tickets: ResaleTicket[];
  filterStatus: StatusFilter;
  searchQuery: string;
  onFilterChange: (status: StatusFilter) => void;
  onSearchChange: (query: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ResaleListings({
  tickets,
  filterStatus,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onApprove,
  onReject,
}: ResaleListingsProps) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate,   setToDate]   = useState<Date | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const hasRange = fromDate || toDate;

  // Apply date range on top of already-filtered tickets
  const rangeFiltered = useMemo(
    () => tickets.filter((t) => inRange(t.listedAt, fromDate, toDate)),
    [tickets, fromDate, toDate],
  );

  // Group by eventId
  const groups = useMemo(() => {
    const map = new Map<string, { eventId: string; eventName: string; eventDate: string; tickets: ResaleTicket[] }>();
    for (const t of rangeFiltered) {
      if (!map.has(t.eventId)) {
        map.set(t.eventId, { eventId: t.eventId, eventName: t.eventName, eventDate: t.eventDate, tickets: [] });
      }
      map.get(t.eventId)!.tickets.push(t);
    }
    return Array.from(map.values());
  }, [rangeFiltered]);

  // Auto-select: prefer pending, else first
  useEffect(() => {
    if (!selectedEventId || !groups.find((g) => g.eventId === selectedEventId)) {
      const withPending = groups.find((g) => g.tickets.some((t) => t.status === 'pending'));
      setSelectedEventId(withPending?.eventId ?? groups[0]?.eventId ?? null);
    }
  }, [groups]);

  const selectedGroup = groups.find((g) => g.eventId === selectedEventId) ?? null;

  const clearRange = () => { setFromDate(null); setToDate(null); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '12px' }}>

      {/* ── Toolbar card (fixed) ── */}
      <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', p: '12px', flexShrink: 0 }}>

        {/* Row 1: Search + status filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', bgcolor: BRAND.bgSection, borderRadius: '8px', px: '12px', py: '8px' }}>
            <SearchIcon sx={{ fontSize: 16, color: '#717182' }} />
            <InputBase
              placeholder="Search by event or seller..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ flex: 1, fontSize: 14, color: '#030213', '& input::placeholder': { color: '#717182' } }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FilterIcon sx={{ fontSize: 16, color: '#717182' }} />
            <Box
              component="select"
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange(e.target.value as StatusFilter)}
              sx={{ bgcolor: BRAND.bgSection, borderRadius: '8px', px: '12px', py: '8px', fontSize: 14, color: '#030213', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Row 2: Date range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: '10px', pt: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <CalendarIcon sx={{ fontSize: 14, color: '#717182', flexShrink: 0 }} />

          <DatePickerField
            label="From"
            value={fromDate}
            onChange={setFromDate}
            maxDate={toDate ?? undefined}
          />

          <Typography sx={{ fontSize: 12, color: '#b0b0c0', flexShrink: 0 }}>→</Typography>

          <DatePickerField
            label="To"
            value={toDate}
            onChange={setToDate}
            minDate={fromDate ?? undefined}
          />

          {/* Clear button — only visible when range is set */}
          {hasRange && (
            <Box
              component="button"
              onClick={clearRange}
              title="Clear date range"
              sx={{
                border: 'none', bgcolor: '#f7f7f7', cursor: 'pointer', borderRadius: '6px',
                display: 'flex', alignItems: 'center', p: '5px',
                '&:hover': { bgcolor: '#efefef' },
              }}
            >
              <CloseIcon sx={{ fontSize: 14, color: '#717182' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Master-detail body ── */}
      <Box sx={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>

        {/* Left panel: event list */}
        <Box sx={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', pr: '2px' }}>
          {groups.length === 0 ? (
            <Box sx={{ bgcolor: 'white', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.07)', p: '20px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 12, color: '#717182' }}>
                {hasRange ? 'No listings in this period' : 'No events'}
              </Typography>
            </Box>
          ) : (
            groups.map((group) => {
              const pendingCount = group.tickets.filter((t) => t.status === 'pending').length;
              const isSelected = selectedEventId === group.eventId;
              return (
                <Box
                  key={group.eventId}
                  onClick={() => setSelectedEventId(group.eventId)}
                  sx={{
                    bgcolor: isSelected ? 'white' : 'rgba(255,255,255,0.5)',
                    border: `1.5px solid ${isSelected ? BRAND.primary : 'rgba(0,0,0,0.07)'}`,
                    borderRadius: '10px', p: '11px', cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'white', borderColor: isSelected ? BRAND.primary : 'rgba(0,0,0,0.18)' },
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#030213', mb: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.eventName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '7px' }}>
                    <CalendarIcon sx={{ fontSize: 10, color: '#717182' }} />
                    <Typography sx={{ fontSize: 10, color: '#717182' }}>{group.eventDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <Box sx={{ fontSize: 10, fontWeight: 500, px: '7px', py: '2px', borderRadius: '20px', bgcolor: '#f7f7f7', color: '#717182', border: '1px solid rgba(0,0,0,0.07)' }}>
                      {group.tickets.length} listing{group.tickets.length !== 1 ? 's' : ''}
                    </Box>
                    {pendingCount > 0 && (
                      <Box sx={{ fontSize: 10, fontWeight: 600, px: '7px', py: '2px', borderRadius: '20px', bgcolor: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' }}>
                        {pendingCount} pending
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {/* Right panel: selected event tickets */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!selectedGroup ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
              <Typography sx={{ fontSize: 14, color: '#717182' }}>No listings found</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', px: '2px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030213', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedGroup.eventName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <CalendarIcon sx={{ fontSize: 11, color: '#717182' }} />
                  <Typography sx={{ fontSize: 11, color: '#717182' }}>{selectedGroup.eventDate}</Typography>
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', ml: 'auto', flexShrink: 0 }}>
                  {selectedGroup.tickets.length} listing{selectedGroup.tickets.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: '2px' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', pb: '4px' }}>
                  {selectedGroup.tickets.map((ticket) => (
                    <ResaleCard key={ticket.id} ticket={ticket} onApprove={onApprove} onReject={onReject} />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>

      </Box>
    </Box>
  );
}
