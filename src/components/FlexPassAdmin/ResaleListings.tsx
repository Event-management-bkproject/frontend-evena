import { Box, Typography, InputBase } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { BRAND } from '@/src/utils/constants/constant';
import { ResaleTicket, StatusFilter, STATUS_FILTERS } from './types';
import { ResaleCard } from './ResaleCard';

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
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '12px' }}>
      {/* Search + filter bar — fixed */}
      <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', p: '12px', flexShrink: 0 }}>
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
              sx={{
                bgcolor: BRAND.bgSection, borderRadius: '8px', px: '12px', py: '8px',
                fontSize: 14, color: '#030213', border: 'none', outline: 'none', cursor: 'pointer',
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Section label — fixed */}
      <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#717182', flexShrink: 0 }}>
        Resale Listings ({tickets.length})
      </Typography>

      {/* Scrollable grid */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: '2px' }}>
        {tickets.length === 0 ? (
          <Box sx={{ bgcolor: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', p: '40px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, color: '#717182' }}>No listings found</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', pb: '4px' }}>
            {tickets.map((ticket) => (
              <ResaleCard key={ticket.id} ticket={ticket} onApprove={onApprove} onReject={onReject} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
