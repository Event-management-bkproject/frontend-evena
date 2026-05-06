/**
 * Security tests — baseQueryWithReAuth
 *
 * Tests observable outcomes (Redux state changes) rather than raw fetch internals,
 * because RTK Query calls fetch(Request) not fetch(url, init).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearCredentials, setCredentials } from '@/src/stores/slices/authSlice';
import type { UserResponse } from '@/src/stores/types/auth';
import { UserStatus } from '@/src/stores/types/enums';
import { baseQueryWithReAuth } from '@/src/stores/services/baseQuery';

const MOCK_TOKEN = 'header.payload.sig';
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

function makeStore(withToken = false) {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (withToken) store.dispatch(setCredentials({ accessToken: MOCK_TOKEN, user: MOCK_USER }));
  return store;
}

function makeApi(store: ReturnType<typeof makeStore>) {
  return {
    getState: store.getState,
    dispatch: store.dispatch,
    signal: new AbortController().signal,
    abort: vi.fn(),
    endpoint: 'test',
    type: 'query' as const,
    forced: false,
    extra: undefined,
  };
}

// RTK Query's fetchBaseQuery calls fetch(new Request(url, init)) so we inspect
// the Request object from mock.calls[0][0]
function getRequestHeader(fetchMock: ReturnType<typeof vi.fn>, callIndex: number, header: string): string | null {
  const args = fetchMock.mock.calls[callIndex];
  if (!args) return null;
  const requestArg = args[0];
  if (requestArg instanceof Request) return requestArg.headers.get(header);
  // Fallback: plain (url, init) style
  const init: RequestInit = args[1] ?? {};
  if (!init.headers) return null;
  if (typeof (init.headers as Headers).get === 'function') return (init.headers as Headers).get(header);
  return (init.headers as Record<string, string>)[header] ?? null;
}

describe('baseQueryWithReAuth — security', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends Authorization header when access token is in Redux state', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: 'ok' }), { status: 200 }));
    const store = makeStore(true);
    await baseQueryWithReAuth({ url: 'http://localhost:8080/api/test', method: 'GET' }, makeApi(store), {});
    const authHeader = getRequestHeader(fetchMock, 0, 'Authorization');
    expect(authHeader).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('does NOT send Authorization header when unauthenticated', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: 'ok' }), { status: 200 }));
    const store = makeStore(false);
    await baseQueryWithReAuth({ url: 'http://localhost:8080/api/public', method: 'GET' }, makeApi(store), {});
    const authHeader = getRequestHeader(fetchMock, 0, 'Authorization');
    expect(authHeader).toBeFalsy();
  });

  it('clears Redux credentials when refresh endpoint returns 401', async () => {
    const store = makeStore(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    await baseQueryWithReAuth({ url: 'http://localhost:8080/api/secure', method: 'GET' }, makeApi(store), {});
    const cleared = dispatchSpy.mock.calls.some(
      ([action]: [unknown]) =>
        typeof action === 'object' && action !== null &&
        (action as { type: string }).type === clearCredentials().type,
    );
    expect(cleared).toBe(true);
  });

  it('clears Redux credentials when refresh response has success=false', async () => {
    const store = makeStore(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false }), { status: 200 }));
    await baseQueryWithReAuth({ url: 'http://localhost:8080/api/secure', method: 'GET' }, makeApi(store), {});
    const cleared = dispatchSpy.mock.calls.some(
      ([action]: [unknown]) =>
        typeof action === 'object' && action !== null &&
        (action as { type: string }).type === clearCredentials().type,
    );
    expect(cleared).toBe(true);
  });

  it('stores new access token in Redux after successful refresh', async () => {
    const store = makeStore(true);
    const NEW_TOKEN = 'fresh.new.token';
    const refreshPayload = { success: true, data: { accessToken: NEW_TOKEN, user: MOCK_USER } };
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshPayload), { status: 200 }))
      .mockResolvedValue(new Response(JSON.stringify({ data: 'retried' }), { status: 200 }));
    await baseQueryWithReAuth({ url: 'http://localhost:8080/api/secure', method: 'GET' }, makeApi(store), {});
    // After a successful refresh, the new access token must be in Redux state
    expect(store.getState().auth.accessToken).toBe(NEW_TOKEN);
  });
});
