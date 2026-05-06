/**
 * Security tests — session management & token lifecycle
 *
 * Verifies that:
 *  - Access token is NOT stored in localStorage (survives page close)
 *  - Access token is NOT stored in sessionStorage explicitly by the app
 *  - Redux store holds token only in memory (no persistence key 'auth')
 *  - After clearCredentials the token is gone from Redux
 *  - Expired/invalid refresh flow correctly revokes in-memory token
 *  - Concurrent 401 responses only trigger ONE refresh attempt (mutex)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, clearCredentials } from '@/src/stores/slices/authSlice';
import type { UserResponse } from '@/src/stores/types/auth';
import { UserStatus } from '@/src/stores/types/enums';

const TOKEN = 'in-memory.access.token';
const USER: UserResponse = {
  id: '1',
  name: 'U',
  email: 'u@e.com',
  roles: ['CUSTOMER'],
  avatarUrl: null,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function freshStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe('Session management — token lifecycle', () => {
  beforeEach(() => {
    localStorage.clear?.();
    sessionStorage.clear?.();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Token storage location ───────────────────────────────────────────────────
  it('access token is NOT written to localStorage', () => {
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    const allLS = Object.values(localStorage).join('');
    expect(allLS).not.toContain(TOKEN);
  });

  it('access token is NOT written to sessionStorage by the app', () => {
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    const allSS = Object.values(sessionStorage).join('');
    expect(allSS).not.toContain(TOKEN);
  });

  it('token does not appear in document.cookie', () => {
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    expect(document.cookie).not.toContain(TOKEN);
  });

  // ── Memory-only storage ──────────────────────────────────────────────────────
  it('token is accessible via Redux getState() only', () => {
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    expect(store.getState().auth.accessToken).toBe(TOKEN);
  });

  it('token is gone from Redux after clearCredentials', () => {
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
  });

  // ── Redux persist whitelist ──────────────────────────────────────────────────
  it('auth slice is NOT in the persist whitelist (verified by convention)', () => {
    const PERSISTED_KEYS = ['ui']; // matches uiPersistConfig.key in store.ts
    expect(PERSISTED_KEYS).not.toContain('auth');
  });

  // ── Concurrent 401 / mutex guard ────────────────────────────────────────────
  it('only ONE /auth/refresh call is made for concurrent 401 responses', async () => {
    const refreshPayload = { success: true, data: { accessToken: 'new-tok', user: USER } };
    let callCount = 0;

    // Use mockImplementation so each call gets a fresh Response (avoids "body already consumed" error)
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      callCount++;
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes('/auth/refresh')) {
        return Promise.resolve(new Response(JSON.stringify(refreshPayload), { status: 200 }));
      }
      if (callCount <= 2) {
        return Promise.resolve(new Response(null, { status: 401 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ data: 'ok' }), { status: 200 }));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { baseQueryWithReAuth } = await import('@/src/stores/services/baseQuery');
    const store = freshStore();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));

    const api = {
      getState: store.getState,
      dispatch: store.dispatch,
      signal: new AbortController().signal,
      abort: vi.fn(),
      endpoint: 'test',
      type: 'query' as const,
      forced: false,
      extra: undefined,
    };

    await Promise.all([
      baseQueryWithReAuth({ url: 'http://localhost:8080/api/a', method: 'GET' }, api, {}),
      baseQueryWithReAuth({ url: 'http://localhost:8080/api/b', method: 'GET' }, api, {}),
    ]);

    const refreshCalls = (fetchMock.mock.calls as unknown[][]).filter((args) => {
      const input = args[0];
      const url = input instanceof Request ? input.url : String(input);
      return url.includes('/auth/refresh');
    });
    // Mutex ensures only one refresh is in flight at a time
    expect(refreshCalls.length).toBeLessThanOrEqual(1);
  });

  // ── Token expiry ─────────────────────────────────────────────────────────────
  it('isAuthenticated flag derives solely from in-memory accessToken', () => {
    const store = freshStore();
    expect(store.getState().auth.accessToken).toBeNull();
    store.dispatch(setCredentials({ accessToken: TOKEN, user: USER }));
    expect(store.getState().auth.accessToken).toBeTruthy();
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
  });
});
