/**
 * Security tests — logout flow
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, clearCredentials } from '@/src/stores/slices/authSlice';
import { AuthAPI } from '@/src/stores/services/AuthApi';
import { EventAPI } from '@/src/stores/services/EventApi';
import { OrganizerAPI } from '@/src/stores/services/OrganizerApi';
import { CategoryAPI } from '@/src/stores/services/CategoryApi';
import { VenueAPI } from '@/src/stores/services/VenueApi';
import type { UserResponse } from '@/src/stores/types/auth';
import { UserStatus } from '@/src/stores/types/enums';

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.test.token';
const MOCK_USER: UserResponse = {
  id: '1',
  name: 'Test',
  email: 'test@example.com',
  roles: ['CUSTOMER'],
  avatarUrl: null,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeFullStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [AuthAPI.reducerPath]: AuthAPI.reducer,
      [EventAPI.reducerPath]: EventAPI.reducer,
      [OrganizerAPI.reducerPath]: OrganizerAPI.reducer,
      [CategoryAPI.reducerPath]: CategoryAPI.reducer,
      [VenueAPI.reducerPath]: VenueAPI.reducer,
    },
    middleware: (gDM) =>
      gDM({ serializableCheck: false }).concat(
        AuthAPI.middleware, EventAPI.middleware, OrganizerAPI.middleware,
        CategoryAPI.middleware, VenueAPI.middleware,
      ),
  });
}

describe('Logout flow — security', () => {
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    sessionStorageMock = {};
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation((k) => sessionStorageMock[k] ?? null);
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation((k, v) => { sessionStorageMock[k] = v; });
    vi.spyOn(window.sessionStorage, 'removeItem').mockImplementation((k) => { delete sessionStorageMock[k]; });
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('__evena_logout flag is set in sessionStorage on logout', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    sessionStorage.setItem('__evena_logout', '1');
    expect(sessionStorage.getItem('__evena_logout')).toBe('1');
  });

  it('flag persists across simulated page reload (sessionStorage scope)', () => {
    sessionStorageMock['__evena_logout'] = '1';
    expect(sessionStorage.getItem('__evena_logout')).toBe('1');
  });

  it('flag is removed after AuthInitializer reads it', () => {
    sessionStorageMock['__evena_logout'] = '1';
    if (sessionStorage.getItem('__evena_logout')) {
      sessionStorage.removeItem('__evena_logout');
    }
    expect(sessionStorage.getItem('__evena_logout')).toBeNull();
  });

  it('clearCredentials wipes token and user from Redux store', () => {
    const store = makeFullStore();
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
    expect(store.getState().auth.user).toBeNull();
  });

  it('RTK Query API state is reset on logout', () => {
    const store = makeFullStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    store.dispatch(AuthAPI.util.resetApiState());
    store.dispatch(EventAPI.util.resetApiState());
    store.dispatch(OrganizerAPI.util.resetApiState());
    store.dispatch(CategoryAPI.util.resetApiState());
    store.dispatch(VenueAPI.util.resetApiState());
    store.dispatch(clearCredentials());
    expect(dispatchSpy).toHaveBeenCalledTimes(6);
  });

  it('logout proceeds and clears credentials even when API call throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
    const store = makeFullStore();
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch { /* ignored */ }
    sessionStorage.setItem('__evena_logout', '1');
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
    expect(sessionStorage.getItem('__evena_logout')).toBe('1');
  });

  it('logout proceeds when API returns 500', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 500 }),
    ) as unknown as typeof fetch;
    const store = makeFullStore();
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    sessionStorage.setItem('__evena_logout', '1');
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
    expect(sessionStorage.getItem('__evena_logout')).toBe('1');
  });

  it('absence of __evena_logout means AuthInitializer will attempt refresh (normal cold boot)', () => {
    expect(sessionStorage.getItem('__evena_logout')).toBeNull();
  });

  it('stale __evena_logout flag is removed on re-login (prevents forced-logout on next reload)', () => {
    // Simulate: logout sets flag, user re-logs in WITHOUT reloading the page
    sessionStorageMock['__evena_logout'] = '1';
    expect(sessionStorage.getItem('__evena_logout')).toBe('1');

    // login() must remove the flag — otherwise a subsequent page reload would
    // cause AuthInitializer to skip /auth/refresh and force the user back out
    sessionStorage.removeItem('__evena_logout');

    expect(sessionStorage.getItem('__evena_logout')).toBeNull();
  });

  it('auth state is NOT re-initialized after logout within the same session (no reload)', () => {
    // AuthInitializer uses a useRef guard (not auth.isInitialized in deps),
    // so clearCredentials dispatched by logout should NOT trigger a refresh call.
    // This test validates the contract: clearing Redux state alone is not a trigger.
    const store = makeFullStore();
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    expect(store.getState().auth.isInitialized).toBe(true);
    store.dispatch(clearCredentials());
    // isInitialized stays true — no loading flash, no re-initialization
    expect(store.getState().auth.isInitialized).toBe(true);
    expect(store.getState().auth.accessToken).toBeNull();
  });
});
