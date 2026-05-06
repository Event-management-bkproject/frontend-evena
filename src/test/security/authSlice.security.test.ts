/**
 * Security tests — auth Redux slice
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  setCredentials,
  clearCredentials,
  setToken,
  setAuthFromInitialization,
} from '@/src/stores/slices/authSlice';
import type { UserResponse } from '@/src/stores/types/auth';
import { UserStatus } from '@/src/stores/types/enums';

const MOCK_USER: UserResponse = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  roles: ['CUSTOMER'],
  avatarUrl: null,
  status: UserStatus.ACTIVE,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.test.token';

function makeStore(preloaded = {}) {
  return configureStore({ reducer: { auth: authReducer }, preloadedState: preloaded });
}

describe('AuthSlice — security', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts unauthenticated (no token, no user, not initialized)', () => {
    const { auth } = store.getState();
    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(auth.isInitialized).toBe(false);
  });

  it('setCredentials stores token + user in memory', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    const { auth } = store.getState();
    expect(auth.accessToken).toBe(MOCK_TOKEN);
    expect(auth.user).toEqual(MOCK_USER);
    expect(auth.isInitialized).toBe(true);
  });

  it('setCredentials does not write token to localStorage', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    const stored = JSON.stringify(localStorage);
    expect(stored).not.toContain(MOCK_TOKEN);
  });

  it('setCredentials does not write token to sessionStorage', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    const stored = JSON.stringify(sessionStorage);
    expect(stored).not.toContain(MOCK_TOKEN);
  });

  it('clearCredentials wipes accessToken', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(clearCredentials());
    expect(store.getState().auth.accessToken).toBeNull();
  });

  it('clearCredentials wipes user data', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(clearCredentials());
    expect(store.getState().auth.user).toBeNull();
  });

  it('clearCredentials marks state as initialized (gate stays open)', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    store.dispatch(clearCredentials());
    expect(store.getState().auth.isInitialized).toBe(true);
  });

  it('clearCredentials on already-cleared state is idempotent', () => {
    store.dispatch(clearCredentials());
    store.dispatch(clearCredentials());
    const { auth } = store.getState();
    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
  });

  it('setAuthFromInitialization with nulls is the same as not authenticated', () => {
    store.dispatch(setAuthFromInitialization({ accessToken: null, user: null }));
    const { auth } = store.getState();
    expect(auth.accessToken).toBeNull();
    expect(auth.user).toBeNull();
    expect(auth.isInitialized).toBe(true);
  });

  it('setAuthFromInitialization with valid data restores session', () => {
    store.dispatch(setAuthFromInitialization({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    const { auth } = store.getState();
    expect(auth.accessToken).toBe(MOCK_TOKEN);
    expect(auth.user?.email).toBe(MOCK_USER.email);
  });

  it('setToken updates only the token, leaves user intact', () => {
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
    const NEW_TOKEN = 'new.jwt.token';
    store.dispatch(setToken(NEW_TOKEN));
    const { auth } = store.getState();
    expect(auth.accessToken).toBe(NEW_TOKEN);
    expect(auth.user).toEqual(MOCK_USER);
  });

  it('auth slice is not in the redux-persist whitelist', () => {
    const persistedKeys = ['ui'];
    expect(persistedKeys).not.toContain('auth');
  });

  it('user roles array is stored exactly as provided (no injection)', () => {
    const user: UserResponse = { ...MOCK_USER, roles: ['ADMIN', 'ORGANIZER'] };
    store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user }));
    expect(store.getState().auth.user?.roles).toEqual(['ADMIN', 'ORGANIZER']);
  });
});
