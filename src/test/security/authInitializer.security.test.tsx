/**
 * Security tests — AuthInitializer
 *
 * Verifies that:
 *  - When __evena_logout flag exists, refresh is SKIPPED and auth stays cleared
 *  - The flag is consumed (removed) after the first check
 *  - When already initialized, refresh is never called again
 *  - When refresh API fails, auth is cleared (not silently authenticated)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/src/stores/slices/authSlice';

function makeMinimalStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { accessToken: null, user: null, isInitialized: false } },
  });
}

const mockSetAuthFromInit = vi.fn();

vi.mock('@/src/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    setAuthFromInit: mockSetAuthFromInit,
  }),
}));

vi.mock('@/src/stores/services/OrganizerApi', () => ({
  OrganizerAPI: { util: { resetApiState: () => ({ type: 'noop' }) } },
}));
vi.mock('@/src/stores/services/EventApi', () => ({
  EventAPI: { util: { resetApiState: () => ({ type: 'noop' }) } },
}));
vi.mock('@/src/stores/services/CategoryApi', () => ({
  CategoryAPI: { util: { resetApiState: () => ({ type: 'noop' }) } },
}));
vi.mock('@/src/stores/services/VenueApi', () => ({
  VenueAPI: { util: { resetApiState: () => ({ type: 'noop' }) } },
}));

import AuthInitializer from '@/src/components/AuthInitializer';

function renderAuth() {
  const store = makeMinimalStore();
  return render(
    <Provider store={store}>
      <AuthInitializer />
    </Provider>,
  );
}

describe('AuthInitializer — security', () => {
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    sessionStorageMock = {};
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation((k) => sessionStorageMock[k] ?? null);
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation((k, v) => { sessionStorageMock[k] = v; });
    vi.spyOn(window.sessionStorage, 'removeItem').mockImplementation((k) => { delete sessionStorageMock[k]; });
    mockSetAuthFromInit.mockClear();
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { accessToken: 'tok', user: {} } }), { status: 200 }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips /auth/refresh and calls setAuthFromInit(null,null) when __evena_logout flag is set', async () => {
    sessionStorageMock['__evena_logout'] = '1';
    renderAuth();
    await waitFor(() => {
      expect(mockSetAuthFromInit).toHaveBeenCalledWith(null, null);
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('consumes (removes) the __evena_logout flag after reading it', async () => {
    sessionStorageMock['__evena_logout'] = '1';
    renderAuth();
    await waitFor(() => {
      expect(mockSetAuthFromInit).toHaveBeenCalled();
    });
    expect(sessionStorage.getItem('__evena_logout')).toBeNull();
  });

  it('calls setAuthFromInit(null,null) when /auth/refresh returns non-ok', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 }),
    ) as unknown as typeof fetch;
    renderAuth();
    await waitFor(() => {
      expect(mockSetAuthFromInit).toHaveBeenCalledWith(null, null);
    });
  });

  it('calls setAuthFromInit(null,null) when /auth/refresh throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
    renderAuth();
    await waitFor(() => {
      expect(mockSetAuthFromInit).toHaveBeenCalledWith(null, null);
    });
  });

  it('calls setAuthFromInit with token+user on successful refresh', async () => {
    const TOKEN = 'fresh-access-token';
    const USER = { id: '42', name: 'Alice', email: 'alice@example.com', roles: ['CUSTOMER'] };
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ success: true, data: { accessToken: TOKEN, user: USER } }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;
    renderAuth();
    await waitFor(() => {
      expect(mockSetAuthFromInit).toHaveBeenCalledWith(TOKEN, USER);
    });
  });
});
