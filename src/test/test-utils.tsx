import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Import your slices
import authReducer from '@/src/stores/slices/authSlice';

// Import your APIs
import { AuthAPI } from '@/src/stores/services/AuthApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';

// Create a test store
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      [AuthAPI.reducerPath]: AuthAPI.reducer,
      [OrganizerAPI.reducerPath]: OrganizerAPI.reducer,
      [EventAPI.reducerPath]: EventAPI.reducer,
      [CategoryAPI.reducerPath]: CategoryAPI.reducer,
      [VenueAPI.reducerPath]: VenueAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(
        AuthAPI.middleware,
        OrganizerAPI.middleware,
        EventAPI.middleware,
        CategoryAPI.middleware,
        VenueAPI.middleware
      ),
    preloadedState,
  });
}

// Create MUI theme for tests
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

interface AllTheProvidersProps {
  children: ReactNode;
  store?: ReturnType<typeof createTestStore>;
}

// All providers wrapper
function AllTheProviders({ children, store }: AllTheProvidersProps) {
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      <ThemeProvider theme={testTheme}>{children}</ThemeProvider>
    </Provider>
  );
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, unknown>;
  store?: ReturnType<typeof createTestStore>;
}

function customRender(
  ui: ReactElement,
  { preloadedState, store, ...renderOptions }: CustomRenderOptions = {}
) {
  const testStore = store || createTestStore(preloadedState);

  function Wrapper({ children }: { children: ReactNode }) {
    return <AllTheProviders store={testStore}>{children}</AllTheProviders>;
  }

  return {
    store: testStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
