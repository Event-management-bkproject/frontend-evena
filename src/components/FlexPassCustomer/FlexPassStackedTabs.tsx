'use client';

import { Box } from '@mui/material';
import { MarketplaceTab } from './MarketplaceTab';
import { SellTab } from './SellTab';
import { MyListingsTab } from './MyListingsTab';
import {
  TabType,
  CARD_H, TAB_W, TAB_H, R, BORDER,
  TAB_Y, CARDS, buildCardPath,
} from './stackedTabsConstants';

interface Props {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  cardW: number;
}

export function FlexPassStackedTabs({ activeTab, setActiveTab, cardW }: Props) {
  return (
    <>
      <style>{`
        @keyframes fpSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .fp-tab-btn:hover { transform: scale(1.06); }
      `}</style>

      <Box sx={{ position: 'relative', width: TAB_W + cardW, height: CARD_H }}>

        {/* SVG card shapes (visual only, no pointer events) */}
        {CARDS.map((card, idx) => {
          const isActive = activeTab === card.value;
          const tabY = TAB_Y[idx];
          return (
            <Box
              key={`card-${card.value}`}
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: isActive ? 10 : idx + 1,
                pointerEvents: 'none',
                filter: isActive
                  ? 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))'
                  : 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
                transition: 'filter 0.3s ease',
              }}
            >
              <svg
                width={TAB_W + cardW}
                height={CARD_H}
                viewBox={`0 0 ${TAB_W + cardW} ${CARD_H}`}
                style={{ display: 'block' }}
              >
                <defs>
                  <linearGradient id={`fp-grad-${card.value}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={card.color} />
                    <stop offset="100%" stopColor={card.accent} />
                  </linearGradient>
                </defs>
                <path
                  d={buildCardPath(cardW, tabY)}
                  fill={isActive ? `url(#fp-grad-${card.value})` : card.accent}
                  opacity={isActive ? 1 : 0.4}
                  style={{ transition: 'opacity 0.3s ease' }}
                />
              </svg>

              {isActive && (
                <Box
                  key={`content-${card.value}`}
                  sx={{
                    position: 'absolute',
                    top: BORDER,
                    left: TAB_W + BORDER,
                    right: BORDER,
                    bottom: BORDER,
                    borderRadius: `${R - BORDER}px`,
                    bgcolor: 'white',
                    overflow: 'auto',
                    animation: 'fpSlideIn 0.35s ease-out',
                    p: { xs: 2, sm: 3 },
                    pointerEvents: 'auto',
                  }}
                >
                  {card.value === 'marketplace' && <MarketplaceTab />}
                  {card.value === 'sell'        && <SellTab />}
                  {card.value === 'mine'        && <MyListingsTab />}
                </Box>
              )}
            </Box>
          );
        })}

        {/* Tab buttons — always above cards (z-index 20) */}
        {CARDS.map((card, idx) => {
          const isActive = activeTab === card.value;
          return (
            <Box
              key={`tab-${card.value}`}
              component="button"
              className="fp-tab-btn"
              onClick={() => setActiveTab(card.value)}
              sx={{
                position: 'absolute',
                left: 0,
                top: TAB_Y[idx],
                width: TAB_W,
                height: TAB_H,
                zIndex: 20,
                background: 'none',
                border: 'none',
                p: 0,
                cursor: isActive ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                fontFamily: 'inherit',
                letterSpacing: '0.04em',
                transition: 'color 0.3s ease',
                whiteSpace: 'nowrap',
              }}>
                {card.label}
              </span>
            </Box>
          );
        })}

      </Box>
    </>
  );
}
