// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token xác thực là bắt buộc' }, { status: 400 });
    }

    // Gọi backend Spring Boot endpoint
    const res = await fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Xác thực email thất bại' }, { status: res.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || 'Xác thực email thành công',
        user: data.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Verify email API error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi xác thực email' }, { status: 500 });
  }
}
