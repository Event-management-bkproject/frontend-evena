export type TabType = 'buy' | 'resell' | 'mine';

export const TABS: { value: TabType; label: string }[] = [
  { value: 'buy',    label: 'Buy Tickets' },
  { value: 'resell', label: 'Resale Market' },
  { value: 'mine',   label: 'My Tickets' },
];

export const HOW_IT_WORKS = [
  'Buyer selects FlexPass at checkout — ticket is linked to eKYC identity',
  'If plans change, list it on the internal marketplace — max +20% above face value',
  'New buyer verifies ID before receiving the ticket — no further transfers allowed',
  'If listing expires unsold → 70–80% refund depending on tier',
];

export function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫';
}
