'use client';

import { store, persistor } from '@/src/stores/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SnackbarProvider } from '@/src/hooks/ui/useSnackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        {/* PersistGate with no loading prop — UI rehydration (sidebar pref) is
            instantaneous and cosmetic; no reason to block the first render. */}
        <PersistGate loading={null} persistor={persistor}>
          <SnackbarProvider>{children}</SnackbarProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
