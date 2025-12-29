'use client';

import { useSSESync } from '../hooks/useSSESync';

/**
 * Component to enable SSE sync for pages that need real-time updates
 * Add this component to any page where you want automatic cache invalidation
 *
 * Example usage in a page:
 * ```tsx
 * export default function EventsPage() {
 *   return (
 *     <>
 *       <SSESync />
 *       <EventList />
 *     </>
 *   );
 * }
 * ```
 */
export const SSESync: React.FC = () => {
  const { isConnected } = useSSESync();

  // Optional: Show connection status in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          padding: '5px 10px',
          background: isConnected ? '#4caf50' : '#f44336',
          color: 'white',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 9999,
        }}
      >
        SSE: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    );
  }

  return null;
};
