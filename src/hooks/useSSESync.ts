'use client';

import { useSSE } from '@/src/providers/SSEProvider';

// All cache invalidation is handled centrally in SSEProvider.tsx (SC-17 / SSE-014).
// This hook only exposes connection status for the dev SSE indicator in SSESync.tsx.
export const useSSESync = () => {
  const { isConnected } = useSSE();
  return { isConnected };
};
