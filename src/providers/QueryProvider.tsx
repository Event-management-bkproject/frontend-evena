'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data được coi là "stale" sau 1 phút
            staleTime: 60 * 1000, // 1 phút
            // Data được giữ trong cache 5 phút
            gcTime: 5 * 60 * 1000, // 5 phút (thay thế cacheTime)
            // Retry 1 lần nếu request fail
            retry: 1,
            // Không tự động refetch khi focus vào window
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools chỉ hiện trong development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
