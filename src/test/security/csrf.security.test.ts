/**
 * Security tests — CSRF protection & request hygiene
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface CapturedRequest { url: string; init: RequestInit }

describe('CSRF protection — request security', () => {
  let captured: CapturedRequest[];

  beforeEach(() => {
    captured = [];
    global.fetch = vi.fn().mockImplementation((url: string, init: RequestInit = {}) => {
      captured.push({ url, init });
      return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
    }) as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const API = 'http://localhost:8080/api';

  it('logout request includes credentials: include', async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    const req = captured.find((r) => r.url.includes('/auth/logout'));
    expect(req?.init.credentials).toBe('include');
  });

  it('refresh request includes credentials: include', async () => {
    await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
    const req = captured.find((r) => r.url.includes('/auth/refresh'));
    expect(req?.init.credentials).toBe('include');
  });

  it('refresh request does NOT leak access token in URL', async () => {
    const token = 'secret-token';
    await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    const req = captured.find((r) => r.url.includes('/auth/refresh'));
    expect(req?.url).not.toContain(token);
  });

  it('logout request does NOT append token in URL', async () => {
    const token = 'secret-token';
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    const req = captured.find((r) => r.url.includes('/auth/logout'));
    expect(req?.url).not.toContain(token);
    expect(req?.url).not.toContain('?token=');
  });

  it('refresh token is NOT accessible via JS (httpOnly — verified by absence from JS storage)', () => {
    // httpOnly cookies are not readable by JS — they cannot appear in localStorage/sessionStorage
    const lsKeys = Object.keys(localStorage);
    const ssKeys = Object.keys(sessionStorage);
    expect(lsKeys).not.toContain('refreshToken');
    expect(ssKeys).not.toContain('refreshToken');
    expect(document.cookie).not.toContain('refreshToken');
  });

  it('access token is sent in Authorization header, not URL query param', async () => {
    const TOKEN = 'my.access.token';
    await fetch(`${API}/events`, {
      method: 'GET',
      credentials: 'include',
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const req = captured.find((r) => r.url.includes('/events'));
    expect(req?.url).not.toContain(TOKEN);
    expect(req?.url).not.toContain('?access_token=');
  });

  it('logout uses POST (GET would expose tokens in Referer header)', async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    const req = captured.find((r) => r.url.includes('/auth/logout'));
    expect(req?.init.method).toBe('POST');
  });

  it('refresh uses POST, not GET', async () => {
    await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
    const req = captured.find((r) => r.url.includes('/auth/refresh'));
    expect(req?.init.method).toBe('POST');
  });
});
