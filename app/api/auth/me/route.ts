// app/api/auth/me/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  // Try to get token from Authorization header first (for RTK Query requests)
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  // Fallback to cookie if no Authorization header
  if (!token) {
    token = cookieStore.get('token')?.value;
  }

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  // Get refreshToken from cookie (needed for Redux state)
  const refreshToken = cookieStore.get('refreshToken')?.value;

  try {
    // Gọi API /api/auth/me từ backend với token
    const apiUrl = process.env.API_URL;
    const res = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // Nếu token không hợp lệ, clear cookie
      if (res.status === 401) {
        const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        response.cookies.set('token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
        });
        return response;
      }
      return NextResponse.json({ error: 'Failed to get user info' }, { status: res.status });
    }

    const userData = await res.json();

    return NextResponse.json({
      success: true,
      data: userData.data || userData,
      accessToken: token,
      refreshToken: refreshToken || null, // Include refreshToken for Redux state
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json({ error: 'Failed to get user info' }, { status: 500 });
  }
}
