'use client';

import { store, persistor } from '@/src/stores/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SnackbarProvider } from '@/src/hooks/ui/useSnackbar';
import { CircularProgress, Box } from '@mui/material';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
            }}
          >
            <CircularProgress />
          </Box>
        }
        persistor={persistor}
      >
        <SnackbarProvider>{children}</SnackbarProvider>
      </PersistGate>
    </Provider>
  );
}
