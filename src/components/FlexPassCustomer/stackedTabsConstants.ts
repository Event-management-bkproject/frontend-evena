export type TabType = 'marketplace' | 'sell' | 'mine';

export const CARD_H  = 750;
export const TAB_W   = 112;
export const TAB_H   = 56;
export const TAB_GAP = 10;
export const R       = 20;
export const TR      = 12;
export const BORDER  = 3;

const START_Y = 24;
export const TAB_Y = [
  START_Y,
  START_Y + TAB_H + TAB_GAP,
  START_Y + 2 * (TAB_H + TAB_GAP),
];

export function buildCardPath(cardW: number, tabY: number) {
  const totalW = TAB_W + cardW;
  const tabBot = tabY + TAB_H;
  return `
    M ${TAB_W + R} 0
    L ${totalW - R} 0
    Q ${totalW} 0 ${totalW} ${R}
    L ${totalW} ${CARD_H - R}
    Q ${totalW} ${CARD_H} ${totalW - R} ${CARD_H}
    L ${TAB_W + R} ${CARD_H}
    Q ${TAB_W} ${CARD_H} ${TAB_W} ${CARD_H - R}
    L ${TAB_W} ${tabBot}
    L ${TR} ${tabBot}
    Q 0 ${tabBot} 0 ${tabBot - TR}
    L 0 ${tabY + TR}
    Q 0 ${tabY} ${TR} ${tabY}
    L ${TAB_W} ${tabY}
    L ${TAB_W} ${R}
    Q ${TAB_W} 0 ${TAB_W + R} 0
    Z
  `;
}

export const CARDS: Array<{ value: TabType; label: string; color: string; accent: string }> = [
  { value: 'marketplace', label: 'Marketplace', color: '#F36BF9', accent: '#C845D8' },
  { value: 'sell',        label: 'Sell',         color: '#6093FC', accent: '#3A6FE8' },
  { value: 'mine',        label: 'My Listings',  color: '#37437d', accent: '#2A3363' },
];
