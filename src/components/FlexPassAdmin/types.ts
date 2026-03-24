export type ResaleStatus = 'pending' | 'approved' | 'rejected';
export type StatusFilter = 'all' | ResaleStatus;

export interface ResaleTicket {
  id: string;
  eventName: string;
  category: string;
  quantity: number;
  seller: { name: string; initials: string; rating: number; transactions: number };
  originalPrice: number;
  resalePrice: number;
  status: ResaleStatus;
  listedDate: string;
}

export const STATUS_CONFIG: Record<ResaleStatus, { label: string; bg: string; color: string; border: string }> = {
  pending:  { label: 'Pending',  bg: '#fffbeb', color: '#92400e', border: '#fcd34d' },
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
};

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const MOCK_TICKETS: ResaleTicket[] = [
  {
    id: '1',
    eventName: 'Coldplay World Tour — Hanoi',
    category: 'GA Zone · Green Tier',
    quantity: 2,
    seller: { name: 'T. Tran', initials: 'TT', rating: 4.9, transactions: 12 },
    originalPrice: 1200000,
    resalePrice: 1320000,
    status: 'pending',
    listedDate: '2 hours ago',
  },
  {
    id: '2',
    eventName: 'Coldplay World Tour — Hanoi',
    category: 'VIP Zone · Gold Tier',
    quantity: 1,
    seller: { name: 'L. Mai', initials: 'LM', rating: 5.0, transactions: 3 },
    originalPrice: 2800000,
    resalePrice: 2800000,
    status: 'pending',
    listedDate: '1 day ago',
  },
  {
    id: '3',
    eventName: 'Imagine Dragons Live',
    category: 'VIP Zone',
    quantity: 3,
    seller: { name: 'A. Nguyen', initials: 'AN', rating: 4.8, transactions: 8 },
    originalPrice: 1500000,
    resalePrice: 1650000,
    status: 'approved',
    listedDate: '3 days ago',
  },
  {
    id: '4',
    eventName: 'Bruno Mars Concert',
    category: 'GA Zone',
    quantity: 2,
    seller: { name: 'T. Le', initials: 'TL', rating: 3.5, transactions: 2 },
    originalPrice: 1000000,
    resalePrice: 1400000,
    status: 'rejected',
    listedDate: '5 days ago',
  },
  {
    id: '5',
    eventName: 'Radiohead Asia Tour',
    category: 'SVIP Zone',
    quantity: 1,
    seller: { name: 'K. Pham', initials: 'KP', rating: 4.7, transactions: 6 },
    originalPrice: 3500000,
    resalePrice: 3850000,
    status: 'pending',
    listedDate: '5 hours ago',
  },
  {
    id: '6',
    eventName: 'Coldplay World Tour — Hanoi',
    category: 'GA Zone · Green Tier',
    quantity: 4,
    seller: { name: 'M. Vo', initials: 'MV', rating: 4.6, transactions: 15 },
    originalPrice: 1200000,
    resalePrice: 1320000,
    status: 'approved',
    listedDate: '2 days ago',
  },
];

export function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫';
}
